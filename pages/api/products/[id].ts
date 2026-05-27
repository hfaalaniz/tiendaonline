import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function supabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''

export default async function handler(req: Request, ctx: { params: { id: string } }): Promise<Response> {
  const id = ctx.params?.id
  if (!id) return Response.json({ error: { message: 'ID inválido' } }, { status: 400 })

  if (req.method === 'GET') {
    const { data, error } = await supabase()
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return Response.json({ error: { message: error.message } }, { status: 404 })
    return Response.json({ data })
  }

  const secret = req.headers.get('x-admin-secret')
  if (secret !== ADMIN_SECRET) {
    return Response.json({ error: { message: 'Se requiere autenticación de administrador' } }, { status: 401 })
  }

  if (req.method === 'PUT') {
    const body = await req.json()
    const { title, description, price, category, image_url, featured, active } = body
    const updateFields: Record<string, unknown> = { title, description, price, category, image_url, featured }
    if (active !== undefined) updateFields.active = active

    const { data, error } = await supabase()
      .from('products')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error && active !== undefined && error.message.includes('active')) {
      const { data: data2, error: error2 } = await supabase()
        .from('products')
        .update({ title, description, price, category, image_url, featured })
        .eq('id', id)
        .select()
        .single()
      if (error2) return Response.json({ error: { message: error2.message } }, { status: 500 })
      return Response.json({ data: data2 })
    }

    if (error) return Response.json({ error: { message: error.message } }, { status: 500 })
    return Response.json({ data })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase().from('products').delete().eq('id', id)
    if (error) return Response.json({ error: { message: error.message } }, { status: 500 })
    return Response.json({ data: { message: 'Producto eliminado' } })
  }

  return Response.json({ error: { message: 'Método no permitido' } }, { status: 405 })
}
