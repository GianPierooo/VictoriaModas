// ============================================================
// ChatWidget — Asistente on-site de Victoria Modas
// ------------------------------------------------------------
// Botón flotante ABAJO-IZQUIERDA (el de WhatsApp del Footer va abajo-
// derecha; no chocan). Guía (no chat abierto con IA): responde el FAQ del
// sitio y deja explorar el catálogo por categoría. Cada camino termina en
// un botón de WhatsApp con un mensaje ya redactado.
//
// Estilos EN LÍNEA con la paleta exacta del CLAUDE.md, autocontenido.
// NUNCA muestra precios (ni menor ni mayor) — el precio se cierra por
// WhatsApp. El indicador de stock se conecta en el paso 4.
// ============================================================
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCTS, getProductById, getProductsByCategory } from '../data/products.js'
import { COLOR_HEX } from '../utils/colorMap.js'
import { useStock, estadoStyle } from '../hooks/useStock.js'

// Paleta (CLAUDE.md)
const C = {
  cream: '#FBF7F4',
  creamDark: '#F4EDE7',
  ink: '#2B2424',
  soft: '#5B5150',
  muted: '#756967',
  clay: '#9C5F4E',
  clayDark: '#8A5340',
  clayLight: '#D7B3A8',
  rose: '#E8B4B8',
  white: '#FFFFFF',
  whatsapp: '#25D366',
  whatsappDark: '#1EBE5A',
}

const WA_NUMBER = '51993357672'
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`

// FAQ del sitio (misma redacción que /preguntas-frecuentes), cada uno con
// su mensaje de WhatsApp ya escrito.
const FAQ = {
  comprar: {
    q: '¿Cómo comprar?',
    a: 'Muy fácil: navega la colección, elige color y talla y arma tu carrito. Al finalizar, el pedido se envía por WhatsApp y ahí mismo confirmamos disponibilidad, pago y entrega. Sin registros ni complicaciones.',
    wa: 'Hola 👋 Quiero hacer un pedido en Victoria Modas.',
  },
  pago: {
    q: 'Métodos de pago',
    a: 'Aceptamos Yape, Plin y transferencia bancaria. Si estás en Lima, también puedes pagar en efectivo contra entrega.',
    wa: 'Hola, tengo una consulta sobre los métodos de pago.',
  },
  envios: {
    q: 'Envíos',
    a: 'En Lima coordinamos entregas en 2 a 4 días hábiles. A provincias enviamos por Shalom u Olva Courier (4 a 7 días hábiles), con recojo en la agencia de tu ciudad. Envío gratis en compras mayores a S/ 200.',
    wa: 'Hola, quisiera consultar sobre los envíos.',
  },
  cambios: {
    q: 'Cambios y devoluciones',
    a: 'Aceptamos cambios dentro de los 7 días posteriores a la entrega, siempre que la prenda esté sin uso y en su empaque original. Escríbenos por WhatsApp y lo coordinamos.',
    wa: 'Hola, quisiera consultar sobre un cambio o devolución.',
  },
  tallas: {
    q: 'Guía de tallas',
    a: 'Según el modelo manejamos tallas XS a L. Si nos compartes tus medidas (busto, cintura y cadera) te ayudamos a elegir la talla ideal para ti.',
    wa: 'Hola, ¿me ayudan con la guía de tallas? Les paso mis medidas.',
  },
  mayoreo: {
    q: 'Venta por mayor',
    a: 'Sí. Nacimos en Gamarra y seguimos atendiendo a clientas mayoristas. Cuéntanos por WhatsApp qué modelos y cantidades te interesan y te preparamos una cotización.',
    wa: 'Hola, me interesa la venta por mayor. ¿Me pasan información?',
  },
}

// Menú principal: orden de aparición.
const MENU = [
  { key: 'comprar', label: 'Cómo comprar' },
  { key: 'pago', label: 'Métodos de pago' },
  { key: 'envios', label: 'Envíos' },
  { key: 'cambios', label: 'Cambios y devoluciones' },
  { key: 'tallas', label: 'Guía de tallas' },
  { key: 'mayoreo', label: 'Venta por mayor' },
]

// Categorías visibles (Abrigos queda oculto hasta tener stock, igual que la nav).
const CATS = [
  { slug: 'vestidos', label: 'Vestidos' },
  { slug: 'blusas', label: 'Blusas' },
  { slug: 'pantalones', label: 'Pantalones' },
]

// ---------- Iconos (inline, autocontenidos) ----------
function ChatIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5v-3.5H5.5A1.5 1.5 0 0 1 4 14.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="12.5" cy="10" r="1" fill="currentColor" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />
    </svg>
  )
}

function WaIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
    </svg>
  )
}

// ---------- Piezas reutilizables ----------
function OptionButton({ children, onClick, primary = false }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        width: '100%',
        textAlign: 'left',
        padding: '11px 14px',
        marginBottom: 8,
        borderRadius: 12,
        border: `1px solid ${primary ? 'transparent' : C.clayLight}`,
        background: primary ? (hover ? C.clayDark : C.clay) : hover ? C.creamDark : C.white,
        color: primary ? C.white : C.ink,
        fontSize: 14,
        lineHeight: 1.3,
        cursor: 'pointer',
        transition: 'background 0.2s ease, border-color 0.2s ease',
        fontFamily: "'Roboto Flex', sans-serif",
      }}
    >
      <span>{children}</span>
      <span aria-hidden="true" style={{ color: primary ? C.white : C.clay, fontSize: 16 }}>
        ›
      </span>
    </button>
  )
}

function Bubble({ children }) {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.creamDark}`,
        borderRadius: 14,
        borderTopLeftRadius: 4,
        padding: '12px 14px',
        fontSize: 13.5,
        lineHeight: 1.55,
        color: C.soft,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  )
}

