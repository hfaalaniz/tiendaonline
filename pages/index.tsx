import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import OfferBadge from '../components/OfferBadge'
import { getWhatsAppLink } from '../lib/whatsapp'

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

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton skeleton-line medium" />
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-line" style={{ width: '40%', marginTop: '0.75rem' }} />
    </div>
  )
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])
  return <div className="toast">✓ {message}</div>
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [toast, setToast] = useState('')
  const catalogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) setProducts(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category || 'Sin categoría')))
    return ['Todos', ...unique]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'Todos' || p.category === category
      const q = search.toLowerCase()
      const matchesSearch = p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [products, category, search])

  const featured = useMemo(() => products.filter((p) => p.featured).slice(0, 4), [products])

  const addToCart = (product: Product) => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('tienda-cart')
    const cart = stored ? JSON.parse(stored) : []
    const existing = cart.find((item: any) => item.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    window.localStorage.setItem('tienda-cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    setToast(`"${product.title}" agregado al carrito`)
  }

  return (
    <>
      <Head>
        <title>BijouLume — Accesorios y Bijouterie Premium</title>
        <meta name="description" content="Descubrí nuestra colección de bijouterie elegante y femenina. Aretes, collares, pulseras y más. Envío rápido y pago seguro." />
        <meta property="og:title" content="BijouLume — Accesorios Premium" />
        <meta property="og:description" content="Colección de bijouterie elegante y vibrante." />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="page-shell page-enter">

        {/* ── HERO ─────────────────────────────── */}
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-label">
              <span className="hero-label-dot" />
              Nueva colección 2026
            </div>
            <h1>Accesorios que<br /><em>transforman</em> cada look</h1>
            <p className="hero-text">
              Descubrí piezas únicas de bijouterie diseñadas para brillar. Cada accesorio cuenta una historia — la tuya.
            </p>
            <div className="hero-links">
              <a href="#catalog" className="button button-lg">
                Explorar colección
              </a>
              <Link href="/cart" className="button button-secondary button-lg">
                Ver carrito
              </Link>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <span className="trust-icon">✦</span>
                <span>+500 clientes felices</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">✦</span>
                <span>Envío a todo el país</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">✦</span>
                <span>Pago seguro</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrap">
              <img
                className="hero-image-large"
                src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=85"
                alt="Colección de accesorios y joyas"
                loading="eager"
              />
              <div className="hero-badge">
                <p className="hero-badge-label">Colección activa</p>
                <p className="hero-badge-value">✨ Nuevas piezas</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ────────────────────────── */}
        <div className="trust-bar">
          <div className="trust-bar-item">
            <span className="trust-bar-icon">🚚</span>
            <span>Envío rápido y seguro</span>
          </div>
          <div className="trust-bar-item">
            <span className="trust-bar-icon">🔒</span>
            <span>Pago 100% protegido</span>
          </div>
          <div className="trust-bar-item">
            <span className="trust-bar-icon">💬</span>
            <span>Atención por WhatsApp</span>
          </div>
          <div className="trust-bar-item">
            <span className="trust-bar-icon">↩️</span>
            <span>Cambios sin problema</span>
          </div>
          <div className="trust-bar-item">
            <span className="trust-bar-icon">💎</span>
            <span>Calidad garantizada</span>
          </div>
        </div>

        {/* ── FEATURED ─────────────────────────── */}
        {(featured.length > 0 || loading) && (
          <section className="featured-section" style={{ marginBottom: '4rem' }}>
            <div className="section-header">
              <div>
                <p className="eyebrow">Selección especial</p>
                <h2>Destacados de la semana</h2>
              </div>
              <p className="section-note">Piezas con más personalidad ✨</p>
            </div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: loading
                  ? 'repeat(4, 1fr)'
                  : featured.length === 1
                  ? 'minmax(0, 360px)'
                  : featured.length === 2
                  ? 'repeat(2, 1fr)'
                  : featured.length === 3
                  ? 'repeat(3, 1fr)'
                  : 'repeat(4, 1fr)',
                justifyContent: featured.length === 1 ? 'center' : undefined,
                justifyItems: featured.length === 1 ? 'center' : undefined,
              }}
            >
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : featured.map((product) => (
                    <div key={product.id} className={`product-card small-card${product.discount_pct && product.discount_pct > 0 ? ' product-card-on-sale' : ''}`} style={featured.length === 1 ? { width: '100%' } : undefined}>
                      <Link href={`/product/${product.id}`} className="product-card-link">
                        <div
                          className="product-image"
                          style={{ backgroundImage: `url(${product.image_url})` }}
                        >
                          <div className="product-image-overlay" />
                          {product.discount_pct && product.discount_pct > 0 && (
                            <span className="sale-ribbon">-{product.discount_pct}% OFF</span>
                          )}
                        </div>
                        <div className="card-copy">
                          <span className="category-pill">{product.category}</span>
                          <strong style={{ display: 'block', margin: '0.5rem 0 0.25rem', fontSize: '1rem' }}>
                            {product.title}
                          </strong>
                          <p className="product-copy">
                            {product.description.length > 80
                              ? `${product.description.slice(0, 80)}…`
                              : product.description}
                          </p>
                          <div className="product-bottom">
                            {product.discount_pct && product.discount_pct > 0 ? (
                              <OfferBadge originalPrice={product.price} discountPct={product.discount_pct} size="sm" />
                            ) : (
                              <span className="price-tag">${product.price.toFixed(2)}</span>
                            )}
                            <span className="view-link">Ver</span>
                          </div>
                        </div>
                      </Link>
                      <div className="product-card-actions">
                        <button
                          className="button button-secondary"
                          style={{ fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                          onClick={() => addToCart(product)}
                        >
                          Agregar al Carrito
                        </button>
                        <a
                          className="button button-whatsapp"
                          style={{ fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                          href={getWhatsAppLink(product.title)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}
            </div>
          </section>
        )}

        {/* ── CATALOG ──────────────────────────── */}
        <section className="catalog-section" id="catalog" ref={catalogRef}>
          <div className="catalog-header">
            <div>
              <p className="eyebrow">Catálogo completo</p>
              <h2>Tu próximo accesorio te espera</h2>
            </div>
            <div className="filters">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  style={{ maxWidth: '220px' }}
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ maxWidth: '180px' }}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-3 loading-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🔍</span>
              <h3>Sin resultados</h3>
              <p>No encontramos productos para "{search || category}". Probá con otro término.</p>
              <button
                className="button button-secondary"
                onClick={() => { setSearch(''); setCategory('Todos') }}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className={`product-card highlight-card${product.discount_pct && product.discount_pct > 0 ? ' product-card-on-sale' : ''}`}>
                  <Link href={`/product/${product.id}`} className="product-card-link">
                    <div
                      className="product-image"
                      style={{ backgroundImage: `url(${product.image_url})` }}
                    >
                      <div className="product-image-overlay" />
                      {product.discount_pct && product.discount_pct > 0 && (
                        <span className="sale-ribbon">-{product.discount_pct}% OFF</span>
                      )}
                    </div>
                    <div className="product-content">
                      <span className="category-pill">{product.category}</span>
                      <h3>{product.title}</h3>
                      <p className="product-copy">
                        {product.description.length > 95
                          ? `${product.description.slice(0, 95)}…`
                          : product.description}
                      </p>
                      <div className="product-bottom">
                        {product.discount_pct && product.discount_pct > 0 ? (
                          <OfferBadge originalPrice={product.price} discountPct={product.discount_pct} size="sm" />
                        ) : (
                          <span className="price-tag">${product.price.toFixed(2)}</span>
                        )}
                        <span className="view-link">Ver detalle</span>
                      </div>
                      {product.stock !== undefined && (
                        <span className={`stock-chip${product.stock === 0 ? ' out' : product.stock <= 3 ? ' low' : ''}`}>
                          {product.stock === 0 ? 'Sin stock' : product.stock <= 3 ? `¡Últimas ${product.stock}!` : `${product.stock} disponibles`}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="product-card-actions">
                    <button
                      className="button button-secondary"
                      style={{ fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                      onClick={() => addToCart(product)}
                    >
                      Agregar al Carrito
                    </button>
                    <a
                      className="button button-whatsapp"
                      style={{ fontSize: '0.82rem', padding: '0.6rem 1rem' }}
                      href={getWhatsAppLink(product.title)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </>
  )
}
