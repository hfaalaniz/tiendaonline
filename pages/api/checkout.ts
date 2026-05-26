import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  init_point?: string
  error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'Falta configurar MERCADOPAGO_ACCESS_TOKEN' })
  }

  const { items } = req.body
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Datos de carrito inválidos' })
  }

  const payload = {
    items: items.map((item: any) => ({
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price
    })),
    back_urls: {
      success: 'http://localhost:3000/',
      failure: 'http://localhost:3000/cart',
      pending: 'http://localhost:3000/cart'
    },
    auto_return: 'approved'
  }

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorData = await response.text()
    return res.status(500).json({ error: `Error de Mercado Pago: ${errorData}` })
  }

  const data = await response.json()
  return res.status(200).json({ init_point: data.init_point })
}
