import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type CartItem = {
  id: string
  title: string
  price: number
  image_url: string
  quantity: number
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('tienda-cart')
    setCart(stored ? JSON.parse(stored) : [])
    setLoading(false)
  }, [])

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  )

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  )

  const updateQuantity = (id: string, value: number) => {
    const next = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, value) } : item
    )
    setCart(next)
    window.localStorage.setItem('tienda-cart', JSON.stringify(next))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (id: string) => {
    const next = cart.filter((item) => item.id !== id)
    setCart(next)
    window.localStorage.setItem('tienda-cart', JSON.stringify(next))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setCheckoutStatus('loading')
    setErrorMsg('')
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        }),
      })
      const data = await response.json()
      if (data?.init_point) {
        window.location.href = data.init_point
      } else {
        setCheckoutStatus('error')
        setErrorMsg('No se pudo generar la orden. Revisá la configuración de pago.')
      }
    } catch {
      setCheckoutStatus('error')
      setErrorMsg('Error de conexión. Intentá nuevamente.')
    }
  }

  return (
    <>
      <Head>
        <title>Carrito | BijouLume</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="page-shell page-enter">
        <section className="cart-shell">
          <div className="cart-header">
            <div>
              <p className="eyebrow">Carrito de compras</p>
              <h1>Tu selección</h1>
            </div>
            <Link href="/" className="link-text">Seguir comprando</Link>
          </div>

          {loading ? (
            <div className="empty-state">
              <span className="empty-state-icon">⏳</span>
              <p>Cargando tu carrito…</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: '5rem' }}>
              <span className="empty-state-icon">🛍️</span>
              <h3>Tu carrito está vacío</h3>
              <p>Explorá nuestra colección y encontrá el accesorio perfecto para vos.</p>
              <Link href="/#catalog" className="button button-lg" style={{ marginTop: '0.5rem' }}>
                Explorar colección
              </Link>
            </div>
          ) : (
            <div className="cart-grid">
              {/* Items */}
              <div className="product-card" style={{ padding: '0.5rem 1.5rem' }}>
                <div style={{ padding: '0.75rem 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                </div>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div
                      className="cart-item-image"
                      style={{ backgroundImage: `url(${item.image_url})` }}
                    />
                    <div className="cart-item-details">
                      <p className="cart-item-title">{item.title}</p>
                      <p className="cart-item-price">${item.price.toFixed(2)} c/u</p>
                      <div className="cart-actions">
                        <div className="cart-qty-control">
                          <button
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Reducir cantidad"
                          >
                            −
                          </button>
                          <input
                            className="cart-qty-input"
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                          />
                          <button
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="button button-ghost button-danger"
                          onClick={() => removeItem(item.id)}
                          style={{ fontSize: '0.8rem' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="checkout-card">
                <h2 style={{ margin: '0 0 0.25rem' }}>Resumen del pedido</h2>
                <p className="product-copy" style={{ margin: 0 }}>Revisá tu selección antes de pagar.</p>

                <div style={{ marginTop: '0.5rem' }}>
                  {cart.map((item) => (
                    <div className="checkout-summary-line" key={item.id}>
                      <span style={{ flex: 1, paddingRight: '1rem' }}>{item.title} ×{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="checkout-divider" />

                <div className="checkout-summary-line total">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <button
                  className="button button-lg"
                  onClick={handleCheckout}
                  disabled={checkoutStatus === 'loading'}
                  style={{ marginTop: '0.5rem', width: '100%' }}
                >
                  {checkoutStatus === 'loading' ? '⏳ Procesando…' : '💳 Pagar con Mercado Pago'}
                </button>

                {checkoutStatus === 'error' && (
                  <p className="error-message" style={{ marginTop: '0.25rem' }}>{errorMsg}</p>
                )}

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  marginTop: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-soft)'
                }}>
                  <div className="trust-bar-item" style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    <span>🔒</span> <span>Pago 100% seguro</span>
                  </div>
                  <div className="trust-bar-item" style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    <span>🚚</span> <span>Envío a todo el país</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
