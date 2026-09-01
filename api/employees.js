// Employee data: via zoho-org-tree Supabase function.
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
  const res = await fetch(ZOHO_ORG_TREE_URL);
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const employees = await fetchAllEmployees();
    res.json(employees);
  } catch (err) {
    console.error('Zoho fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch employee data' });
  }
}
