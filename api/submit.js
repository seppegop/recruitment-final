import { randomUUID } from 'crypto';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eligibility, q1, q2, q3, q4_role, q4_industry, q4_employer, q5, q6, q7 } = req.body;
  const id = randomUUID();
  const created_at = new Date().toISOString();
  const allEligible = eligibility && eligibility.length === 5 && eligibility.every(Boolean);

  if (!allEligible) {
    return res.json({ id, eligible: false });
  }

  const exp = classifyExperience(q1);
  const usage = classifyUsage(q2, q3);
  const segmentLabel = exp.segment && usage ? `${exp.segment} × ${usage}` : null;

  const WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK;
  if (WEBHOOK) {
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
    try {
      await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(sheetPayload),
        redirect: 'follow',
      });
    } catch (err) {
      console.error('Google Sheet webhook error:', err.message);
    }
  }

  res.json({ id, eligible: true, segment: segmentLabel });
}
