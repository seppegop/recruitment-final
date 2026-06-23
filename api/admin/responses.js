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
    return res.json([]);
  }

  try {
    const response = await fetch(`${WEBHOOK}?action=read&key=${encodeURIComponent(ADMIN_PASSWORD)}`, {
      redirect: 'follow',
    });
    const data = await response.json();
    res.json(data.rows || []);
  } catch (err) {
    console.error('Failed to read from Google Sheets:', err.message);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
}
