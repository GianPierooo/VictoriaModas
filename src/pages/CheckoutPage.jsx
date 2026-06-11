import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import { useCart } from '../context/CartContext.jsx'
import { generateOrderMessage, openWhatsApp } from '../utils/whatsappUtils.js'

const REQUIRED_FIELDS = ['nombre', 'telefono', 'ciudad']

export default function CheckoutPage() {
  const { items } = useCart()
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    notas: '',
  })
  const [errors, setErrors] = useState({})
  const [confirmed, setConfirmed] = useState(false)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

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
      return
    }
    openWhatsApp(generateOrderMessage(formData, items))
    setConfirmed(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Pantalla de confirmación
  if (confirmed) {
    return (
      <Layout>
        <div className="bg-white">
          <div className="mx-auto max-w-xl px-6 py-24 text-center lg:px-8">
            <CheckCircleIcon className="mx-auto mb-6 h-16 w-16 text-clay" strokeWidth={1} />
            <h1 className="mb-4 font-serif text-3xl font-light text-ink md:text-4xl">
              ¡Pedido enviado!
            </h1>
            <p className="mb-10 font-light leading-relaxed text-ink-soft">
              Te responderemos pronto por WhatsApp para confirmar disponibilidad y
              coordinar el pago y el envío. Gracias por elegir Victoria Modas, {formData.nombre.split(' ')[0]}.
            </p>

            {/* Resumen */}
            <div className="mb-10 rounded-lg bg-cream p-6 text-left">
              <p className="mb-4 text-[10px] uppercase tracking-luxe text-ink-muted">Tu pedido</p>
              <ul className="space-y-3">
                {items.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-4 text-sm">
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
          {/* Encabezado */}
          <div className="mb-10">
            <Link
              to="/carrito"
              className="mb-5 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-clay"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Volver al carrito
            </Link>
            <p className="mb-3 text-[11px] uppercase tracking-luxe text-clay">Casi listo</p>
            <h1 className="font-serif text-4xl font-light text-ink md:text-5xl">Finalizar pedido</h1>
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
                  className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay md:w-auto md:px-12"
                >
                  Enviar pedido por WhatsApp
                </button>
              </form>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="rounded-lg bg-cream p-6 lg:sticky lg:top-28">
                <h2 className="mb-6 font-serif text-xl font-light text-ink">Resumen</h2>

                <ul className="mb-6 space-y-4">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-cream-dark">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover object-top" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif text-sm font-light text-ink">{item.name}</p>
                        {(item.selectedColor || item.selectedSize) && (
                          <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                            {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-ink-muted">× {item.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t border-ink/10 pt-4 text-sm">
                  <span className="text-ink-soft">Artículos</span>
                  <span className="text-ink">{totalItems}</span>
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
