// GAS Web App URL — deploy Code.js as web app, paste URL here
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwXinzBsH5UYAkFd744akbxSSWN1WrQhoaljuxBJwpLrLMRFSeulb-Rk6UmoQUunAxmHQ/exec';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const gasRes = await fetch(`${GAS_WEB_APP_URL}?action=sentlog`);
    const data = await gasRes.json();
    res.json(data);
  } catch (err) {
    console.error('GAS sentlog fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch sent log' });
  }
}
