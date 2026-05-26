import Link from 'next/link'
import { useState } from 'react'
import HelpModal, { HelpTopic } from './HelpModal'

const HELP_ITEMS: { label: string; topic: HelpTopic }[] = [
  { label: 'Cómo comprar', topic: 'como-comprar' },
  { label: 'Métodos de pago', topic: 'metodos-pago' },
  { label: 'Envíos y plazos', topic: 'envios-plazos' },
  { label: 'Cambios y devoluciones', topic: 'cambios-devoluciones' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const [activeTopic, setActiveTopic] = useState<HelpTopic>(null)

  return (
    <>
      <HelpModal topic={activeTopic} onClose={() => setActiveTopic(null)} />

      <footer className="site-footer">
        <div className="footer-inner">
          {/* Brand */}
          <div>
            <div className="footer-brand-name">
              <span>💎</span> BijouLume
            </div>
            <p className="footer-tagline">
              Accesorios y bijouterie diseñados para brillar en cada ocasión. Calidad, estilo y elegancia en cada pieza.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href="#"
                aria-label="Instagram"
                style={{
                  width: '2rem', height: '2rem', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                  transition: 'background 0.2s',
                }}
              >
                📷
              </a>
              <a
                href="#"
                aria-label="Facebook"
                style={{
                  width: '2rem', height: '2rem', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                  transition: 'background 0.2s',
                }}
              >
                👍
              </a>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <p className="footer-col-title">Tienda</p>
            <ul className="footer-links">
              <li><Link href="/">Inicio</Link></li>
              <li><Link href="/#catalog">Catálogo</Link></li>
              <li><Link href="/#catalog">Novedades</Link></li>
              <li><Link href="/cart">Mi carrito</Link></li>
            </ul>
          </div>

          {/* Ayuda — abre modales */}
          <div>
            <p className="footer-col-title">Ayuda</p>
            <ul className="footer-links">
              {HELP_ITEMS.map(({ label, topic }) => (
                <li key={topic}>
                  <button
                    onClick={() => setActiveTopic(topic)}
                    style={{
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                      fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                      color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="footer-col-title">Contacto</p>
            <ul className="footer-links">
              <li><a href="#">WhatsApp</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Email</a></li>
            </ul>
            <div style={{ marginTop: '1.25rem' }}>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
                letterSpacing: '0.1em', marginBottom: '0.4rem',
              }}>
                Medios de pago
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['💳 Tarjetas', '🏦 Transferencia'].map((m) => (
                  <span key={m} style={{
                    background: 'rgba(255,255,255,0.06)', borderRadius: 6,
                    padding: '0.2rem 0.6rem', fontFamily: 'var(--font-sans)',
                    fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)',
                  }}>{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} BijouLume. Todos los derechos reservados.</span>

          {/* Crédito al diseñador */}
          <a
            href="https://developers-soft.pages.dev"
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <span>⚡</span> Diseñado por Developers Soft
          </a>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', transition: 'color 0.2s' }}>
              Privacidad
            </a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', transition: 'color 0.2s' }}>
              Términos
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
