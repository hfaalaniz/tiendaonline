import { useEffect, useRef } from 'react'

export type HelpTopic = 'como-comprar' | 'metodos-pago' | 'envios-plazos' | 'cambios-devoluciones' | null

const CONTENT: Record<NonNullable<HelpTopic>, { title: string; icon: string; sections: { heading: string; body: string }[] }> = {
  'como-comprar': {
    title: 'Cómo comprar',
    icon: '🛍️',
    sections: [
      {
        heading: '1. Explorá el catálogo',
        body: 'Navegá por nuestra colección desde la página principal. Podés filtrar por categoría o usar el buscador para encontrar exactamente lo que buscás.',
      },
      {
        heading: '2. Agregá al carrito',
        body: 'Hacé clic en "Agregar al carrito" en la tarjeta del producto o desde la página de detalle. Podés seguir explorando y sumar más productos antes de pagar.',
      },
      {
        heading: '3. Revisá tu carrito',
        body: 'En el carrito podés ajustar las cantidades, eliminar productos y ver el resumen con el total de tu compra.',
      },
      {
        heading: '4. Finalizá el pago',
        body: 'Hacé clic en "Pagar con Mercado Pago". Serás redirigido a la plataforma de pago donde podés abonar con tarjeta de crédito, débito, efectivo o transferencia.',
      },
      {
        heading: '5. Confirmación',
        body: 'Una vez aprobado el pago, recibirás un correo de confirmación con los detalles de tu pedido. También podés consultarnos por WhatsApp en cualquier momento.',
      },
    ],
  },
  'metodos-pago': {
    title: 'Métodos de pago',
    icon: '💳',
    sections: [
      {
        heading: 'Mercado Pago',
        body: 'Procesamos todos los pagos de forma segura a través de Mercado Pago, la plataforma de pagos más utilizada en Latinoamérica.',
      },
      {
        heading: 'Tarjetas de crédito',
        body: 'Aceptamos todas las tarjetas de crédito principales: Visa, Mastercard, American Express y más. Podés pagar en cuotas sin interés según las promociones vigentes.',
      },
      {
        heading: 'Tarjetas de débito',
        body: 'Pagá directamente desde tu cuenta bancaria con tu tarjeta de débito Visa o Mastercard.',
      },
      {
        heading: 'Transferencia bancaria',
        body: 'Podés abonar por transferencia o depósito bancario. Consultanos por WhatsApp para recibir los datos.',
      },
      {
        heading: 'Efectivo',
        body: 'También aceptamos pagos en efectivo a través de puntos de pago habilitados (Rapipago, Pago Fácil y otros) gestionados por Mercado Pago.',
      },
      {
        heading: 'Seguridad',
        body: 'Todos los pagos están protegidos con encriptación SSL. Nunca almacenamos datos de tu tarjeta.',
      },
    ],
  },
  'envios-plazos': {
    title: 'Envíos y plazos',
    icon: '🚚',
    sections: [
      {
        heading: 'Cobertura',
        body: 'Enviamos a todo el país. El plazo de entrega depende de tu ubicación y la modalidad elegida.',
      },
      {
        heading: 'Envío estándar',
        body: 'Entrega estimada de 3 a 7 días hábiles desde la confirmación del pago. Disponible para todo el territorio nacional.',
      },
      {
        heading: 'Envío express',
        body: 'Disponible para ciertas zonas. Entrega en 24 a 48 horas hábiles. Consultá disponibilidad por WhatsApp antes de comprar.',
      },
      {
        heading: 'Retiro en persona',
        body: 'Si preferís retirar tu pedido personalmente, coordinamos el punto y horario de entrega por WhatsApp sin costo adicional.',
      },
      {
        heading: 'Seguimiento',
        body: 'Una vez despachado tu pedido, te enviamos el número de seguimiento por WhatsApp o correo electrónico para que puedas rastrearlo.',
      },
      {
        heading: 'Costos de envío',
        body: 'El costo de envío se calcula en el checkout según tu ubicación. Los pedidos superiores a cierto monto pueden tener envío bonificado — consultanos.',
      },
    ],
  },
  'cambios-devoluciones': {
    title: 'Cambios y devoluciones',
    icon: '↩️',
    sections: [
      {
        heading: 'Política de cambios',
        body: 'Tenés 10 días corridos desde la recepción del producto para solicitar un cambio o devolución, sin necesidad de dar explicaciones.',
      },
      {
        heading: 'Condiciones del producto',
        body: 'El producto debe estar en su estado original: sin uso, con etiquetas y en su embalaje original. No aceptamos devoluciones de productos usados o dañados por el cliente.',
      },
      {
        heading: 'Cómo iniciar un cambio',
        body: 'Escribinos por WhatsApp indicando tu número de pedido y el motivo. Te guiamos en todo el proceso sin complicaciones.',
      },
      {
        heading: 'Producto defectuoso',
        body: 'Si recibiste un producto con defecto de fabricación, lo cambiamos sin costo y cubrimos el envío de vuelta.',
      },
      {
        heading: 'Devolución del dinero',
        body: 'En caso de devolución, reintegramos el importe abonado a través del mismo medio de pago original en un plazo de 5 a 10 días hábiles.',
      },
      {
        heading: 'Contacto para reclamos',
        body: 'Para cualquier inconveniente, escribinos por WhatsApp. Nuestro equipo responde en horario comercial y trabajamos para resolver cada caso de la mejor manera.',
      },
    ],
  },
}

interface Props {
  topic: HelpTopic
  onClose: () => void
}

export default function HelpModal({ topic, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!topic) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [topic, onClose])

  if (!topic) return null

  const content = CONTENT[topic]

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={content.title}
    >
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">{content.icon}</span>
            <h2 className="modal-title">{content.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {content.sections.map((s) => (
            <div className="modal-section" key={s.heading}>
              <h3 className="modal-section-heading">{s.heading}</h3>
              <p className="modal-section-body">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <p className="modal-footer-note">¿Tenés más dudas?</p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''}?text=Hola! Tengo una consulta sobre: ${content.title}`}
            target="_blank"
            rel="noreferrer"
            className="button button-whatsapp"
            style={{ display: 'inline-flex' }}
          >
            💬 Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
