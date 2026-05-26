// node scripts/migrate-offers.js
// Agrega la columna discount_pct a la tabla products en Supabase.

const https = require('https')

const PROJECT_REF = 'xprqzjxwcqfaahmxngch'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcnF6anh3Y3FmYWFobXhuZ2NoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgyMzgyNiwiZXhwIjoyMDk1Mzk5ODI2fQ.oZSzQOY-VbdryoZQhdzpNZWaIsXrqtAfuBQd8oeTQ0g'

function get(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: `${PROJECT_REF}.supabase.co`,
      path, method: 'GET',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }))
    })
    req.on('error', reject); req.end()
  })
}

async function run() {
  const check = await get('/rest/v1/products?select=id,discount_pct&limit=1')
  if (check.status === 200) {
    console.log('✓ La columna "discount_pct" ya existe.')
    return
  }
  console.log('La columna "discount_pct" no existe aún.\n')
  console.log('Ejecutá este SQL en el SQL Editor de Supabase:')
  console.log('  https://supabase.com/dashboard/project/xprqzjxwcqfaahmxngch/sql/new\n')
  console.log('  ALTER TABLE products')
  console.log('    ADD COLUMN IF NOT EXISTS discount_pct numeric NOT NULL DEFAULT 0')
  console.log('    CONSTRAINT discount_pct_range CHECK (discount_pct >= 0 AND discount_pct <= 100);\n')
  console.log('  ALTER TABLE products')
  console.log('    ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;\n')
  console.log('(Podés ejecutar ambas juntas si todavía no creaste "active")')
}

run().catch(console.error)
