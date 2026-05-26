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

// GET  — lista productos con oferta activa (discount_pct > 0)
// PUT  — actualiza discount_pct de uno o varios productos (admin)
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .gt('discount_pct', 0)
      .order('discount_pct', { ascending: false })
    if (error) return res.status(500).json({ error: { message: error.message } })
    return res.status(200).json({ data })
  }

  if (!validateAdmin(req)) {
    return res.status(401).json({ error: { message: 'No autorizado' } })
  }

  // PUT: { id, discount_pct }  — aplica o quita descuento a un producto
  if (req.method === 'PUT') {
    const { id, discount_pct } = req.body as { id: string; discount_pct: number }
    if (!id) return res.status(400).json({ error: { message: 'Falta id' } })

    const pct = Math.min(Math.max(Number(discount_pct) || 0, 0), 100)

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ discount_pct: pct })
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: { message: error.message } })
    return res.status(200).json({ data })
  }

  return res.status(405).json({ error: { message: 'Método no permitido' } })
}
