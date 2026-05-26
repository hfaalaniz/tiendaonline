const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const products = [
  {
    title: 'Collar Serena',
    description: 'Collar con cadena dorada y colgante de perla natural.',
    price: 35.9,
    category: 'Collares',
    image_url: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    title: 'Aros Luna',
    description: 'Aros minimalistas con detalle de media luna en acabado dorado.',
    price: 24.5,
    category: 'Aros',
    image_url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    title: 'Pulsera Aura',
    description: 'Pulsera elástica con cristales y charms en tonos crema.',
    price: 18.0,
    category: 'Pulseras',
    image_url: 'https://images.unsplash.com/photo-1518509562900-0d99b0d0c0d3?auto=format&fit=crop&w=900&q=80',
    featured: false
  },
  {
    title: 'Anillo Belleza',
    description: 'Anillo ajustable en dorado con piedra central estilo vintage.',
    price: 22.0,
    category: 'Anillos',
    image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    featured: false
  },
  {
    title: 'Pack Noche',
    description: 'Set de aros y collar con diseño elegante para eventos especiales.',
    price: 58.0,
    category: 'Sets',
    image_url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    title: 'Bolso Clásico',
    description: 'Mini bolso de mano crema con asa dorada y cierre metálico.',
    price: 79.9,
    category: 'Accesorios',
    image_url: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5d5?auto=format&fit=crop&w=900&q=80',
    featured: false
  }
]

async function seed() {
  console.log('Insertando datos semilla en Supabase...')
  const { data, error } = await supabase.from('products').insert(products)

  if (error) {
    console.error('Error al insertar productos:', error.message)
    process.exit(1)
  }

  console.log('Productos insertados:', data.length)
  process.exit(0)
}

seed()
