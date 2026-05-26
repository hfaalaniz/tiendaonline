// node scripts/migrate-active.js
const https = require('https')

const PROJECT_REF = 'xprqzjxwcqfaahmxngch'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcnF6anh3Y3FmYWFobXhuZ2NoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgyMzgyNiwiZXhwIjoyMDk1Mzk5ODI2fQ.oZSzQOY-VbdryoZQhdzpNZWaIsXrqtAfuBQd8oeTQ0g'

// Supabase expone /pg endpoint sólo en planes Pro.
// Intentamos el endpoint de SQL de la REST API via función pg_catalog trick.
// Si falla, mostramos las instrucciones manuales.

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

async function tryAddColumn() {
  // Intentar via Supabase DB REST con función sql (disponible en algunos planes)
  const sql = 'ALTER TABLE products ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;'
  const body = JSON.stringify({ query: sql })

  const res = await request({
    hostname: `${PROJECT_REF}.supabase.co`,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
  }, body)

  return res
}

async function verifyColumn() {
  const body = JSON.stringify({ id: '00000000-0000-0000-0000-000000000000' })
  const res = await request({
    hostname: `${PROJECT_REF}.supabase.co`,
    path: '/rest/v1/products?select=id,active&limit=1',
    method: 'GET',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
  }, null)
  return res
}

async function run() {
  console.log('Verificando columna "active"...\n')

  const check = await verifyColumn()

  if (check.status === 200) {
    console.log('✓ La columna "active" YA EXISTE en la tabla products.')
    console.log('  Datos:', check.body.slice(0, 200))
    return
  }

  console.log('La columna "active" no existe (error', check.status, ')')
  console.log('Intentando agregarla via RPC...')

  const res = await tryAddColumn()
  console.log('Respuesta RPC:', res.status, res.body.slice(0, 300))

  if (res.status === 200 || res.status === 204) {
    console.log('\n✓ Columna "active" creada exitosamente.')
    console.log('  Todos los productos existentes tienen active = true por defecto.')
  } else {
    console.log('\n✗ No se pudo crear automáticamente (plan Free no permite RPC DDL).')
    printManual()
  }
}

function printManual() {
  console.log('\n─────────────────────────────────────────────────────')
  console.log('INSTRUCCIONES PARA CREAR LA COLUMNA MANUALMENTE:')
  console.log('─────────────────────────────────────────────────────')
  console.log('')
  console.log('1. Abrí el SQL Editor de Supabase:')
  console.log('   https://supabase.com/dashboard/project/xprqzjxwcqfaahmxngch/sql/new')
  console.log('')
  console.log('2. Pegá y ejecutá este SQL:')
  console.log('')
  console.log('   ALTER TABLE products')
  console.log('     ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;')
  console.log('')
  console.log('3. Listo. Todos los productos existentes quedan con active = true.')
  console.log('─────────────────────────────────────────────────────')
}

run().catch(console.error)
