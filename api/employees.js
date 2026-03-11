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
  if (!data.access_token) throw new Error('Zoho token refresh failed');
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

  for (let page = 0; page < 50; page++) {
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

      if (d['Employeestatus'] !== 'Active' || d['Employee_type'] !== 'FT') continue;

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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = await getZohoAccessToken();
    const employees = await fetchAllEmployees(accessToken);
    res.json(employees);
  } catch (err) {
    console.error('Zoho fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch employee data' });
  }
}
