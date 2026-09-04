import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, CheckCircleIcon, TruckIcon, ArrowPathIcon, ChatBubbleLeftRightIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import ResponsiveImage from '../components/ResponsiveImage.jsx'
import CouponField from '../components/CouponField.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useStock } from '../hooks/useStock.js'
import { formatPEN, cartTotal } from '../utils/price.js'
import { calcularDescuento } from '../lib/cupones.js'
import { generateOrderMessage, generateWhatsAppMessage, buildWhatsAppHref, openWhatsApp } from '../utils/whatsappUtils.js'
import { buildOrderPayload, registerOrder } from '../utils/orderUtils.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { trackEvent } from '../lib/metaPixel.js'

const REQUIRED_FIELDS = ['nombre', 'telefono', 'ciudad']
// Para pagar en línea con Culqi además hace falta un correo (Culqi lo exige
// para el cargo, y sirve para mandar el comprobante).
const REQUIRED_FIELDS_PAGO = [...REQUIRED_FIELDS, 'email']

// Script del Custom Checkout de Culqi — se carga una sola vez, compartido
// por toda la app (no hay Vite build-time bundling posible para esto).
const CULQI_SCRIPT_SRC = 'https://js.culqi.com/checkout-js'
let culqiScriptPromise = null
function loadCulqiScript() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.CulqiCheckout) return Promise.resolve(true)
  if (culqiScriptPromise) return culqiScriptPromise
  culqiScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${CULQI_SCRIPT_SRC}"]`)
    const onReady = () => resolve(!!window.CulqiCheckout)
    if (existing) {
      existing.addEventListener('load', onReady, { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = CULQI_SCRIPT_SRC
    script.async = true
    script.addEventListener('load', onReady, { once: true })
    script.addEventListener('error', () => resolve(false), { once: true })
    document.body.appendChild(script)
  })
  return culqiScriptPromise
}

