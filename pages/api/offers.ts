import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function supabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    const { data, error } = await supabase()
      .from('products')
      .select('*')
      .gt('discount_pct', 0)
      .order('discount_pct', { ascending: false })
    if (error) return Response.json({ error: { message: error.message } }, { status: 500 })
    return Response.json({ data })
  }

  const secret = req.headers.get('x-admin-secret')
  if (secret !== ADMIN_SECRET) {
    return Response.json({ error: { message: 'No autorizado' } }, { status: 401 })
  }

  if (req.method === 'PUT') {
    const { id, discount_pct } = await req.json()
    if (!id) return Response.json({ error: { message: 'Falta id' } }, { status: 400 })
    const pct = Math.min(Math.max(Number(discount_pct) || 0, 0), 100)
    const { data, error } = await supabase()
      .from('products')
      .update({ discount_pct: pct })
      .eq('id', id)
      .select()
      .single()
    if (error) return Response.json({ error: { message: error.message } }, { status: 500 })
    return Response.json({ data })
  }

  return Response.json({ error: { message: 'Método no permitido' } }, { status: 405 })
}
