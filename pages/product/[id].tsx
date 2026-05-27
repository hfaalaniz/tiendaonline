import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import OfferBadge from '../../components/OfferBadge'
import { getWhatsAppLink } from '../../lib/whatsapp'

type Product = {
  id: string
  title: string
  description: string
  price: number
  category: string
  image_url: string
  featured: boolean
  discount_pct?: number
  stock?: number
}

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data?.data ?? null))
      .finally(() => setLoading(false))
  }, [id])

  const addToCart = () => {
    if (!product) return
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('tienda-cart') : null
    const cart = stored ? JSON.parse(stored) : []
    const existing = cart.find((item: any) => item.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    window.localStorage.setItem('tienda-cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    setAdded(true)
  }

  if (loading) {
    return (
      <main className="page-shell">
        <div className="product-detail-grid">
          <div className="skeleton" style={{ minHeight: 520, borderRadius: 'var(--radius-xl)' }} />
          <div style={{ display: 'grid', gap: '1rem', paddingTop: '1rem' }}>
            <div className="skeleton skeleton-line" style={{ height: '1.4rem', width: '40%' }} />
            <div className="skeleton skeleton-line" style={{ height: '2.8rem', width: '80%' }} />
            <div className="skeleton skeleton-line" style={{ height: '1rem', width: '100%' }} />
            <div className="skeleton skeleton-line" style={{ height: '1rem', width: '90%' }} />
            <div className="skeleton skeleton-line" style={{ height: '2.6rem', width: '35%', marginTop: '0.5rem' }} />
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="page-shell page-enter">
        <div className="empty-state" style={{ paddingTop: '5rem' }}>
          <span className="empty-state-icon">😔</span>
          <h3>Producto no encontrado</h3>
          <p>Este producto ya no está disponible o la URL es incorrecta.</p>
          <Link href="/" className="button">
            Volver a la tienda
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <Head>
        <title>{product.title} | BijouLume</title>
        <meta name="description" content={product.description.slice(0, 160)} />
        <meta property="og:title" content={product.title} />
        <meta property="og:image" content={product.image_url} />
      </Head>
      <main className="page-shell product-page page-enter">

        {/* Breadcrumb */}
        <nav style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.8rem',
          color: 'var(--muted)',
          marginBottom: '2rem'
        }}>
          <Link href="/" style={{ color: 'var(--muted)', transition: 'color 0.2s' }}>Inicio</Link>
          <span>›</span>
          <Link href="/#catalog" style={{ color: 'var(--muted)', transition: 'color 0.2s' }}>Catálogo</Link>
          <span>›</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{product.title}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Image */}
          <div
            className="detail-image"
            style={{ backgroundImage: `url(${product.image_url})` }}
          />

          {/* Info */}
          <div className="detail-copy">
            <span className="category-pill" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              {product.category}
            </span>
            <h1 style={{ marginBottom: '0.5rem', lineHeight: 1.15 }}>{product.title}</h1>

            {product.featured && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--gold-light)',
                color: 'var(--gold)',
                border: '1px solid rgba(201, 149, 58, 0.25)',
                borderRadius: 'var(--radius-full)',
                padding: '0.3rem 0.85rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginBottom: '1rem',
                letterSpacing: '0.04em'
              }}>
                ✦ Producto destacado
              </div>
            )}

            <p className="product-description" style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: '0.5rem' }}>
              {product.description}
            </p>

            {product.discount_pct && product.discount_pct > 0 ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <OfferBadge originalPrice={product.price} discountPct={product.discount_pct} size="md" />
              </div>
            ) : (
              <div className="price-large">
                <sup>$</sup>{product.price.toFixed(2)}
              </div>
            )}

            {product.stock !== undefined && (
              <div style={{ marginBottom: '1rem' }}>
                <span className={`stock-chip stock-chip-lg${product.stock === 0 ? ' out' : product.stock <= 3 ? ' low' : ''}`}>
                  {product.stock === 0
                    ? '✕ Sin stock'
                    : product.stock <= 3
                    ? `⚡ ¡Últimas ${product.stock} unidades!`
                    : `✓ ${product.stock} unidades disponibles`}
                </span>
              </div>
            )}

            <div className="product-actions">
              {added ? (
                <Link href="/cart" className="button button-lg" style={{ flex: 1 }}>
                  ✓ Ver carrito
                </Link>
              ) : (
                <button className="button button-lg" onClick={addToCart} style={{ flex: 1 }}>
                  🛍️ Agregar al carrito
                </button>
              )}
              <a
                className="button button-whatsapp"
                href={getWhatsAppLink(product.title)}
                target="_blank"
                rel="noreferrer"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                💬 Consultar por WhatsApp
              </a>
            </div>

            {added && (
              <p className="success-message" style={{ marginTop: '0.875rem' }}>
                ✓ Agregado al carrito
              </p>
            )}

            {/* Features */}
            <div style={{
              display: 'grid',
              gap: '0.6rem',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-soft)'
            }}>
              {[
                ['🚚', 'Envío a todo el país'],
                ['🔒', 'Pago seguro con Mercado Pago'],
                ['💬', 'Consultas por WhatsApp'],
                ['↩️', 'Cambios sin inconvenientes'],
              ].map(([icon, text]) => (
                <div key={text} className="trust-bar-item" style={{ gap: '0.75rem' }}>
                  <span style={{ fontSize: '1rem' }}>{icon}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
