import Head from 'next/head'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { salePrice } from '../../components/OfferBadge'

type Product = {
  id: string
  title: string
  description: string
  price: number
  category: string
  image_url: string
  featured: boolean
  active: boolean
  discount_pct: number
  created_at: string
}

type ProductForm = {
  title: string
  description: string
  price: string
  category: string
  image_url: string
  featured: boolean
  file?: File
}

const EMPTY_FORM: ProductForm = {
  title: '', description: '', price: '', category: '', image_url: '', featured: false,
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''
const STAT_ICONS = ['📦', '⭐', '🏷️', '💰']

/* ── Modal de producto (nuevo / editar) ─────────────────── */
function ProductModal({
  open,
  editingId,
  form,
  setForm,
  preview,
  onFileChange,
  onSubmit,
  onClose,
  submitting,
  error,
}: {
  open: boolean
  editingId: string | null
  form: ProductForm
  setForm: (f: ProductForm) => void
  preview: string
  onFileChange: (file: File | undefined) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onClose: () => void
  submitting: boolean
  error: string
}) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={editingId ? 'Editar producto' : 'Nuevo producto'}
    >
      <div className="modal-box" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">{editingId ? '✏️' : '📦'}</span>
            <h2 className="modal-title">{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '1.25rem 1.75rem' }}>
          {error && <p className="error-message" style={{ marginBottom: '1rem' }}>{error}</p>}

          <form id="product-form" onSubmit={onSubmit}>
            <label>
              Nombre del producto
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Aretes dorados con cristal"
                required
              />
            </label>

            <label style={{ marginTop: '0.75rem' }}>
              Descripción
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describí el producto, materiales, tamaños…"
                required
              />
            </label>

            <div className="form-row" style={{ marginTop: '0.75rem' }}>
              <label>
                Precio ($)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </label>
              <label>
                Categoría
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Ej: Aretes, Collares…"
                  required
                />
              </label>
            </div>

            <label style={{ marginTop: '0.75rem' }}>
              Imagen — URL o archivo
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://… (opcional si subís archivo)"
              />
              <input
                type="file"
                accept="image/*"
                style={{ marginTop: '0.5rem' }}
                onChange={(e) => onFileChange(e.target.files?.[0])}
              />
            </label>

            {preview && (
              <div
                className="image-preview"
                style={{ backgroundImage: `url(${preview})`, marginTop: '0.75rem' }}
              />
            )}

            <label className="checkbox-label" style={{ marginTop: '0.875rem' }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              <span>Marcar como destacado ⭐</span>
            </label>
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="button button-ghost" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="button"
            type="submit"
            form="product-form"
            disabled={submitting}
            style={{ minWidth: 140 }}
          >
            {submitting ? '⏳ Guardando…' : editingId ? '✓ Actualizar' : '+ Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Modal de oferta ────────────────────────────────────── */
function OfferModal({
  open,
  product,
  onClose,
  onSave,
}: {
  open: boolean
  product: Product | null
  onClose: () => void
  onSave: (id: string, pct: number) => Promise<void>
}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!open || !product) return
    setPct(product.discount_pct > 0 ? String(product.discount_pct) : '')
    setErr('')
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, product, onClose])

  if (!open || !product) return null

  const numPct = Math.min(Math.max(Number(pct) || 0, 0), 100)
  const preview = numPct > 0 ? salePrice(product.price, numPct) : null

  const handleSave = async () => {
    setSaving(true); setErr('')
    try { await onSave(product.id, numPct); onClose() }
    catch (e) { setErr(String(e)) }
    finally { setSaving(false) }
  }

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Configurar oferta"
    >
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">🏷️</span>
            <h2 className="modal-title">Configurar oferta</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="modal-body" style={{ padding: '1.5rem 1.75rem', gap: '1rem' }}>
          {err && <p className="error-message">{err}</p>}
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>{product.title}</strong>
            <br />Precio base: <strong>${product.price.toFixed(2)}</strong>
          </p>
          <label>
            Descuento (%)
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              placeholder="0 = sin oferta"
            />
          </label>
          {preview !== null && (
            <p className="success-message" style={{ margin: 0 }}>
              Precio con descuento: <strong>${preview.toFixed(2)}</strong> (ahorro: ${(product.price - preview).toFixed(2)})
            </p>
          )}
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>
            Poné 0 para quitar la oferta. El cambio se verá en la tienda de inmediato.
          </p>
        </div>
        <div className="modal-footer">
          <button className="button button-ghost" onClick={onClose}>Cancelar</button>
          <button className="button" onClick={handleSave} disabled={saving} style={{ minWidth: 140 }}>
            {saving ? '⏳ Guardando…' : numPct > 0 ? `Aplicar -${numPct}%` : 'Quitar oferta'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Página principal ───────────────────────────────────── */
export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalError, setModalError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [preview, setPreview] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'featured' | 'active' | 'inactive'>('all')
  const [offerModalProduct, setOfferModalProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'offers'>('products')

  const headers = useMemo(
    () => ({ 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET }),
    []
  )

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/products', { headers })
    const data = await res.json()
    if (res.ok && data.data) {
      // Si la BD no tiene campo active, lo defaulteamos a true
      setProducts(data.data.map((p: Product) => ({ ...p, active: p.active ?? true })))
    } else {
      setError(data.error?.message || 'No se pudo cargar productos')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthorized(window.localStorage.getItem('shop-admin-access') === 'true')
    }
  }, [])

  useEffect(() => {
    if (authorized) loadProducts()
    else setLoading(false)
  }, [authorized])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase()
      const matchSearch =
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      const matchFilter =
        filter === 'all' ||
        (filter === 'featured' && p.featured) ||
        (filter === 'active' && p.active !== false) ||
        (filter === 'inactive' && p.active === false)
      return matchSearch && matchFilter
    })
  }, [products, search, filter])

  const stats = useMemo(() => {
    const featuredCount = products.filter((p) => p.featured).length
    const activeCount = products.filter((p) => p.active !== false).length
    const categories = new Set(products.map((p) => p.category)).size
    const totalValue = products.reduce((sum, p) => sum + Number(p.price), 0)
    return [
      { label: 'Total productos', value: String(products.length) },
      { label: 'Destacados', value: String(featuredCount) },
      { label: 'Activos', value: String(activeCount) },
      { label: 'Valor total', value: `$${totalValue.toFixed(0)}` },
    ]
  }, [products])

  const showMsg = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 4000)
  }

  const openNew = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setPreview('')
    setModalError('')
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url,
      featured: product.featured,
    })
    setPreview(product.image_url)
    setModalError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalError('')
  }

  const handleFileChange = (file: File | undefined) => {
    if (!file) { setForm({ ...form, file: undefined }); setPreview(form.image_url); return }
    setForm({ ...form, file })
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
          body: JSON.stringify({ fileName: `${Date.now()}-${file.name}`, fileBase64: base64, contentType: file.type }),
        })
        const data = await res.json()
        if (res.ok && data.publicUrl) resolve(data.publicUrl)
        else reject(data.error || 'Error al subir imagen')
      }
      reader.onerror = () => reject('Error leyendo archivo')
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setModalError('')
    setSubmitting(true)
    try {
      let imageUrl = form.image_url
      if (form.file) imageUrl = await uploadImage(form.file)
      const body = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image_url: imageUrl,
        featured: form.featured,
      }
      const method = editingId ? 'PUT' : 'POST'
      const endpoint = editingId ? `/api/products/${editingId}` : '/api/products'
      const res = await fetch(endpoint, { method, headers, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setModalError(data.error?.message || 'No se pudo guardar'); return }
      showMsg(editingId ? '✓ Producto actualizado' : '✓ Producto creado')
      closeModal()
      loadProducts()
    } catch (err) {
      setModalError(String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleFeatured = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...product, featured: !product.featured }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error?.message || 'Error al actualizar'); return }
    showMsg(product.featured ? 'Removido de destacados' : '⭐ Marcado como destacado')
    loadProducts()
  }

  const handleToggleActive = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...product, active: !product.active }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error?.message || 'Error al actualizar'); return }
    showMsg(product.active ? 'Producto desactivado' : '✓ Producto activado')
    loadProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este producto? Esta acción no se puede deshacer.')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers })
    const data = await res.json()
    if (res.ok) { showMsg('Producto eliminado'); loadProducts() }
    else setError(data.error?.message || 'No se pudo eliminar')
  }

  const handleSaveOffer = async (id: string, pct: number) => {
    const res = await fetch('/api/offers', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ id, discount_pct: pct }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'No se pudo guardar la oferta')
    showMsg(pct > 0 ? `🏷️ Oferta aplicada: -${pct}%` : 'Oferta quitada')
    loadProducts()
  }

  /* ── Guards ───────────────────────────────────────── */
  if (!ADMIN_SECRET) {
    return (
      <main className="page-shell">
        <div className="admin-lock">
          <span style={{ fontSize: '2rem' }}>⚙️</span>
          <h2>Configuración pendiente</h2>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Configurá <code>NEXT_PUBLIC_ADMIN_SECRET</code> en tu <code>.env.local</code>.
          </p>
        </div>
      </main>
    )
  }

  if (!authorized) {
    return (
      <main className="page-shell">
        <div className="admin-lock">
          <span style={{ fontSize: '2.5rem' }}>🔒</span>
          <p className="eyebrow">Acceso restringido</p>
          <h2>Panel oculto</h2>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '26rem' }}>
            Hacé 7 clicks sobre el logo BijouLume para acceder al panel de administración.
          </p>
        </div>
      </main>
    )
  }

  /* ── Render principal ─────────────────────────────── */
  return (
    <>
      <Head>
        <title>Admin | BijouLume</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <ProductModal
        open={modalOpen}
        editingId={editingId}
        form={form}
        setForm={setForm}
        preview={preview}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        onClose={closeModal}
        submitting={submitting}
        error={modalError}
      />

      <OfferModal
        open={offerModalProduct !== null}
        product={offerModalProduct}
        onClose={() => setOfferModalProduct(null)}
        onSave={handleSaveOffer}
      />

      <main className="page-shell admin-page">

        {/* ── Dashboard ── */}
        <section className="admin-hero">
          <div>
            <p className="eyebrow">Panel de control</p>
            <h1 style={{ margin: '0.5rem 0' }}>Administración del catálogo</h1>
            <p className="product-copy" style={{ margin: 0 }}>
              Gestioná productos, imágenes y categorías. Los cambios se reflejan inmediatamente en la tienda.
            </p>
          </div>
          <div className="dashboard-cards">
            {stats.map((s, i) => (
              <div className="dashboard-card" key={s.label}>
                <span className="dashboard-card-icon">{STAT_ICONS[i]}</span>
                <span className="dashboard-card-label">{s.label}</span>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>
        </section>

        {error && <p className="error-message" style={{ marginBottom: '1rem' }}>{error}</p>}
        {message && <p className="success-message" style={{ marginBottom: '1rem' }}>{message}</p>}

        {/* ── Tabs ── */}
        <div className="admin-tabs">
          <button
            className={`admin-tab${activeTab === 'products' ? ' active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Productos
          </button>
          <button
            className={`admin-tab${activeTab === 'offers' ? ' active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            🏷️ Ofertas
            {products.filter(p => p.discount_pct > 0).length > 0 && (
              <span className="admin-tab-badge">{products.filter(p => p.discount_pct > 0).length}</span>
            )}
          </button>
        </div>

        {/* ── Listado de productos ── */}
        <section className="admin-full-section" style={{ display: activeTab === 'products' ? undefined : 'none' }}>

          {/* Toolbar */}
          <div className="admin-toolbar" style={{ padding: '1.25rem 1.5rem' }}>
            <div>
              <p className="eyebrow">Inventario</p>
              <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.3rem' }}>Productos activos</h2>
            </div>
            <div className="admin-toolbar-actions">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="search"
                  value={search}
                  placeholder="Buscar producto…"
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ maxWidth: 220 }}
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                style={{ maxWidth: 150 }}
              >
                <option value="all">Todos</option>
                <option value="featured">Destacados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
              <button className="button" onClick={openNew} style={{ whiteSpace: 'nowrap' }}>
                + Agregar producto
              </button>
            </div>
          </div>

          {/* Tabla */}
          {loading ? (
            <div style={{ display: 'grid', gap: '0.6rem', padding: '1rem 1.5rem' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius)' }} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1.5rem' }}>
              <span className="empty-state-icon">📭</span>
              <h3>Sin resultados</h3>
              <p>No hay productos que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <div className="admin-table" style={{ marginTop: '1.25rem' }}>
              {/* Cabecera */}
              <div className="admin-table-header">
                <span className="atc-thumb" />
                <span className="atc-name">Producto</span>
                <span className="atc-price">Precio</span>
                <span className="atc-status">Estado</span>
                <span className="atc-actions">Acciones</span>
              </div>

              {filteredProducts.map((product) => (
                <div
                  className={`admin-table-row${product.active === false ? ' admin-row-inactive' : ''}`}
                  key={product.id}
                >
                  {/* Miniatura */}
                  <div
                    className="table-image atc-thumb"
                    style={{ backgroundImage: `url(${product.image_url})` }}
                  />

                  {/* Nombre + descripción */}
                  <div className="atc-name">
                    <span className="atr-title">
                      {product.title}
                      {product.featured && <span className="atr-star">⭐</span>}
                    </span>
                    <span className="atr-meta">
                      {product.category} — {product.description.length > 55 ? product.description.slice(0, 55) + '…' : product.description}
                    </span>
                  </div>

                  {/* Precio */}
                  <div className="atc-price">
                    ${product.price.toFixed(2)}
                  </div>

                  {/* Estado */}
                  <div className="atc-status">
                    <span className={`admin-status-badge${product.active === false ? ' inactive' : ''}`}>
                      {product.active === false ? 'Inactivo' : 'Activo'}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="atc-actions">
                    <button className="button button-ghost admin-action-btn" onClick={() => openEdit(product)}>
                      ✏️ Editar
                    </button>
                    <button className="button button-ghost admin-action-btn" onClick={() => handleToggleFeatured(product)}>
                      {product.featured ? '★ Quitar' : '☆ Destacar'}
                    </button>
                    <button
                      className={`button button-ghost admin-action-btn${product.discount_pct > 0 ? ' admin-btn-offer-active' : ''}`}
                      onClick={() => setOfferModalProduct(product)}
                    >
                      {product.discount_pct > 0 ? `🏷️ -${product.discount_pct}%` : '🏷️ Oferta'}
                    </button>
                    <button
                      className={`button button-ghost admin-action-btn${product.active === false ? ' admin-btn-activate' : ''}`}
                      onClick={() => handleToggleActive(product)}
                    >
                      {product.active === false ? '▶ Activar' : '⏸ Pausar'}
                    </button>
                    <button className="button button-ghost button-danger admin-action-btn" onClick={() => handleDelete(product.id)}>
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Sección Ofertas ── */}
        {activeTab === 'offers' && (
          <section className="admin-full-section">
            <div className="admin-toolbar" style={{ padding: '1.25rem 1.5rem' }}>
              <div>
                <p className="eyebrow">Descuentos activos</p>
                <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.3rem' }}>Gestión de ofertas</h2>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
                Hacé click en un producto para configurar o quitar su descuento.
              </p>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gap: '0.6rem', padding: '1rem 1.5rem' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius)' }} />
                ))}
              </div>
            ) : (
              <div className="admin-table" style={{ marginTop: '1.25rem' }}>
                <div className="admin-table-header offers-table-header">
                  <span className="atc-thumb" />
                  <span className="atc-name">Producto</span>
                  <span className="atc-price">Precio base</span>
                  <span className="atc-price">Descuento</span>
                  <span className="atc-price">Precio final</span>
                  <span className="atc-actions" style={{ textAlign: 'right' }}>Acción</span>
                </div>
                {products.map((product) => {
                  const hasOffer = product.discount_pct > 0
                  const finalPrice = hasOffer ? salePrice(product.price, product.discount_pct) : null
                  return (
                    <div
                      className={`admin-table-row offers-table-row${hasOffer ? ' offers-row-active' : ''}`}
                      key={product.id}
                    >
                      <div className="table-image atc-thumb" style={{ backgroundImage: `url(${product.image_url})` }} />
                      <div className="atc-name">
                        <span className="atr-title">{product.title}</span>
                        <span className="atr-meta">{product.category}</span>
                      </div>
                      <div className="atc-price">${product.price.toFixed(2)}</div>
                      <div className="atc-price">
                        {hasOffer ? (
                          <span className="offer-pct-badge">-{product.discount_pct}%</span>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Sin oferta</span>
                        )}
                      </div>
                      <div className="atc-price">
                        {finalPrice !== null ? (
                          <strong style={{ color: 'var(--accent)' }}>${finalPrice.toFixed(2)}</strong>
                        ) : (
                          <span style={{ color: 'var(--muted)' }}>—</span>
                        )}
                      </div>
                      <div className="atc-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className={`button button-ghost admin-action-btn${hasOffer ? ' admin-btn-offer-active' : ''}`}
                          onClick={() => setOfferModalProduct(product)}
                        >
                          {hasOffer ? '✏️ Editar oferta' : '+ Agregar oferta'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  )
}
