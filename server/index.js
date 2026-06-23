import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'screener-admin-2024';
const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK || 'https://script.google.com/macros/s/AKfycbxBiLQBHviqXYH7TyR_3JBXJdxukhBWS2n50yfGuYjipoq1JmYPmpBtyrlyGT4bfBwedg/exec';

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '..', 'dist')));
}

const dbPath = process.env.DB_PATH || join(__dirname, '..', 'data', 'responses.db');

import { mkdirSync } from 'fs';
mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    eligible INTEGER NOT NULL,
    experience_segment TEXT,
    usage_segment TEXT,
    segment_label TEXT,
    low_experience_flag INTEGER DEFAULT 0,
    q1 TEXT,
    q2 TEXT,
    q3 TEXT,
    q4_role TEXT,
    q4_industry TEXT,
    q4_employer TEXT,
    q5 TEXT,
    q6 TEXT,
    q7 TEXT,
    eligibility_responses TEXT
  )
`);

function classifyExperience(q1) {
  if (q1 === '1 to 3 years (Junior)') return { segment: 'Junior', flag: false };
  if (q1 === '3 to 7 years (Mid)') return { segment: 'Mid', flag: false };
  if (q1 === '8 or more years (Senior)') return { segment: 'Senior', flag: false };
  if (q1 === 'Less than 1 year') return { segment: 'Junior', flag: true };
  return { segment: null, flag: false };
}

function mapUsageLabel(answer) {
  if (!answer) return 0;
  if (answer.includes('(Light)')) return 1;
  if (answer.includes('(Regular)')) return 2;
  if (answer.includes('(Power)')) return 3;
  return 0;
}

const usageLabelNames = { 1: 'Light', 2: 'Regular', 3: 'Power' };

function classifyUsage(q2, q3) {
  const q2Level = mapUsageLabel(q2);
  const q3Level = mapUsageLabel(q3);
  const higher = Math.max(q2Level, q3Level);
  return usageLabelNames[higher] || null;
}

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ') || auth.slice(7) !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.post('/api/submit', (req, res) => {
  const { eligibility, q1, q2, q3, q4_role, q4_industry, q4_employer, q5, q6, q7 } = req.body;

  const id = randomUUID();
  const created_at = new Date().toISOString();

  const allEligible = eligibility && eligibility.length === 5 && eligibility.every(Boolean);

  if (!allEligible) {
    const stmt = db.prepare(`
      INSERT INTO responses (id, created_at, eligible, eligibility_responses)
      VALUES (?, ?, 0, ?)
    `);
    stmt.run(id, created_at, JSON.stringify(eligibility || []));
    return res.json({ id, eligible: false });
  }

  const exp = classifyExperience(q1);
  const usage = classifyUsage(q2, q3);
  const segmentLabel = exp.segment && usage ? `${exp.segment} × ${usage}` : null;

  const stmt = db.prepare(`
    INSERT INTO responses (id, created_at, eligible, experience_segment, usage_segment, segment_label,
      low_experience_flag, q1, q2, q3, q4_role, q4_industry, q4_employer, q5, q6, q7, eligibility_responses)
    VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id, created_at,
    exp.segment, usage, segmentLabel,
    exp.flag ? 1 : 0,
    q1, q2, q3,
    q4_role || '', q4_industry || '', q4_employer || '',
    JSON.stringify(q5 || []), q6 || '', q7 || '',
    JSON.stringify(eligibility)
  );

  if (GOOGLE_SHEET_WEBHOOK) {
    const sheetPayload = {
      id, created_at, eligible: true,
      segment_label: segmentLabel,
      experience_segment: exp.segment,
      usage_segment: usage,
      low_experience_flag: exp.flag,
      q1, q2, q3,
      q4_role: q4_role || '',
      q4_industry: q4_industry || '',
      q4_employer: q4_employer || '',
      q5: q5 || [],
      q6: q6 || '',
      q7: q7 || '',
    };
    fetch(GOOGLE_SHEET_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(sheetPayload),
      redirect: 'follow',
    }).catch(err => console.error('Google Sheet webhook error:', err.message));
  }

  res.json({ id, eligible: true, segment: segmentLabel });
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ token: ADMIN_PASSWORD });
  }
  res.status(401).json({ error: 'Invalid password' });
});

app.get('/api/admin/responses', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM responses ORDER BY created_at DESC').all();
  res.json(rows);
});

app.get('/api/admin/coverage', requireAdmin, (req, res) => {
  const rows = db.prepare(
    'SELECT experience_segment, usage_segment, COUNT(*) as count FROM responses WHERE eligible = 1 GROUP BY experience_segment, usage_segment'
  ).all();

  const target = {
    'Junior': { 'Light': 1, 'Regular': 1, 'Power': 1 },
    'Mid': { 'Light': 1, 'Regular': 2, 'Power': 1 },
    'Senior': { 'Light': 1, 'Regular': 1, 'Power': 1 },
  };

  const current = {};
  for (const row of rows) {
    if (!current[row.experience_segment]) current[row.experience_segment] = {};
    current[row.experience_segment][row.usage_segment] = row.count;
  }

  res.json({ target, current });
});

app.get('/api/admin/export', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM responses WHERE eligible = 1 ORDER BY created_at').all();

  const headers = [
    'id', 'created_at', 'segment_label', 'experience_segment', 'usage_segment',
    'low_experience_flag', 'q1', 'q2', 'q3', 'q4_role', 'q4_industry', 'q4_employer',
    'q5', 'q6', 'q7'
  ];

  const csvRows = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map(h => {
      let val = row[h] ?? '';
      val = String(val).replace(/"/g, '""');
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val}"`;
      }
      return val;
    });
    csvRows.push(values.join(','));
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="screener-responses.csv"');
  // BOM for Excel UTF-8 detection
  res.send('﻿' + csvRows.join('\r\n'));
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin password: ${ADMIN_PASSWORD}`);
});
