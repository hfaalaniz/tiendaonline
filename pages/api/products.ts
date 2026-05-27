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
      .order('created_at', { ascending: false })
    if (error) return Response.json({ error: { message: error.message } }, { status: 500 })
    return Response.json({ data })
  }

  const secret = req.headers.get('x-admin-secret')
  if (secret !== ADMIN_SECRET) {
    return Response.json({ error: { message: 'Se requiere autenticación de administrador' } }, { status: 401 })
  }

  if (req.method === 'POST') {
    const body = await req.json()
    const { title, description, price, category, image_url, featured, active, stock } = body
    const { data, error } = await supabase()
      .from('products')
      .insert([{ title, description, price, category, image_url, featured, active: active ?? true, stock: stock ?? 0 }])
      .select()
      .single()
    if (error) return Response.json({ error: { message: error.message } }, { status: 500 })
    return Response.json({ data }, { status: 201 })
  }

  return Response.json({ error: { message: 'Método no permitido' } }, { status: 405 })
}
