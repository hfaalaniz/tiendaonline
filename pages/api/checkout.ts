export const runtime = 'edge'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Método no permitido' }, { status: 405 })
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) {
    return Response.json({ error: 'Falta configurar MERCADOPAGO_ACCESS_TOKEN' }, { status: 500 })
  }

  const { items, origin } = await req.json()
  if (!items || !Array.isArray(items)) {
    return Response.json({ error: 'Datos de carrito inválidos' }, { status: 400 })
  }

  const base = origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://bijoulume.pages.dev'

  const payload = {
    items: items.map((item: { title: string; quantity: number; unit_price: number }) => ({
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
    back_urls: {
      success: `${base}/`,
      failure: `${base}/cart`,
      pending: `${base}/cart`,
    },
    auto_return: 'approved',
  }

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.text()
    return Response.json({ error: `Error de Mercado Pago: ${errorData}` }, { status: 500 })
  }

  const data = await response.json()
  return Response.json({ init_point: data.init_point })
}
