import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

try { process.loadEnvFile(); } catch { /* no .env file locally, fine */ }

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

// ─── Employee data: via zoho-org-tree Supabase function ───────
// Direct Zoho self-fetch was retired 2026-09-01 — its refresh token's
// account got disabled org-side (Zoho error 7001) and silently returned
// zero employees. zoho-org-tree already has a working, properly-secreted
// Zoho connection, so we ride on that instead of re-authenticating our own.
const ZOHO_ORG_TREE_URL = 'https://riiisqzwbhlytogcjdmn.supabase.co/functions/v1/zoho-org-tree?format=raw';
const ALLOWED_EMPLOYEE_TYPES = ['FT', 'Contract'];
const ZOHO_MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function parseZohoDate(raw) {
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(String(raw || '').trim());
  if (!m || !(m[2] in ZOHO_MONTHS)) return '';
  const dd = String(Number(m[1])).padStart(2, '0');
  const mm = String(ZOHO_MONTHS[m[2]] + 1).padStart(2, '0');
  return `${m[3]}-${mm}-${dd}`;
}

function cleanManagerName(raw) {
  return String(raw || '').replace(/\s+\d+$/, '').trim();
}

async function fetchAllEmployees() {
  const res = await fetch(ZOHO_ORG_TREE_URL, {
    headers: { 'x-internal-secret': process.env.ZOHO_ORG_TREE_SECRET || '' },
  });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data.employees)) {
    throw new Error('zoho-org-tree fetch failed: ' + JSON.stringify(data).slice(0, 300));
  }

  return data.employees
    .filter((e) => ALLOWED_EMPLOYEE_TYPES.includes(e.employment_type))
    .map((e) => ({
      id: e.emp_id || e.email,
      name: `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Unknown',
      position: e.designation || '',
      startDate: parseZohoDate(e.date_of_joining),
      department: e.department || '',
      reportingTo: cleanManagerName(e.reporting_manager_raw),
    }));
}

// ─── API Routes ──────────────────────────────────────────────

app.get('/api/employees', requireAuth, async (req, res) => {
  try {
    const employees = await fetchAllEmployees();
    res.json(employees);
  } catch (err) {
    console.error('Failed to fetch employees:', err);
    res.status(500).json({ error: 'Failed to fetch employee data' });
  }
});

app.get('/api/tasks', requireAuth, async (req, res) => {
  try {
    const gasRes = await fetch(`${GAS_WEB_APP_URL}?action=tasks`);
    const data = await gasRes.json();
    res.json(data);
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', requireAuth, async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    const gasRes = await fetch(`${GAS_WEB_APP_URL}?action=toggleTask&${params}`);
    const data = await gasRes.json();
    res.json(data);
  } catch (err) {
    console.error('Failed to toggle task:', err);
    res.status(500).json({ error: 'Failed to toggle task' });
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
