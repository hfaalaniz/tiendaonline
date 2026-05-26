import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

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
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: { message: error.message } })
    return res.status(200).json({ data })
  }

  if (!validateAdmin(req)) {
    return res.status(401).json({ error: { message: 'Se requiere autenticación de administrador' } })
  }

  if (req.method === 'POST') {
    const { title, description, price, category, image_url, featured, active } = req.body
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{ title, description, price, category, image_url, featured, active: active ?? true }])
      .select()
      .single()
    if (error) return res.status(500).json({ error: { message: error.message } })
    return res.status(201).json({ data })
  }

  return res.status(405).json({ error: { message: 'Método no permitido' } })
}
