import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, CheckCircleIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import ResponsiveImage from '../components/ResponsiveImage.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useStock } from '../hooks/useStock.js'
import { formatPEN, cartTotal } from '../utils/price.js'
import { generateOrderMessage, openWhatsApp } from '../utils/whatsappUtils.js'
import { buildOrderPayload, registerOrder } from '../utils/orderUtils.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

const REQUIRED_FIELDS = ['nombre', 'telefono', 'ciudad']

export default function CheckoutPage() {
  const { items } = useCart()
  const toast = useToast()
  const { getPrecio } = useStock()
  const priceOf = (it) => getPrecio(it.id, it.selectedColor, it.selectedSize)
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    notas: '',
  })
  const [errors, setErrors] = useState({})
  const [confirmed, setConfirmed] = useState(false)
  useDocumentMeta({ title: 'Finalizar pedido | Victoria Modas' })

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const { total, allPriced } = cartTotal(items, priceOf)
  // Total en soles solo si TODAS las líneas tienen precio (si no, se coordina
  // por WhatsApp).
  const totalPEN = allPriced ? total : null

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
    // Registra el pedido en la hoja en SEGUNDO PLANO (sin await): si falla, el
    // flujo de WhatsApp continúa igual. Va antes de openWhatsApp para no perder
    // el gesto de clic (evita bloqueo de popup).
    registerOrder(buildOrderPayload(formData, items, totalPEN))
    openWhatsApp(generateOrderMessage(formData, items, totalPEN))
    setConfirmed(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

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
              Pedido enviado
            </h1>
            <p className="hero-line mx-auto mb-12 max-w-md font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.32s' }}>
              Te responderemos pronto por WhatsApp para confirmar disponibilidad y
              coordinar el pago y la entrega.
            </p>

            {/* Resumen del pedido */}
            <div className="mb-12 rounded-xl bg-cream p-7 text-left lg:p-8">
              <p className="mb-5 text-[10px] uppercase tracking-luxe text-ink-muted">Tu pedido</p>
              <ul className="divide-y divide-ink/10">
                {items.map((item, idx) => (
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
                Completa tus datos y enviaremos el pedido por WhatsApp para coordinar pago y entrega.
              </p>

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

                <button
                  type="submit"
                  className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-all duration-500 hover:bg-clay active:scale-[0.99] md:w-auto md:px-12"
                >
                  Enviar pedido por WhatsApp
                </button>

                {/* Línea de confianza */}
                <div className="flex flex-col gap-2 pt-1 text-[11px] font-light text-ink-muted sm:flex-row sm:items-center sm:gap-5">
                  <span className="inline-flex items-center gap-1.5">
                    <TruckIcon className="h-4 w-4 text-clay" />
                    Envío gratis desde S/ 200
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

                <div className="space-y-2 border-t border-ink/10 pt-4 text-sm">
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>Artículos</span>
                    <span className="text-ink">{totalItems}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-ink-soft">Total</span>
                    <span className="font-serif text-2xl font-light text-ink">
                      {allPriced ? formatPEN(total) : <span className="text-lg text-ink-muted">A consultar</span>}
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
