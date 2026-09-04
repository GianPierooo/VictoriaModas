import { useState } from 'react'
import emailjs from '@emailjs/browser'
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

const WHATSAPP_NUMBER = '51994347405'
const CONTACT_EMAIL = 'victoriamodas1053@gmail.com'
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61593438460245'
const INSTAGRAM_URL = 'https://www.instagram.com/victoria_modas_store/'

// Credenciales de EmailJS: se leen de variables de entorno (VITE_EMAILJS_*)
// con las credenciales actuales como respaldo. Si no hubiera ninguna, el
// formulario hace fallback a WhatsApp con el mensaje pre-armado.
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_kvj4xba',
  templateIdAdmin: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ADMIN || 'template_q6s8zef',
  templateIdClient: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CLIENT || 'template_9vy0jq9',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'DcomytfMPeZ2O-AR8',
}

const emailConfigured = Boolean(
  EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateIdAdmin && EMAILJS_CONFIG.publicKey
)

function openWhatsAppWithMessage(form) {
  const msg =
    `Hola, soy ${form.nombre}.\n\n${form.mensaje.trim()}\n\n` +
    `Mi contacto: ${form.contacto}`
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
    '_blank',
    'noopener'
  )
}

export default function ContactPage() {
  const toast = useToast()
  const [form, setForm] = useState({ nombre: '', contacto: '', mensaje: '' })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'whatsapp' | null

  useDocumentMeta({
    title: 'Contacto | Victoria Modas',
    description: 'Escríbenos por WhatsApp, correo o Facebook. Atención cercana para resolver tus dudas sobre prendas, tallas y pedidos. Lima, Perú.',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }))
  }

  const validate = () => {
    const next = {}
    if (!form.nombre.trim()) next.nombre = true
    if (!form.contacto.trim()) next.contacto = true
    if (form.mensaje.trim().length < 10) next.mensaje = true
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Revisa los campos: nombre, contacto y un mensaje breve.')
      return
    }

    // Sin credenciales de EmailJS → directo a WhatsApp
    if (!emailConfigured) {
      openWhatsAppWithMessage(form)
      setStatus('whatsapp')
      toast.info('Abrimos WhatsApp con tu mensaje listo.')
      return
    }

    setSending(true)
    setStatus(null)
    try {
      const params = {
        from_name: form.nombre,
        from_email: form.contacto,
        subject: 'Consulta desde la web',
        message: form.mensaje,
        to_email: CONTACT_EMAIL,
      }
      await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateIdAdmin, params, EMAILJS_CONFIG.publicKey)
      setStatus('success')
      setForm({ nombre: '', contacto: '', mensaje: '' })
      toast.success('Mensaje enviado. Te responderemos pronto.')
    } catch {
      // Si el envío de correo falla, no dejamos a la clienta sin canal:
      // abrimos WhatsApp con su mensaje listo.
      openWhatsAppWithMessage(form)
      setStatus('whatsapp')
      toast.info('Abrimos WhatsApp con tu mensaje listo.')
    } finally {
      setSending(false)
    }
  }

  const inputClass = (field) =>
    `w-full border-b bg-transparent py-2.5 font-light text-ink placeholder:text-ink-muted/50 focus:outline-none transition-colors ${
      errors[field] ? 'border-red-300 focus:border-red-400' : 'border-ink/20 focus:border-clay'
    }`
  const labelClass = 'mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted'

  return (
    <Layout>
      <div className="bg-white">
        {/* Encabezado — entrada secuenciada */}
        <section className="bg-cream py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <p className="hero-line mb-4 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
              Contacto
            </p>
            <h1
              className="hero-line mb-5 font-serif text-5xl font-light leading-[1.05] tracking-[-0.01em] text-ink md:text-6xl"
              style={{ animationDelay: '0.16s' }}
            >
              Conversemos
            </h1>
            <p className="hero-line mx-auto max-w-md font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.28s' }}>
              ¿Dudas sobre una prenda, una talla o tu pedido? Escríbenos: respondemos rápido.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-5 lg:gap-16">
            {/* Formulario */}
            <div className="lg:col-span-3">
              {status === 'success' && (
                <div className="mb-8 rounded-lg bg-cream p-5 text-sm font-light text-ink-soft">
                  Mensaje enviado. Te responderemos muy pronto, gracias por escribirnos.
                </div>
              )}
              {status === 'whatsapp' && (
                <div className="mb-8 rounded-lg bg-cream p-5 text-sm font-light text-ink-soft">
                  Abrimos WhatsApp con tu mensaje listo para enviar.
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-7">
                <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                  <div>
                    <label htmlFor="nombre" className={labelClass}>Nombre *</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className={inputClass('nombre')}
                    />
                    {errors.nombre && <p className="mt-2 text-xs text-red-400">Ingresa tu nombre.</p>}
                  </div>
                  <div>
                    <label htmlFor="contacto" className={labelClass}>Correo o teléfono *</label>
                    <input
                      type="text"
                      id="contacto"
                      name="contacto"
                      value={form.contacto}
                      onChange={handleChange}
                      placeholder="email@ejemplo.com / 999 999 999"
                      className={inputClass('contacto')}
                    />
                    {errors.contacto && <p className="mt-2 text-xs text-red-400">Ingresa un correo o teléfono.</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="mensaje" className={labelClass}>Mensaje *</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows="5"
                    value={form.mensaje}
                    onChange={handleChange}
                    placeholder="Cuéntanos en qué podemos ayudarte"
                    className={`${inputClass('mensaje')} resize-none`}
                  />
                  {errors.mensaje && <p className="mt-2 text-xs text-red-400">Escríbenos un mensaje de al menos 10 caracteres.</p>}
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:px-12"
                >
                  {sending ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </form>
            </div>

            {/* Datos de contacto */}
            <div className="lg:col-span-2">
              <div className="rounded-xl bg-cream p-7 lg:sticky lg:top-28 lg:p-8">
                <h2 className="mb-7 font-serif text-2xl font-light text-ink">
                  También nos encuentras aquí
                </h2>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <ChatBubbleLeftRightIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-clay" />
                    <div>
                      <p className="text-[10px] uppercase tracking-luxe text-ink-muted">WhatsApp</p>
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-light text-ink transition-colors hover:text-clay"
                      >
                        +51 994 347 405
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <EnvelopeIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-clay" />
                    <div>
                      <p className="text-[10px] uppercase tracking-luxe text-ink-muted">Correo</p>
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="break-all font-light text-ink transition-colors hover:text-clay"
                      >
                        {CONTACT_EMAIL}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-clay" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07C1.86 17.12 5.57 21.25 10.38 22v-7.01H7.9v-2.92h2.48V9.41c0-2.45 1.46-3.8 3.7-3.8 1.07 0 2.18.19 2.18.19v2.4h-1.23c-1.21 0-1.59.75-1.59 1.52v1.82h2.71l-.43 2.92h-2.28V22c4.81-.75 8.52-4.88 8.52-9.93z" />
                    </svg>
                    <div>
                      <p className="text-[10px] uppercase tracking-luxe text-ink-muted">Facebook</p>
                      <a
                        href={FACEBOOK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-light text-ink transition-colors hover:text-clay"
                      >
                        Victoria Modas
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-clay" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                    <div>
                      <p className="text-[10px] uppercase tracking-luxe text-ink-muted">Instagram</p>
                      <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-light text-ink transition-colors hover:text-clay"
                      >
                        @victoria_modas_store
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <ClockIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-clay" />
                    <div>
                      <p className="text-[10px] uppercase tracking-luxe text-ink-muted">Horario de atención</p>
                      {/* Placeholder — ajustar al horario real */}
                      <p className="font-light text-ink">Lun a Sáb, 9am - 7pm</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
