const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwXinzBsH5UYAkFd744akbxSSWN1WrQhoaljuxBJwpLrLMRFSeulb-Rk6UmoQUunAxmHQ/exec';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const gasRes = await fetch(`${GAS_WEB_APP_URL}?action=tasks`);
      const data = await gasRes.json();
      res.json(data);
    } catch (err) {
      console.error('GAS tasks fetch failed:', err);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const params = new URLSearchParams(req.query);
      const gasRes = await fetch(`${GAS_WEB_APP_URL}?action=toggleTask&${params}`);
      const data = await gasRes.json();
      res.json(data);
    } catch (err) {
      console.error('GAS toggleTask failed:', err);
      res.status(500).json({ error: 'Failed to toggle task' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
