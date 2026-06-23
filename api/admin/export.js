export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'screener-admin-2024';
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ') || auth.slice(7) !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK;
  if (!WEBHOOK) {
    return res.status(404).json({ error: 'No data source configured' });
  }

  try {
    const response = await fetch(`${WEBHOOK}?action=read&key=${encodeURIComponent(ADMIN_PASSWORD)}`, {
      redirect: 'follow',
    });
    const data = await response.json();
    const rows = (data.rows || []).filter(r => r.eligible);

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
    res.send('﻿' + csvRows.join('\r\n'));
  } catch (err) {
    console.error('Failed to export:', err.message);
    res.status(500).json({ error: 'Failed to export responses' });
  }
}
