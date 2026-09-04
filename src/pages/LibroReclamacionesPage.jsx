import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircleIcon, PrinterIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { crearReclamacion } from '../lib/reclamaciones.js'
import {
  RUC,
  RAZON_SOCIAL,
  DOMICILIO_ESTABLECIMIENTO,
  NOMBRE_COMERCIAL,
  PLAZO_RESPUESTA_DIAS_HABILES,
} from '../config/legal.js'

const TIPOS_DOCUMENTO = ['DNI', 'Carné de Extranjería', 'Pasaporte', 'RUC', 'Otro']
const TIPOS_COMPROBANTE = ['Boleta electrónica', 'Factura electrónica', 'Sin comprobante / pedido por WhatsApp']

const inputClass = (hasError) =>
  `w-full border-b bg-transparent py-2.5 text-ink font-light placeholder:text-ink-muted/50 focus:outline-none transition-colors ${
    hasError ? 'border-red-300 focus:border-red-400' : 'border-ink/20 focus:border-clay'
  }`
const labelClass = 'mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted'
const selectClass = (hasError) =>
  `w-full border-b bg-transparent py-2.5 text-ink font-light focus:outline-none transition-colors ${
    hasError ? 'border-red-300 focus:border-red-400' : 'border-ink/20 focus:border-clay'
  }`

const initialForm = {
  tipo: 'reclamo',
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  correo: '',
  telefono: '',
  domicilio: '',
  esMenorEdad: false,
  apoderadoNombre: '',
  producto: '',
  tipoComprobante: TIPOS_COMPROBANTE[2],
  numeroComprobante: '',
  montoReclamado: '',
  descripcionBien: '',
  detalle: '',
  pedido: '',
}

const REQUIRED_FIELDS = ['nombres', 'apellidoPaterno', 'tipoDocumento', 'numeroDocumento', 'correo', 'detalle', 'pedido']

