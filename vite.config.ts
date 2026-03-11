import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'

// ─── Zoho Config ─────────────────────────────────────────────
const ZOHO = {
  clientId: '1000.06ZBOVAU3FXQ6SLJ4F1J90L1AVFQVG',
  clientSecret: '76cb03b8fe91727225ebfa990a14a30fd84af167a1',
  refreshToken: '1000.f956461bd33b213d375c565ed870e7c0.b09056a46ab23ce11e16e3f14a7c68c5',
  accountsUrl: 'https://accounts.zoho.in',
  apiBase: 'https://people.zoho.in/api',
}

const AUTH = { username: 'admin', password: 'admin2026' }
const tokens = new Set<string>()

async function getZohoAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: ZOHO.clientId,
    client_secret: ZOHO.clientSecret,
    refresh_token: ZOHO.refreshToken,
  })
  const res = await fetch(`${ZOHO.accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    body: params,
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Zoho token refresh failed')
  return data.access_token as string
}

function formatZohoDate(dateStr: string) {
  if (!dateStr) return ''
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return ''
  const yyyy = parsed.getFullYear()
  const mm = String(parsed.getMonth() + 1).padStart(2, '0')
  const dd = String(parsed.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function earliestDate(d: any): Date | null {
  const candidates = [
    d['Dateofjoining'],
    d['Contractor_Start_Date'],
    d['FTE_Start_Date'],
    d['Intern_Start_Date'],
  ]
  let earliest: Date | null = null
  for (const raw of candidates) {
    if (!raw) continue
    const parsed = new Date(raw)
    if (isNaN(parsed.getTime())) continue
    if (!earliest || parsed < earliest) earliest = parsed
  }
  return earliest
}

async function fetchAllEmployees(accessToken: string) {
  const employees: any[] = []
  let index = 1
  const limit = 200

  for (let page = 0; page < 50; page++) {
    const url = `${ZOHO.apiBase}/forms/employee/getRecords?sIndex=${index}&limit=${limit}`
    const res = await fetch(url, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    })
    const raw = await res.json()
    const records = raw?.response?.result
    if (!records || !Array.isArray(records) || records.length === 0) break

    for (const rec of records) {
      const empId = Object.keys(rec)[0]
      const d = Array.isArray(rec[empId]) ? rec[empId][0] : rec[empId]
      if (!d) continue

      if (d['Employeestatus'] !== 'Active' || d['Employee_type'] !== 'FT') continue

      const start = earliestDate(d)
      employees.push({
        id: d['EmployeeID'] || empId,
        name: ((d['FirstName'] || '') + ' ' + (d['LastName'] || '')).trim() || 'Unknown',
        position: d['Designation'] || '',
        startDate: start ? formatZohoDate(start.toISOString()) : formatZohoDate(d['Dateofjoining'] || ''),
        department: d['Department'] || '',
        reportingTo: d['Reporting_To'] || '',
      })
    }

    if (records.length < limit) break
    index += limit
  }

  return employees
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => resolve(body))
  })
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function apiPlugin(): Plugin {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url === '/api/login' && req.method === 'POST') {
          const body = JSON.parse(await readBody(req))
          if (body.username === AUTH.username && body.password === AUTH.password) {
            const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
            tokens.add(token)
            sendJson(res, 200, { token })
          } else {
            sendJson(res, 401, { error: 'Invalid credentials' })
          }
          return
        }

        if (req.url === '/api/employees' && req.method === 'GET') {
          const authHeader = req.headers.authorization || ''
          const token = authHeader.replace('Bearer ', '')
          if (!token || !tokens.has(token)) {
            sendJson(res, 401, { error: 'Unauthorized' })
            return
          }
          try {
            const accessToken = await getZohoAccessToken()
            const employees = await fetchAllEmployees(accessToken)
            sendJson(res, 200, employees)
          } catch (err: any) {
            console.error('Zoho fetch failed:', err)
            sendJson(res, 500, { error: 'Failed to fetch employee data' })
          }
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    apiPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