function WhatsAppCTA({ message, label = 'Continuar por WhatsApp' }) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        padding: '12px 14px',
        borderRadius: 999,
        background: hover ? C.whatsappDark : C.whatsapp,
        color: C.white,
        fontSize: 13.5,
        fontWeight: 500,
        letterSpacing: '0.02em',
        textDecoration: 'none',
        transition: 'background 0.2s ease',
        fontFamily: "'Roboto Flex', sans-serif",
      }}
    >
      <WaIcon /> {label}
    </a>
  )
}

function SectionTitle({ children }) {
  return (
    <p
      style={{
        margin: '2px 0 12px',
        fontSize: 10,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: C.clay,
      }}
    >
      {children}
    </p>
  )
}

// ---------- Widget ----------
export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  // view: 'home' | 'faq:<key>' | 'cats' | 'cat:<slug>' | 'prod:<id>'
  const [view, setView] = useState('home')
  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)
  const { getEstado } = useStock()

  const [vType, vArg] = view.split(':')

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const openProduct = (p) => {
    setColor(p.colors[0])
    setSize(p.sizes[0])
    setView(`prod:${p.id}`)
  }

  const back = () => {
    if (vType === 'prod') {
      const p = getProductById(vArg)
      setView(p ? `cat:${p.category}` : 'cats')
    } else if (vType === 'cat') {
      setView('cats')
    } else {
      setView('home')
    }
  }

  const closeAndReset = () => {
    setOpen(false)
    setView('home')
  }

  // ---------- Vistas ----------
  const renderBody = () => {
    // FAQ
    if (vType === 'faq') {
      const item = FAQ[vArg]
      if (!item) return null
      return (
        <>
          <SectionTitle>{item.q}</SectionTitle>
          <Bubble>{item.a}</Bubble>
          <WhatsAppCTA message={item.wa} />
          <div style={{ height: 10 }} />
          <OptionButton onClick={() => setView('cats')}>Ver los productos</OptionButton>
        </>
      )
    }

    // Categorías
    if (vType === 'cats') {
      return (
        <>
          <SectionTitle>Nuestra colección</SectionTitle>
          <Bubble>¿Qué te gustaría ver? Elige una categoría.</Bubble>
          {CATS.map((c) => {
            const n = getProductsByCategory(c.slug).length
            return (
              <OptionButton key={c.slug} onClick={() => setView(`cat:${c.slug}`)}>
                {c.label}
                <span style={{ color: C.muted, fontSize: 12 }}> · {n}</span>
              </OptionButton>
            )
          })}
        </>
      )
    }

    // Lista de productos de una categoría
    if (vType === 'cat') {
      const list = getProductsByCategory(vArg)
      const label = CATS.find((c) => c.slug === vArg)?.label || vArg
      return (
        <>
          <SectionTitle>{label}</SectionTitle>
          {list.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => openProduct(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                textAlign: 'left',
                padding: 8,
                marginBottom: 8,
                borderRadius: 12,
                border: `1px solid ${C.creamDark}`,
                background: C.white,
                cursor: 'pointer',
                fontFamily: "'Roboto Flex', sans-serif",
              }}
            >
              <img
                src={p.image}
                alt=""
                width={48}
                height={64}
                loading="lazy"
                style={{
                  width: 48,
                  height: 64,
                  objectFit: 'cover',
                  objectPosition: 'top',
                  borderRadius: 8,
                  background: C.creamDark,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 14, color: C.ink, lineHeight: 1.3 }}>
                  {p.name}
                </span>
                <span style={{ display: 'block', fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {p.colors.length} colores · {p.sizes.join(' · ')}
                </span>
              </span>
              <span aria-hidden="true" style={{ color: C.clay, fontSize: 16 }}>
                ›
              </span>
            </button>
          ))}
        </>
      )
    }

    // Detalle de producto → elegir color/talla → WhatsApp
    if (vType === 'prod') {
      const p = getProductById(vArg)
      if (!p) return null
      const stock = estadoStyle(getEstado(p.id, color, size))
      const waMsg = `Hola 👋 Me interesa "${p.name}" (color ${color}, talla ${size}). ¿Está disponible?`
      return (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <img
              src={p.colorImages?.[color]?.[0] || p.image}
              alt={p.name}
              width={72}
              height={96}
              loading="lazy"
              style={{
                width: 72,
                height: 96,
                objectFit: 'cover',
                objectPosition: 'top',
                borderRadius: 10,
                background: C.creamDark,
                flexShrink: 0,
              }}
            />
            <div>
              <p style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 17, color: C.ink, lineHeight: 1.2, margin: 0 }}>
                {p.name}
              </p>
              <p style={{ fontSize: 12, color: C.muted, margin: '6px 0 0', textTransform: 'capitalize' }}>
                {p.category} · {p.fabric}
              </p>
            </div>
          </div>

          {/* Color */}
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, margin: '0 0 8px' }}>
            Color · <span style={{ color: C.soft }}>{color}</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {p.colors.map((cl) => (
              <button
                key={cl}
                type="button"
                onClick={() => setColor(cl)}
                title={cl}
                aria-label={`Color ${cl}`}
                aria-pressed={color === cl}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  padding: 0,
                  cursor: 'pointer',
                  background: COLOR_HEX[cl] || '#CCCCCC',
                  border: color === cl ? `2px solid ${C.clay}` : `1px solid rgba(43,36,36,0.15)`,
                  boxShadow: color === cl ? `0 0 0 2px ${C.white}` : 'none',
                }}
              />
            ))}
          </div>

          {/* Talla */}
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, margin: '0 0 8px' }}>
            Talla
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {p.sizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSize(sz)}
                aria-pressed={size === sz}
                style={{
                  minWidth: 42,
                  padding: '8px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: size === sz ? C.ink : C.white,
                  color: size === sz ? C.cream : C.soft,
                  border: size === sz ? `1px solid ${C.ink}` : `1px solid rgba(43,36,36,0.2)`,
                  fontFamily: "'Roboto Flex', sans-serif",
                }}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Disponibilidad en vivo (discreta; oculta si no hay hoja conectada) */}
          {stock && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                margin: '0 0 12px',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: stock.color,
              }}
            >
              <span
                aria-hidden="true"
                style={{ width: 6, height: 6, borderRadius: 999, background: stock.dot, display: 'inline-block' }}
              />
              {stock.label}
            </div>
          )}

          <WhatsAppCTA message={waMsg} label="Consultar por WhatsApp" />
          <div style={{ height: 8 }} />
          <Link
            to={`/producto/${p.id}`}
            onClick={closeAndReset}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px 14px',
              borderRadius: 999,
              border: `1px solid ${C.clayLight}`,
              color: C.ink,
              fontSize: 13,
              textDecoration: 'none',
              fontFamily: "'Roboto Flex', sans-serif",
            }}
          >
            Ver en la web
          </Link>
        </>
      )
    }

    // Home
    return (
      <>
        <Bubble>
          ¡Hola! 👋 Soy el asistente de <strong style={{ color: C.ink, fontWeight: 600 }}>Victoria Modas</strong>.
          Te ayudo con tu compra, envíos, cambios o a explorar la colección. ¿Qué necesitas?
        </Bubble>
        <SectionTitle>Preguntas frecuentes</SectionTitle>
        {MENU.map((m) => (
          <OptionButton key={m.key} onClick={() => setView(`faq:${m.key}`)}>
            {m.label}
          </OptionButton>
        ))}
        <div style={{ height: 6 }} />
        <SectionTitle>Explorar</SectionTitle>
        <OptionButton primary onClick={() => setView('cats')}>
          Ver los productos ({PRODUCTS.length})
        </OptionButton>
      </>
    )
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Asistente de Victoria Modas"
          style={{
            position: 'fixed',
            bottom: 96,
            left: 24,
            zIndex: 50,
            width: 'min(370px, calc(100vw - 48px))',
            height: 'min(560px, calc(100vh - 132px))',
            display: 'flex',
            flexDirection: 'column',
            background: C.cream,
            borderRadius: 18,
            border: `1px solid ${C.clayLight}`,
            boxShadow: '0 24px 60px -20px rgba(43,36,36,0.35)',
            overflow: 'hidden',
            fontFamily: "'Roboto Flex', sans-serif",
            animation: 'fadeIn 0.22s ease-out both',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 14px',
              background: C.ink,
              color: C.cream,
            }}
          >
            {view !== 'home' && (
              <button
                type="button"
                onClick={back}
                aria-label="Volver"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: C.cream,
                  cursor: 'pointer',
                  fontSize: 20,
                  lineHeight: 1,
                  padding: '2px 4px',
                }}
              >
                ‹
              </button>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "'Bodoni Moda', serif", fontSize: 16, lineHeight: 1.1 }}>
                Victoria<span style={{ fontStyle: 'italic', color: C.clayLight }}>Modas</span>
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(251,247,244,0.6)' }}>
                Asistente · te responde al instante
              </p>
            </div>
            <button
              type="button"
              onClick={closeAndReset}
              aria-label="Cerrar asistente"
              style={{
                background: 'transparent',
                border: 'none',
                color: C.cream,
                cursor: 'pointer',
                fontSize: 22,
                lineHeight: 1,
                padding: '0 4px',
              }}
            >
              ×
            </button>
          </div>

          {/* Cuerpo desplazable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>{renderBody()}</div>

          {/* Pie */}
          <div
            style={{
              padding: '8px 14px',
              borderTop: `1px solid ${C.creamDark}`,
              fontSize: 10.5,
              color: C.muted,
              textAlign: 'center',
              background: C.cream,
            }}
          >
            Cerramos cada pedido por WhatsApp · +51 993 357 672
          </div>
        </div>
      )}

      {/* Botón flotante (abajo-izquierda) */}
      <button
        type="button"
        onClick={() => (open ? closeAndReset() : setOpen(true))}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente de Victoria Modas'}
        aria-expanded={open}
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 50,
          width: 56,
          height: 56,
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          background: C.clay,
          color: C.cream,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px -12px rgba(43,36,36,0.45)',
          transition: 'background 0.25s ease, transform 0.25s ease',
          animation: 'fadeIn 0.6s ease-out both',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = C.clayDark
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = C.clay
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {open ? <span style={{ fontSize: 24, lineHeight: 1 }}>×</span> : <ChatIcon />}
      </button>
    </>
  )
}