export default function CheckoutPage() {
  const { items, coupon, clearCart } = useCart()
  const toast = useToast()
  const { getPrecio } = useStock()
  const priceOf = (it) => getPrecio(it.id, it.selectedColor, it.selectedSize)
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    email: '',
    notas: '',
  })
  const [errors, setErrors] = useState({})
  const [confirmed, setConfirmed] = useState(false)
  const [pagoConfirmado, setPagoConfirmado] = useState(false)
  const [pagando, setPagando] = useState(false)
  // Foto del pedido en el momento de confirmar — el pago en línea vacía el
  // carrito (clearCart), así que la pantalla de "gracias" no puede seguir
  // leyendo `items` del contexto o se vería vacía.
  const [confirmedItems, setConfirmedItems] = useState(null)
  const culqiRef = useRef(null)
  useDocumentMeta({ title: 'Finalizar pedido | Victoria Modas' })

  // Precarga el script de Culqi apenas hay algo que pagar (no bloquea nada
  // si falla: el botón "Pagar ahora" simplemente avisa y queda el de WhatsApp).
  useEffect(() => {
    if (items.length > 0) loadCulqiScript()
  }, [items.length])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const { total, allPriced } = cartTotal(items, priceOf)
  const descuento = allPriced ? calcularDescuento(coupon, total) : 0
  // Total en soles solo si TODAS las líneas tienen precio (si no, se coordina
  // por WhatsApp). Ya con el descuento del cupón aplicado.
  const totalPEN = allPriced ? Math.max(0, total - descuento) : null

  // Meta Ads: InicioCheckout una vez, al entrar con algo en el carrito
  // (los early-return de "carrito vacío"/"confirmado" van más abajo, así
  // que este efecto no se dispara en esos casos).
  useEffect(() => {
    if (items.length === 0) return
    trackEvent('InitiateCheckout', {
      content_ids: items.map((it) => it.id),
      num_items: totalItems,
      currency: 'PEN',
      value: totalPEN ?? undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = {}
    REQUIRED_FIELDS.forEach(field => {
      if (!formData[field].trim()) nextErrors[field] = true
    })
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      toast.error('Completa los campos marcados para enviar tu pedido.')
      return
    }
    // ── COSTURA DE PAGO (FUTURO) ──────────────────────────────────────
    // Si algún día se habilita un pago en línea (Yape / pasarela), el paso
    // iría AQUÍ: cobrar/confirmar el pago antes de registrar y derivar a
    // WhatsApp. Hoy el modelo es 100% por WhatsApp; no hay lógica de pago.
    // NO implementar aquí (es un paso separado y fuera de alcance).

    toast.success('Pedido enviado. Te escribimos por WhatsApp.')
    // Meta Ads: esto NO es una compra confirmada todavía (el cierre real es
    // por WhatsApp, sin pago en línea aún) — se manda como "Lead" (intención
    // fuerte de compra), no "Purchase". El evento "Purchase" real llega
    // cuando haya una pasarela de pago que confirme el cobro.
    trackEvent(
      'Lead',
      {
        content_ids: items.map((it) => it.id),
        num_items: totalItems,
        currency: 'PEN',
        value: totalPEN ?? undefined,
      },
      { telefono: formData.telefono }
    )
    // Registra el pedido en la hoja en SEGUNDO PLANO (sin await): si falla, el
    // flujo de WhatsApp continúa igual. Va antes de openWhatsApp para no perder
    // el gesto de clic (evita bloqueo de popup).
    registerOrder(buildOrderPayload(formData, items, totalPEN, coupon))
    openWhatsApp(generateOrderMessage(formData, items, totalPEN, coupon))
    setConfirmedItems(items)
    setConfirmed(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Pago en línea con Culqi — más rápido que coordinar por WhatsApp: el
  // monto real lo recalcula /api/culqi-cobrar en el servidor (nunca se
  // confía en lo que se ve en pantalla), así que aunque el widget cobre en
  // céntimos "de más" por redondeo, lo que se descuenta de la tarjeta es
  // siempre lo que el servidor validó contra el stock/precio reales.
  const handlePagarAhora = async () => {
    const nextErrors = {}
    REQUIRED_FIELDS_PAGO.forEach((field) => {
      if (!formData[field].trim()) nextErrors[field] = true
    })
    if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      nextErrors.email = true
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      toast.error('Completa tus datos (incluido el correo) para pagar en línea.')
      return
    }
    if (!allPriced || totalPEN == null) {
      toast.error('Algún producto de tu carrito necesita coordinarse por WhatsApp antes de pagar en línea.')
      return
    }

    setPagando(true)
    const ready = await loadCulqiScript()
    if (!ready) {
      setPagando(false)
      toast.error('No se pudo cargar el pago en línea. Prueba de nuevo o escríbenos por WhatsApp.')
      return
    }

    const publicKey = import.meta.env.VITE_CULQI_PUBLIC_KEY
    if (!publicKey) {
      setPagando(false)
      toast.error('El pago en línea no está disponible ahora mismo. Escríbenos por WhatsApp.')
      return
    }

    const culqi = new window.CulqiCheckout(publicKey, {
      settings: {
        title: 'Victoria Modas',
        currency: 'PEN',
        amount: Math.round(totalPEN * 100),
      },
      client: { email: formData.email.trim() },
      options: {
        lang: 'es',
        installments: true,
        modal: true,
        paymentMethods: {
          tarjeta: true,
          yape: false,
          billetera: false,
          bancaMovil: false,
          agente: false,
          cuotealo: false,
        },
      },
    })
    culqiRef.current = culqi

    culqi.culqi = async () => {
      if (!culqi.token) {
        setPagando(false)
        const mensaje = culqi.error?.user_message || culqi.error?.merchant_message || 'No se pudo completar el pago.'
        if (culqi.error) toast.error(mensaje)
        return
      }
      const token = culqi.token.id
      culqi.close()
      try {
        const res = await fetch('/api/culqi-cobrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            email: formData.email.trim(),
            items: items.map((it) => ({ id: it.id, color: it.selectedColor, talla: it.selectedSize, cantidad: it.quantity })),
            cuponCodigo: coupon?.codigo || '',
            cliente: { nombre: formData.nombre, telefono: formData.telefono, ciudad: formData.ciudad, notas: formData.notas },
          }),
        })
        const data = await res.json().catch(() => ({ ok: false }))
        if (!data.ok) {
          toast.error(data.error || 'No se pudo completar el pago.')
          return
        }
        // Compra confirmada de verdad — este es el único punto del sitio que
        // manda "Purchase" (ver CLAUDE.md: nunca se manda con el flujo de
        // WhatsApp, que es solo intención de compra).
        trackEvent(
          'Purchase',
          { content_ids: items.map((it) => it.id), num_items: totalItems, currency: 'PEN', value: data.total ?? totalPEN },
          { telefono: formData.telefono, email: formData.email }
        )
        setConfirmedItems(items)
        clearCart()
        setPagoConfirmado(true)
        setConfirmed(true)
        window.scrollTo({ top: 0, behavior: 'instant' })
      } catch (err) {
        console.error('[culqi] error al confirmar el pago:', err)
        toast.error('El pago no se pudo confirmar. Si se te cobró, escríbenos por WhatsApp con tu comprobante.')
      } finally {
        setPagando(false)
      }
    }

    culqi.open()
    setPagando(false)
  }

  // Salida directa a WhatsApp para quien prefiere coordinar hablando en vez
  // de llenar el formulario — no pierde lo que ya eligió (va con el carrito
  // armado), solo cambia el canal.
  const handleHablarPorWhatsApp = () => {
    trackEvent('Contact', {
      content_ids: items.map((it) => it.id),
      num_items: totalItems,
      currency: 'PEN',
      value: totalPEN ?? undefined,
    })
  }
  const whatsappDirectoHref = buildWhatsAppHref(generateWhatsAppMessage(items))

  // Pantalla de confirmación
  if (confirmed) {
    return (
      <Layout>
        <div className="bg-white">
          <div className="mx-auto max-w-xl px-6 py-24 text-center lg:px-8 lg:py-32">
            <CheckCircleIcon className="hero-line mx-auto mb-8 h-14 w-14 text-clay" strokeWidth={1} style={{ animationDelay: '0.05s' }} />
            <p className="hero-line mb-4 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.14s' }}>
              Gracias, {formData.nombre.split(' ')[0]}
            </p>
            <h1 className="hero-line mb-5 font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl" style={{ animationDelay: '0.22s' }}>
              {pagoConfirmado ? 'Pago confirmado' : 'Pedido enviado'}
            </h1>
            <p className="hero-line mx-auto mb-12 max-w-md font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.32s' }}>
              {pagoConfirmado
                ? 'Tu pago se procesó con éxito. Alistamos tu pedido y te escribimos por WhatsApp para coordinar la entrega.'
                : 'Te escribiremos por WhatsApp para confirmar la disponibilidad y coordinar el pago y la entrega.'}
            </p>

            {/* Resumen del pedido */}
            <div className="mb-12 rounded-xl bg-cream p-7 text-left lg:p-8">
              <p className="mb-5 text-[10px] uppercase tracking-luxe text-ink-muted">Tu pedido</p>
              <ul className="divide-y divide-ink/10">
                {(confirmedItems || items).map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
                    <span className="font-light text-ink">
                      {item.name}
                      <span className="text-ink-muted">
                        {' '}· {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <span className="flex-shrink-0 text-ink-muted">× {item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  // Carrito vacío
  if (items.length === 0) {
    return (
      <Layout>
        <div className="bg-white">
          <div className="mx-auto max-w-xl px-6 py-24 text-center lg:px-8">
            <h1 className="mb-4 font-serif text-3xl font-light text-ink">
              No hay nada que finalizar
            </h1>
            <p className="mb-8 font-light text-ink-soft">
              Tu carrito está vacío. Añade alguna pieza antes de continuar.
            </p>
            <Link
              to="/vestidos"
              className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
            >
              Explorar la colección
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  // Clases compartidas para inputs editoriales (border-b hairline)
  const inputClass = (field) =>
    `w-full border-b bg-transparent py-2.5 text-ink font-light placeholder:text-ink-muted/50 focus:outline-none transition-colors ${
      errors[field] ? 'border-red-300 focus:border-red-400' : 'border-ink/20 focus:border-clay'
    }`

  const labelClass = 'mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted'

  return (
    <Layout>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          {/* Encabezado — entrada secuenciada */}
          <div className="mb-12">
            <Link
              to="/carrito"
              className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-clay"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Volver al carrito
            </Link>
            <p className="hero-line mb-3 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
              Casi listo
            </p>
            <h1 className="hero-line font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl" style={{ animationDelay: '0.14s' }}>
              Finalizar pedido
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
            {/* Formulario */}
            <div className="lg:col-span-2">
              <p className="mb-8 max-w-md font-light leading-relaxed text-ink-soft">
                Completa tus datos y coordinamos el pedido por WhatsApp: confirmamos tu total,
                el pago y la entrega.
              </p>

              <a
                href={whatsappDirectoHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleHablarPorWhatsApp}
                className="mb-8 inline-flex items-center gap-2 text-sm font-light text-ink-soft transition-colors hover:text-clay"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 flex-shrink-0 text-clay" />
                ¿Quieres más confianza antes de comprar?{' '}
                <span className="text-clay underline">Hablemos por WhatsApp</span>
              </a>

              <form onSubmit={handleSubmit} noValidate className="space-y-7">
                <div>
                  <label htmlFor="nombre" className={labelClass}>Nombre completo *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Tu nombre y apellido"
                    className={inputClass('nombre')}
                  />
                  {errors.nombre && <p className="mt-2 text-xs text-red-400">Ingresa tu nombre.</p>}
                </div>

                <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                  <div>
                    <label htmlFor="telefono" className={labelClass}>Teléfono *</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="999 999 999"
                      className={inputClass('telefono')}
                    />
                    {errors.telefono && <p className="mt-2 text-xs text-red-400">Ingresa tu teléfono.</p>}
                  </div>

                  <div>
                    <label htmlFor="ciudad" className={labelClass}>Ciudad / distrito *</label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      placeholder="Ej. Lima, Miraflores"
                      className={inputClass('ciudad')}
                    />
                    {errors.ciudad && <p className="mt-2 text-xs text-red-400">Ingresa tu ciudad o distrito.</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>Correo {totalPEN != null ? '(para pagar en línea)' : '(opcional)'}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tucorreo@ejemplo.com"
                    className={inputClass('email')}
                  />
                  {errors.email && <p className="mt-2 text-xs text-red-400">Ingresa un correo válido.</p>}
                </div>

                <div>
                  <label htmlFor="notas" className={labelClass}>Notas (opcional)</label>
                  <textarea
                    id="notas"
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Referencias de entrega, preferencias, etc."
                    className={`${inputClass('notas')} resize-none`}
                  />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="sm:flex-1">
                    <button
                      type="button"
                      onClick={handlePagarAhora}
                      disabled={pagando || !allPriced}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-clay py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-all duration-500 hover:bg-clay-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-12"
                    >
                      <LockClosedIcon className="h-3.5 w-3.5" />
                      {pagando ? 'Cargando…' : 'Pagar ahora'}
                    </button>
                    <p className="mt-2 text-[11px] font-light text-ink-muted">
                      Lo más rápido: paga con tarjeta y alistamos tu pedido de inmediato.
                    </p>
                  </div>

                  <div className="sm:flex-1">
                    <button
                      type="submit"
                      className="block w-full rounded-full border border-ink/20 bg-transparent py-4 text-center text-xs uppercase tracking-[0.2em] text-ink transition-all duration-500 hover:border-clay hover:text-clay active:scale-[0.99] sm:w-auto sm:px-12"
                    >
                      Enviar pedido por WhatsApp
                    </button>
                    <p className="mt-2 text-[11px] font-light text-ink-muted">
                      Para coordinar antes de pagar, con más calma.
                    </p>
                  </div>
                </div>

                {/* Línea de confianza */}
                <div className="flex flex-col gap-2 pt-1 text-[11px] font-light text-ink-muted sm:flex-row sm:items-center sm:gap-5">
                  <span className="inline-flex items-center gap-1.5">
                    <TruckIcon className="h-4 w-4 text-clay" />
                    Envío gratis desde S/ 60
                  </span>
                  <span className="hidden text-ink/20 sm:inline">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowPathIcon className="h-4 w-4 text-clay" />
                    Cambios dentro de 7 días
                  </span>
                </div>
              </form>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="rounded-xl bg-cream p-7 lg:sticky lg:top-28 lg:p-8">
                <h2 className="mb-6 font-serif text-2xl font-light text-ink">Resumen</h2>

                <ul className="mb-6 space-y-4">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-cream-dark">
                        <ResponsiveImage src={item.image} alt={item.name} className="h-full w-full object-cover object-top" loading="lazy" width={64} height={80} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif text-sm font-light text-ink">{item.name}</p>
                        {(item.selectedColor || item.selectedSize) && (
                          <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                            {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <div className="mt-0.5 flex items-center justify-between text-xs text-ink-muted">
                          <span>× {item.quantity}</span>
                          <span className="text-ink">
                            {formatPEN(priceOf(item) != null ? priceOf(item) * item.quantity : null) || 'A consultar'}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mb-4">
                  <CouponField subtotal={total} />
                </div>

                <div className="space-y-2 border-t border-ink/10 pt-4 text-sm">
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>Artículos</span>
                    <span className="text-ink">{totalItems}</span>
                  </div>
                  {descuento > 0 && (
                    <div className="flex items-center justify-between text-clay">
                      <span>Descuento ({coupon.codigo})</span>
                      <span>-{formatPEN(descuento)}</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between">
                    <span className="text-ink-soft">Total</span>
                    <span className="font-serif text-2xl font-light text-ink">
                      {allPriced ? formatPEN(totalPEN) : <span className="text-lg text-ink-muted">A consultar</span>}
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-xs font-light leading-relaxed text-ink-muted">
                  Coordinaremos pago y envío contigo por WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
