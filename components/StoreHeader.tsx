import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

export default function StoreHeader() {
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [secretCount, setSecretCount] = useState(0)
  const resetRef = useRef<NodeJS.Timeout | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  const refreshCartCount = () => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('tienda-cart')
    const cart = stored ? JSON.parse(stored) : []
    setCartCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0))
  }

  useEffect(() => {
    refreshCartCount()
    const onCartUpdate = () => refreshCartCount()
    window.addEventListener('cartUpdated', onCartUpdate)
    window.addEventListener('storage', onCartUpdate)
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('cartUpdated', onCartUpdate)
      window.removeEventListener('storage', onCartUpdate)
      window.removeEventListener('scroll', onScroll)
      if (resetRef.current) clearTimeout(resetRef.current)
    }
  }, [])

  const handleLogoClick = (e: React.MouseEvent) => {
    // Si no estamos en home, el Link navegará normalmente y reseteamos el contador
    if (router.pathname !== '/') {
      setSecretCount(0)
      return
    }

    // En home interceptamos el click para contar
    e.preventDefault()

    if (resetRef.current) clearTimeout(resetRef.current)

    const next = secretCount + 1
    setSecretCount(next)

    if (next >= 7) {
      window.localStorage.setItem('shop-admin-access', 'true')
      setSecretCount(0)
      router.push('/admin')
      return
    }

    // Resetea el contador si el usuario para de hacer clicks por 2 segundos
    resetRef.current = setTimeout(() => setSecretCount(0), 2000)
  }

  return (
    <header ref={headerRef} className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="brand-topbar">
        <Link href="/" className="brand-logo" onClick={handleLogoClick}>
          <span className="brand-icon">💎</span>
          <span className="brand-name">BijouLume</span>
        </Link>

        <nav className="brand-actions">
          <Link href="/" className="nav-link">Inicio</Link>
          <Link href="/#catalog" className="nav-link">Catálogo</Link>
          <Link href="/cart" className="button button-secondary cart-btn" style={{ padding: '0.6rem 1.25rem' }}>
            <span>🛍️</span>
            <span>Carrito</span>
            {cartCount > 0 && (
              <span className="cart-count-badge">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
