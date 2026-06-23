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
    return res.json({ target: {}, current: {} });
  }

  try {
    const response = await fetch(`${WEBHOOK}?action=read&key=${encodeURIComponent(ADMIN_PASSWORD)}`, {
      redirect: 'follow',
    });
    const data = await response.json();
    const rows = data.rows || [];

    const target = {
      'Junior': { 'Light': 1, 'Regular': 1, 'Power': 1 },
      'Mid': { 'Light': 1, 'Regular': 2, 'Power': 1 },
      'Senior': { 'Light': 1, 'Regular': 1, 'Power': 1 },
    };

    const current = {};
    for (const row of rows) {
      if (!row.eligible) continue;
      const exp = row.experience_segment;
      const usage = row.usage_segment;
      if (!exp || !usage) continue;
      if (!current[exp]) current[exp] = {};
      current[exp][usage] = (current[exp][usage] || 0) + 1;
    }

    res.json({ target, current });
  } catch (err) {
    console.error('Failed to read from Google Sheets:', err.message);
    res.status(500).json({ error: 'Failed to fetch coverage' });
  }
}
