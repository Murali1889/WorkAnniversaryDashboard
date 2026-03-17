import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// ─── Simple Auth ─────────────────────────────────────────────
const AUTH = { username: 'admin', password: 'admin2026' };
const tokens = new Set();

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === AUTH.username && password === AUTH.password) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    tokens.add(token);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ─── GAS Web App URL (deploy Code.js as web app, paste URL here) ──
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwXinzBsH5UYAkFd744akbxSSWN1WrQhoaljuxBJwpLrLMRFSeulb-Rk6UmoQUunAxmHQ/exec';

// ─── Zoho Config ─────────────────────────────────────────────
const ZOHO = {
  clientId: '1000.06ZBOVAU3FXQ6SLJ4F1J90L1AVFQVG',
  clientSecret: '76cb03b8fe91727225ebfa990a14a30fd84af167a1',
  refreshToken: '1000.f956461bd33b213d375c565ed870e7c0.b09056a46ab23ce11e16e3f14a7c68c5',
  accountsUrl: 'https://accounts.zoho.in',
  apiBase: 'https://people.zoho.in/api',
};

async function getZohoAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: ZOHO.clientId,
    client_secret: ZOHO.clientSecret,
    refresh_token: ZOHO.refreshToken,
  });

  const res = await fetch(`${ZOHO.accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    body: params,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Zoho token refresh failed: ' + JSON.stringify(data));
  return data.access_token;
}

function formatZohoDate(dateStr) {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return '';
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function fetchAllEmployees(accessToken) {
  const employees = [];
  let index = 1;
  const limit = 200;
  const maxPages = 50;

  for (let page = 0; page < maxPages; page++) {
    const url = `${ZOHO.apiBase}/forms/employee/getRecords?sIndex=${index}&limit=${limit}`;
    const res = await fetch(url, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    });
    const raw = await res.json();
    const records = raw?.response?.result;
    if (!records || !Array.isArray(records) || records.length === 0) break;

    for (const rec of records) {
      const empId = Object.keys(rec)[0];
      const d = Array.isArray(rec[empId]) ? rec[empId][0] : rec[empId];
      if (!d) continue;

      const status = d['Employeestatus'] || '';
      const empType = d['Employee_type'] || '';

      if (status !== 'Active' || empType !== 'FT') continue;

      employees.push({
        id: d['EmployeeID'] || empId,
        name: ((d['FirstName'] || '') + ' ' + (d['LastName'] || '')).trim() || 'Unknown',
        position: d['Designation'] || '',
        startDate: formatZohoDate(d['Dateofjoining'] || ''),
        department: d['Department'] || '',
      });
    }

    if (records.length < limit) break;
    index += limit;
  }

  return employees;
}

// ─── API Routes ──────────────────────────────────────────────

app.get('/api/employees', requireAuth, async (req, res) => {
  try {
    const accessToken = await getZohoAccessToken();
    const employees = await fetchAllEmployees(accessToken);
    res.json(employees);
  } catch (err) {
    console.error('Failed to fetch employees:', err);
    res.status(500).json({ error: 'Failed to fetch employee data' });
  }
});

app.get('/api/sentlog', requireAuth, async (req, res) => {
  try {
    const gasRes = await fetch(`${GAS_WEB_APP_URL}?action=sentlog`);
    const data = await gasRes.json();
    res.json(data);
  } catch (err) {
    console.error('Failed to fetch sent log:', err);
    res.status(500).json({ error: 'Failed to fetch sent log' });
  }
});

// ─── Serve built frontend in production ──────────────────────
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
