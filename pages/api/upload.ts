import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

type Data = {
  publicUrl?: string
  error?: string
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const secret = req.headers['x-admin-secret'] as string | undefined
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Se requiere autenticación de administrador' })
  }

  const { fileName, fileBase64, contentType } = req.body
  if (!fileName || !fileBase64) {
    return res.status(400).json({ error: 'Faltan datos del archivo' })
  }

  const cleanBase64 = String(fileBase64).replace(/^data:.*;base64,/, '')
  const buffer = Buffer.from(cleanBase64, 'base64')
  const path = `images/${fileName}`
  const { error } = await supabaseAdmin.storage.from('images').upload(path, buffer, { contentType })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const { data } = supabaseAdmin.storage.from('images').getPublicUrl(path)
  return res.status(200).json({ publicUrl: data.publicUrl })
}