export default function LibroReclamacionesPage() {
  const toast = useToast()
  useDocumentMeta({
    title: 'Libro de Reclamaciones | Victoria Modas',
    description: 'Libro de Reclamaciones virtual de Victoria Modas, conforme al Código de Protección y Defensa del Consumidor (Ley N.° 29571).',
  })

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [registrado, setRegistrado] = useState(null) // { codigo, ...form } tras enviar

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    REQUIRED_FIELDS.forEach((f) => {
      if (!String(form[f]).trim()) nextErrors[f] = true
    })
    if (!/^\S+@\S+\.\S+$/.test(form.correo.trim())) nextErrors.correo = true
    if (form.esMenorEdad && !form.apoderadoNombre.trim()) nextErrors.apoderadoNombre = true
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      toast.error('Completa los campos marcados antes de enviar.')
      return
    }

    setEnviando(true)
    try {
      const fila = await crearReclamacion({
        tipo: form.tipo,
        nombres: form.nombres.trim(),
        apellido_paterno: form.apellidoPaterno.trim(),
        apellido_materno: form.apellidoMaterno.trim() || null,
        tipo_documento: form.tipoDocumento,
        numero_documento: form.numeroDocumento.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim() || null,
        domicilio: form.domicilio.trim() || null,
        es_menor_edad: form.esMenorEdad,
        apoderado_nombre: form.esMenorEdad ? form.apoderadoNombre.trim() : null,
        producto: form.producto.trim() || null,
        tipo_comprobante: form.tipoComprobante,
        numero_comprobante: form.numeroComprobante.trim() || null,
        monto_reclamado: form.montoReclamado ? Number(form.montoReclamado) : null,
        descripcion_bien: form.descripcionBien.trim() || null,
        detalle: form.detalle.trim(),
        pedido: form.pedido.trim(),
      })
      setRegistrado(fila)
      window.scrollTo({ top: 0, behavior: 'instant' })
    } catch (err) {
      toast.error(err.message || 'No se pudo registrar el reclamo.')
    } finally {
      setEnviando(false)
    }
  }

  if (registrado) {
    return (
      <Layout>
        <div className="bg-white">
          <div className="mx-auto max-w-xl px-6 py-24 text-center lg:px-8 lg:py-32 print:py-8">
            <CheckCircleIcon className="mx-auto mb-8 h-14 w-14 text-clay print:hidden" strokeWidth={1} />
            <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">
              {form.tipo === 'reclamo' ? 'Reclamo' : 'Queja'} registrado
            </p>
            <h1 className="mb-5 font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl">
              Código {registrado.codigo}
            </h1>
            <p className="mx-auto mb-10 max-w-md font-light leading-relaxed text-ink-soft">
              Guarda este código como referencia. Te responderemos al correo{' '}
              <strong className="text-ink">{registrado.correo}</strong> en un plazo no mayor a{' '}
              {PLAZO_RESPUESTA_DIAS_HABILES} días hábiles.
            </p>

            <div className="mb-10 rounded-xl bg-cream p-7 text-left text-sm lg:p-8">
              <p className="mb-4 text-[10px] uppercase tracking-luxe text-ink-muted">Resumen de tu {form.tipo}</p>
              <dl className="space-y-2 text-ink-soft">
                <div className="flex justify-between gap-4"><dt>Nombre</dt><dd className="text-ink">{registrado.nombres} {registrado.apellido_paterno}</dd></div>
                <div className="flex justify-between gap-4"><dt>Documento</dt><dd className="text-ink">{registrado.tipo_documento} {registrado.numero_documento}</dd></div>
                {registrado.producto && <div className="flex justify-between gap-4"><dt>Producto</dt><dd className="text-ink">{registrado.producto}</dd></div>}
                <div className="pt-2"><dt className="mb-1">Detalle</dt><dd className="text-ink">{registrado.detalle}</dd></div>
                <div className="pt-2"><dt className="mb-1">Pedido</dt><dd className="text-ink">{registrado.pedido}</dd></div>
              </dl>
            </div>

            <p className="mb-10 max-w-md mx-auto text-xs font-light leading-relaxed text-ink-muted">
              La formulación de {form.tipo === 'reclamo' ? 'un reclamo' : 'una queja'} no impide acudir a otras vías
              de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-8 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:border-ink"
              >
                <PrinterIcon className="h-4 w-4" />
                Imprimir / guardar copia
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-white">
        <section className="bg-cream py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <p className="hero-line mb-4 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
              Libro de reclamaciones
            </p>
            <h1 className="hero-line mb-5 font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl" style={{ animationDelay: '0.14s' }}>
              Libro de Reclamaciones
            </h1>
            <p className="hero-line max-w-2xl font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.22s' }}>
              Conforme al Código de Protección y Defensa del Consumidor (Ley N.° 29571) y su reglamento
              (D.S. N.° 011-2011-PCM). Este es el Libro de Reclamaciones virtual de <strong className="text-ink">{RAZON_SOCIAL}</strong> — RUC{' '}
              <strong className="text-ink">{RUC}</strong> — {NOMBRE_COMERCIAL}, con domicilio en {DOMICILIO_ESTABLECIMIENTO}.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 py-14 lg:px-8 lg:py-16">
          <form onSubmit={handleSubmit} noValidate className="space-y-14">
            {/* Tipo */}
            <fieldset>
              <legend className="mb-4 font-serif text-xl font-light text-ink">Tipo de registro</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { value: 'reclamo', titulo: 'Reclamo', desc: 'Disconformidad relacionada a un producto o servicio.' },
                  { value: 'queja', titulo: 'Queja', desc: 'Malestar o descontento respecto a la atención recibida.' },
                ].map((op) => (
                  <label
                    key={op.value}
                    className={`cursor-pointer rounded-xl border p-5 transition-colors ${
                      form.tipo === op.value ? 'border-clay bg-clay/5' : 'border-ink/15 hover:border-ink/30'
                    }`}
                  >
                    <input type="radio" name="tipo" value={op.value} checked={form.tipo === op.value} onChange={handleChange} className="sr-only" />
                    <span className="mb-1 block font-serif text-base text-ink">{op.titulo}</span>
                    <span className="block text-xs font-light text-ink-muted">{op.desc}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* 1. Identificación del consumidor */}
            <fieldset>
              <legend className="mb-5 font-serif text-xl font-light text-ink">1. Identificación del consumidor reclamante</legend>
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                <div>
                  <label htmlFor="nombres" className={labelClass}>Nombres *</label>
                  <input id="nombres" name="nombres" value={form.nombres} onChange={handleChange} className={inputClass(errors.nombres)} />
                </div>
                <div>
                  <label htmlFor="apellidoPaterno" className={labelClass}>Apellido paterno *</label>
                  <input id="apellidoPaterno" name="apellidoPaterno" value={form.apellidoPaterno} onChange={handleChange} className={inputClass(errors.apellidoPaterno)} />
                </div>
                <div>
                  <label htmlFor="apellidoMaterno" className={labelClass}>Apellido materno</label>
                  <input id="apellidoMaterno" name="apellidoMaterno" value={form.apellidoMaterno} onChange={handleChange} className={inputClass(false)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="tipoDocumento" className={labelClass}>Documento *</label>
                    <select id="tipoDocumento" name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className={selectClass(false)}>
                      {TIPOS_DOCUMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="numeroDocumento" className={labelClass}>N.° *</label>
                    <input id="numeroDocumento" name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} className={inputClass(errors.numeroDocumento)} />
                  </div>
                </div>
                <div>
                  <label htmlFor="correo" className={labelClass}>Correo electrónico *</label>
                  <input id="correo" type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="tucorreo@ejemplo.com" className={inputClass(errors.correo)} />
                </div>
                <div>
                  <label htmlFor="telefono" className={labelClass}>Teléfono</label>
                  <input id="telefono" type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="999 999 999" className={inputClass(false)} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="domicilio" className={labelClass}>Domicilio</label>
                  <input id="domicilio" name="domicilio" value={form.domicilio} onChange={handleChange} className={inputClass(false)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <input type="checkbox" name="esMenorEdad" checked={form.esMenorEdad} onChange={handleChange} className="h-4 w-4 rounded border-ink/30 text-clay focus:ring-clay" />
                    Quien reclama es menor de edad
                  </label>
                </div>
                {form.esMenorEdad && (
                  <div className="sm:col-span-2">
                    <label htmlFor="apoderadoNombre" className={labelClass}>Nombre del padre, madre o apoderado *</label>
                    <input id="apoderadoNombre" name="apoderadoNombre" value={form.apoderadoNombre} onChange={handleChange} className={inputClass(errors.apoderadoNombre)} />
                  </div>
                )}
              </div>
            </fieldset>

            {/* 2. Identificación del bien contratado */}
            <fieldset>
              <legend className="mb-5 font-serif text-xl font-light text-ink">2. Identificación del bien contratado</legend>
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="producto" className={labelClass}>Producto o pedido</label>
                  <input id="producto" name="producto" value={form.producto} onChange={handleChange} placeholder="Ej. Vestido Lamé, talla M" className={inputClass(false)} />
                </div>
                <div>
                  <label htmlFor="tipoComprobante" className={labelClass}>Tipo de comprobante</label>
                  <select id="tipoComprobante" name="tipoComprobante" value={form.tipoComprobante} onChange={handleChange} className={selectClass(false)}>
                    {TIPOS_COMPROBANTE.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="numeroComprobante" className={labelClass}>N.° de comprobante / pedido</label>
                  <input id="numeroComprobante" name="numeroComprobante" value={form.numeroComprobante} onChange={handleChange} className={inputClass(false)} />
                </div>
                <div>
                  <label htmlFor="montoReclamado" className={labelClass}>Monto reclamado (S/.)</label>
                  <input id="montoReclamado" type="number" min="0" step="0.01" name="montoReclamado" value={form.montoReclamado} onChange={handleChange} className={inputClass(false)} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="descripcionBien" className={labelClass}>Descripción</label>
                  <textarea id="descripcionBien" name="descripcionBien" value={form.descripcionBien} onChange={handleChange} rows={2} className={`${inputClass(false)} resize-none`} />
                </div>
              </div>
            </fieldset>

            {/* 3. Detalle */}
            <fieldset>
              <legend className="mb-5 font-serif text-xl font-light text-ink">3. Detalle de la {form.tipo === 'reclamo' ? 'reclamación' : 'queja'} y pedido del consumidor</legend>
              <div className="space-y-7">
                <div>
                  <label htmlFor="detalle" className={labelClass}>Detalle de tu {form.tipo === 'reclamo' ? 'reclamación' : 'queja'} *</label>
                  <textarea id="detalle" name="detalle" value={form.detalle} onChange={handleChange} rows={4} className={`${inputClass(errors.detalle)} resize-none`} />
                </div>
                <div>
                  <label htmlFor="pedido" className={labelClass}>Pedido (qué solicitas: cambio, devolución, respuesta, etc.) *</label>
                  <textarea id="pedido" name="pedido" value={form.pedido} onChange={handleChange} rows={2} className={`${inputClass(errors.pedido)} resize-none`} />
                </div>
              </div>
            </fieldset>

            <div>
              <button
                type="submit"
                disabled={enviando}
                className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-all duration-500 hover:bg-clay disabled:opacity-60 md:w-auto md:px-12"
              >
                {enviando ? 'Enviando…' : `Enviar ${form.tipo === 'reclamo' ? 'reclamo' : 'queja'}`}
              </button>
              <p className="mt-6 max-w-xl text-xs font-light leading-relaxed text-ink-muted">
                La formulación de {form.tipo === 'reclamo' ? 'un reclamo' : 'una queja'} no impide acudir a otras vías de
                solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI. {RAZON_SOCIAL}{' '}
                dará respuesta en un plazo no mayor a {PLAZO_RESPUESTA_DIAS_HABILES} días hábiles improrrogables, al
                correo electrónico consignado en este formulario.
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
