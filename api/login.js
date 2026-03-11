const AUTH = { username: 'admin', password: 'admin2026' };

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  if (username === AUTH.username && password === AUTH.password) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}
