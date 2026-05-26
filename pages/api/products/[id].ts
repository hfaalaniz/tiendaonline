import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

type Data = {
  data?: unknown
  error?: { message: string }
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''

const validateAdmin = (req: NextApiRequest) => {
  const secret = req.headers['x-admin-secret'] as string | undefined
  return secret === ADMIN_SECRET
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { id } = req.query
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: { message: 'ID inválido' } })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return res.status(404).json({ error: { message: error.message } })
    return res.status(200).json({ data })
  }

  if (!validateAdmin(req)) {
    return res.status(401).json({ error: { message: 'Se requiere autenticación de administrador' } })
  }

  if (req.method === 'PUT') {
    const { title, description, price, category, image_url, featured, active } = req.body
    const updateFields: Record<string, unknown> = {
      title, description, price, category, image_url, featured,
    }
    if (active !== undefined) updateFields.active = active

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    // Si el error es por columna inexistente, reintentar sin el campo active
    if (error && active !== undefined && error.message.includes('active')) {
      const { data: data2, error: error2 } = await supabaseAdmin
        .from('products')
        .update({ title, description, price, category, image_url, featured })
        .eq('id', id)
        .select()
        .single()
      if (error2) return res.status(500).json({ error: { message: error2.message } })
      return res.status(200).json({ data: data2 })
    }

    if (error) return res.status(500).json({ error: { message: error.message } })
    return res.status(200).json({ data })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
    if (error) return res.status(500).json({ error: { message: error.message } })
    return res.status(200).json({ data: { message: 'Producto eliminado' } })
  }

  return res.status(405).json({ error: { message: 'Método no permitido' } })
}
