import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function supabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''

type BulkOperation =
  | { type: 'price_pct';     category: string; value: number }   // % sobre precio actual
  | { type: 'price_fixed';   category: string; value: number }   // precio fijo absoluto
  | { type: 'discount';      category: string; value: number }   // 0-100, 0 = quitar
  | { type: 'active';        category: string; value: boolean }
  | { type: 'featured';      category: string; value: boolean }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Método no permitido' }, { status: 405 })
  }

  const secret = req.headers.get('x-admin-secret')
  if (secret !== ADMIN_SECRET) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const op: BulkOperation = await req.json()
  if (!op?.type || !op?.category) {
    return Response.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const db = supabase()

  // Obtener productos de la categoría
  const { data: products, error: fetchError } = await db
    .from('products')
    .select('id, price')
    .eq('category', op.category)

  if (fetchError) return Response.json({ error: fetchError.message }, { status: 500 })
  if (!products?.length) return Response.json({ error: 'No hay productos en esa categoría', count: 0 }, { status: 404 })

  let updatePayload: Record<string, unknown> = {}

  if (op.type === 'price_pct') {
    // Actualizar precio individualmente (cada uno tiene precio distinto)
    const factor = 1 + op.value / 100
    const updates = products.map((p) =>
      db.from('products').update({ price: Math.max(0, +(p.price * factor).toFixed(2)) }).eq('id', p.id)
    )
    const results = await Promise.all(updates)
    const failed = results.filter((r) => r.error)
    if (failed.length) return Response.json({ error: 'Algunos productos no se actualizaron' }, { status: 500 })
    return Response.json({ ok: true, count: products.length })
  }

  if (op.type === 'price_fixed') {
    updatePayload = { price: Math.max(0, +Number(op.value).toFixed(2)) }
  } else if (op.type === 'discount') {
    updatePayload = { discount_pct: Math.min(100, Math.max(0, Math.round(Number(op.value)))) }
  } else if (op.type === 'active') {
    updatePayload = { active: Boolean(op.value) }
  } else if (op.type === 'featured') {
    updatePayload = { featured: Boolean(op.value) }
  }

  const { error } = await db
    .from('products')
    .update(updatePayload)
    .eq('category', op.category)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true, count: products.length })
}
