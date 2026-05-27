import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function supabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''

function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.replace(/^data:.*;base64,/, '')
  const binary = atob(clean)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Método no permitido' }, { status: 405 })
  }

  const secret = req.headers.get('x-admin-secret')
  if (secret !== ADMIN_SECRET) {
    return Response.json({ error: 'Se requiere autenticación de administrador' }, { status: 401 })
  }

  const { fileName, fileBase64, contentType } = await req.json()
  if (!fileName || !fileBase64) {
    return Response.json({ error: 'Faltan datos del archivo' }, { status: 400 })
  }

  const bytes = base64ToUint8Array(String(fileBase64))
  const path = `images/${fileName}`
  const { error } = await supabase().storage.from('images').upload(path, bytes, { contentType })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data } = supabase().storage.from('images').getPublicUrl(path)
  return Response.json({ publicUrl: data.publicUrl })
}
