import { useEffect, useMemo, useState } from 'react'
import { ArrowDownTrayIcon, MagnifyingGlassIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { listReclamaciones, responderReclamacion, updateReclamacionInterna } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { PLAZO_RESPUESTA_DIAS_HABILES } from '../../config/legal.js'
import IdBadge from '../../components/admin/IdBadge.jsx'
import { PageHeader, Chip, Drawer, Dato, TablaVacia, btnPrimary, btnSecondary, pillInputClass, inputClass, labelClass } from '../../components/admin/AdminUI.jsx'
import { diasHabilesTranscurridos, fechaCorta, fechaHora, whatsappHref, descargarCSV } from '../../utils/adminUtils.js'

const FILTROS = { pendiente: 'Pendientes', respondido: 'Respondidos', todos: 'Todos', prueba: 'De prueba' }

const nombreCompleto = (r) => [r.nombres, r.apellido_paterno, r.apellido_materno].filter(Boolean).join(' ')

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

// Hoja imprimible (o "Guardar como PDF") con todo lo que registró la clienta.
function imprimirHoja(r) {
  const filas = [
    ['Código', r.codigo],
    ['Fecha de registro', new Date(r.created_at).toLocaleString('es-PE')],
    ['Tipo', r.tipo],
    ['Consumidor', nombreCompleto(r)],
    ['Documento', `${r.tipo_documento} ${r.numero_documento}`],
    ['Domicilio', r.domicilio],
    ['Correo', r.correo],
    ['Teléfono', r.telefono],
    ['Menor de edad', r.es_menor_edad ? `Sí — apoderado: ${r.apoderado_nombre || ''}` : 'No'],
    ['Bien contratado', [r.producto, r.descripcion_bien].filter(Boolean).join(' — ')],
    ['Comprobante', [r.tipo_comprobante, r.numero_comprobante].filter(Boolean).join(' ')],
    ['Monto reclamado', r.monto_reclamado != null ? `S/ ${r.monto_reclamado}` : ''],
    ['Detalle', r.detalle],
    ['Pedido del consumidor', r.pedido],
    ['Respuesta del proveedor', r.respuesta || '(pendiente)'],
    ['Fecha de respuesta', r.respondido_at ? new Date(r.respondido_at).toLocaleString('es-PE') : ''],
  ]
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Hoja de reclamación ${escapeHtml(r.codigo)}</title>
  <style>body{font-family:Georgia,serif;color:#2B2424;max-width:760px;margin:40px auto;padding:0 20px}h1{font-weight:400;font-size:22px}
  table{width:100%;border-collapse:collapse;font-size:14px}td{border:1px solid #ddd;padding:8px 10px;vertical-align:top}td:first-child{width:200px;color:#756967}
  p{font-size:12px;color:#756967}</style></head><body>
  <h1>Libro de Reclamaciones — Hoja ${escapeHtml(r.codigo)}</h1>
  <table>${filas.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v || '—').replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>
  <p>Victoria Modas · impreso el ${escapeHtml(new Date().toLocaleString('es-PE'))}</p>
  <script>window.onload=()=>window.print()</script></body></html>`)
  w.document.close()
}

export default function AdminReclamacionesPage() {
  useDocumentMeta({ title: 'Libro de Reclamaciones | Panel admin' })
  const toast = useToast()
  const [reclamos, setReclamos] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [filtro, setFiltro] = useState('pendiente')
  const [busqueda, setBusqueda] = useState('')

  const cargar = () => {
    listReclamaciones()
      .then(setReclamos)
      .catch((err) => toast.error('No se pudo cargar: ' + err.message))
  }

  useEffect(cargar, []) // eslint-disable-line react-hooks/exhaustive-deps

  const conDias = useMemo(
    () => (reclamos || []).map((r) => ({ ...r, dias: diasHabilesTranscurridos(r.created_at) })),
    [reclamos]
  )

  const lista = useMemo(() => {
    const term = busqueda.trim().toLowerCase()
    return conDias.filter((r) => {
      if (filtro === 'prueba') {
        if (!r.es_prueba) return false
      } else {
        if (r.es_prueba) return false
        if (filtro !== 'todos' && r.estado !== filtro) return false
      }
      if (!term) return true
      return [r.codigo, nombreCompleto(r), r.numero_documento, r.correo, r.telefono, r.producto].filter(Boolean).some((s) => s.toLowerCase().includes(term))
    })
  }, [conDias, filtro, busqueda])

  const reales = conDias.filter((r) => !r.es_prueba && r.estado === 'pendiente')
  const vencidos = reales.filter((r) => r.dias > PLAZO_RESPUESTA_DIAS_HABILES)
  const porVencer = reales.filter((r) => r.dias <= PLAZO_RESPUESTA_DIAS_HABILES && r.dias >= PLAZO_RESPUESTA_DIAS_HABILES - 3)

  const exportar = () => {
    descargarCSV(`reclamaciones-${new Date().toISOString().slice(0, 10)}.csv`, [
      { label: 'Código', value: (r) => r.codigo },
      { label: 'Fecha', value: (r) => new Date(r.created_at).toLocaleString('es-PE') },
      { label: 'Tipo', value: (r) => r.tipo },
      { label: 'Consumidor', value: (r) => nombreCompleto(r) },
      { label: 'Documento', value: (r) => `${r.tipo_documento} ${r.numero_documento}` },
      { label: 'Correo', value: (r) => r.correo },
      { label: 'Teléfono', value: (r) => r.telefono },
      { label: 'Producto', value: (r) => r.producto },
      { label: 'Monto reclamado', value: (r) => r.monto_reclamado },
      { label: 'Detalle', value: (r) => r.detalle },
      { label: 'Pedido', value: (r) => r.pedido },
      { label: 'Estado', value: (r) => r.estado },
      { label: 'Respuesta', value: (r) => r.respuesta },
      { label: 'Fecha respuesta', value: (r) => (r.respondido_at ? new Date(r.respondido_at).toLocaleString('es-PE') : '') },
      { label: 'Días hábiles', value: (r) => r.dias },
      { label: 'Prueba', value: (r) => (r.es_prueba ? 'Sí' : 'No') },
    ], lista)
  }

  const actualizar = (id, cambios) => {
    setReclamos((prev) => prev.map((r) => (r.id === id ? { ...r, ...cambios } : r)))
    setSeleccionado((s) => (s?.id === id ? { ...s, ...cambios } : s))
  }

  if (reclamos === null) return <p className="text-ink-muted">Cargando…</p>

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Libro de Reclamaciones"
        subtitle={`Plazo legal de respuesta: ${PLAZO_RESPUESTA_DIAS_HABILES} días hábiles desde el registro.`}
      >
        <button type="button" onClick={exportar} disabled={!lista.length} className={btnSecondary}>
          <ArrowDownTrayIcon className="h-4 w-4" />
          Exportar
        </button>
      </PageHeader>

      {vencidos.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {vencidos.length} reclamo{vencidos.length === 1 ? '' : 's'} superaron el plazo legal de {PLAZO_RESPUESTA_DIAS_HABILES} días hábiles. Si alguno es una prueba, márcalo como tal en su detalle.
        </div>
      )}
      {porVencer.length > 0 && (
        <div className="mb-4 rounded-xl border border-clay/30 bg-clay/5 p-4 text-sm text-clay-dark">
          {porVencer.length} reclamo{porVencer.length === 1 ? '' : 's'} vence{porVencer.length === 1 ? '' : 'n'} en 3 días hábiles o menos.
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código, nombre, documento, correo..."
            className={`w-full pl-9 ${pillInputClass}`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(FILTROS).map(([f, label]) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.1em] transition-colors ${
                filtro === f ? 'bg-ink text-cream' : 'border border-ink/20 text-ink-soft hover:border-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-luxe text-ink-muted">
              <th className="px-5 py-3">Código</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Consumidor</th>
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3">Plazo</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && <TablaVacia cols={7}>No hay reclamos en esta vista.</TablaVacia>}
            {lista.map((r) => (
              <tr key={r.id} className="border-t border-ink/5">
                <td className="px-5 py-3"><IdBadge value={r.codigo} full /></td>
                <td className="px-5 py-3 capitalize text-ink-soft">{r.tipo}</td>
                <td className="px-5 py-3 text-ink">{r.nombres} {r.apellido_paterno}</td>
                <td className="whitespace-nowrap px-5 py-3 text-ink-soft">{fechaCorta(r.created_at)}</td>
                <td className="whitespace-nowrap px-5 py-3"><Plazo r={r} /></td>
                <td className="px-5 py-3">
                  {r.es_prueba ? <Chip>Prueba</Chip> : <Chip tone={r.estado === 'respondido' ? 'clay' : 'neutral'}>{r.estado}</Chip>}
                </td>
                <td className="px-5 py-3 text-right">
                  <button type="button" onClick={() => setSeleccionado(r)} className="text-xs uppercase tracking-[0.1em] text-clay hover:text-clay-dark">
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetalleReclamo reclamo={seleccionado} onClose={() => setSeleccionado(null)} onCambio={actualizar} onRecargar={cargar} />
    </div>
  )
}

function Plazo({ r }) {
  if (r.estado === 'respondido') return <span className="text-ink-muted">Respondido</span>
  if (r.es_prueba) return <span className="text-ink-muted">—</span>
  const restantes = PLAZO_RESPUESTA_DIAS_HABILES - r.dias
  if (restantes < 0) return <span className="font-medium text-red-600">Vencido hace {-restantes} d.h.</span>
  return <span className={restantes <= 3 ? 'font-medium text-clay-dark' : 'text-ink-soft'}>Quedan {restantes} d.h.</span>
}

function DetalleReclamo({ reclamo, onClose, onCambio, onRecargar }) {
  const toast = useToast()
  const [respuesta, setRespuesta] = useState('')
  const [notas, setNotas] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    setRespuesta(reclamo?.respuesta || '')
    setNotas(reclamo?.notas_internas || '')
  }, [reclamo?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!reclamo) return null
  const r = reclamo

  const textoRespuesta = `Hola ${r.nombres}, respecto a tu ${r.tipo} N.° ${r.codigo} registrado en el Libro de Reclamaciones de Victoria Modas:\n\n${respuesta.trim()}\n\nSaludos,\nVictoria Modas`
  const wa = respuesta.trim() ? whatsappHref(r.telefono, textoRespuesta) : null
  const mailto = respuesta.trim() && r.correo
    ? `mailto:${encodeURIComponent(r.correo)}?subject=${encodeURIComponent(`Respuesta a tu ${r.tipo} ${r.codigo} — Victoria Modas`)}&body=${encodeURIComponent(textoRespuesta)}`
    : null

  const guardarRespuesta = async () => {
    if (!respuesta.trim()) {
      toast.error('Escribe una respuesta antes de guardar.')
      return
    }
    setEnviando(true)
    try {
      await responderReclamacion(r.id, respuesta.trim())
      toast.success('Respuesta guardada. Ahora envíasela a la clienta por correo o WhatsApp.')
      onCambio(r.id, { respuesta: respuesta.trim(), estado: 'respondido', respondido_at: new Date().toISOString() })
      onRecargar()
    } catch (err) {
      toast.error('No se pudo guardar: ' + err.message)
    } finally {
      setEnviando(false)
    }
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoRespuesta)
      toast.success('Respuesta copiada.')
    } catch {
      toast.error('No se pudo copiar.')
    }
  }

  const guardarInterno = async (cambios) => {
    try {
      await updateReclamacionInterna(r.id, cambios)
      onCambio(r.id, cambios)
      toast.success('Guardado.')
    } catch (err) {
      toast.error('No se pudo guardar: ' + err.message)
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      kicker={`${r.tipo} — ${r.codigo}`}
      title={nombreCompleto(r)}
      footer={
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => imprimirHoja({ ...r, respuesta: r.respuesta })} className={btnSecondary}>
            <PrinterIcon className="h-4 w-4" />
            Imprimir / PDF
          </button>
          <label className="ml-auto flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={!!r.es_prueba} onChange={(e) => guardarInterno({ es_prueba: e.target.checked })} />
            Es un registro de prueba
          </label>
        </div>
      }
    >
      <dl className="mb-6 grid grid-cols-[auto,1fr] gap-x-5 gap-y-2 text-sm">
        <Dato label="Registrado">{fechaHora(r.created_at)}</Dato>
        <Dato label="Plazo"><Plazo r={r} /></Dato>
        <Dato label="Documento">{`${r.tipo_documento} ${r.numero_documento}`}</Dato>
        <Dato label="Correo">{r.correo}</Dato>
        <Dato label="Teléfono">{r.telefono}</Dato>
        <Dato label="Domicilio">{r.domicilio}</Dato>
        {r.es_menor_edad && <Dato label="Apoderado">{r.apoderado_nombre}</Dato>}
        <Dato label="Producto">{[r.producto, r.descripcion_bien].filter(Boolean).join(' — ')}</Dato>
        <Dato label="Comprobante">{[r.tipo_comprobante, r.numero_comprobante].filter(Boolean).join(' ')}</Dato>
        {r.monto_reclamado != null && <Dato label="Monto reclamado">S/ {r.monto_reclamado}</Dato>}
      </dl>

      <p className={labelClass}>Detalle</p>
      <p className="mb-4 whitespace-pre-line text-sm text-ink-soft">{r.detalle}</p>
      <p className={labelClass}>Pedido del consumidor</p>
      <p className="mb-6 whitespace-pre-line text-sm text-ink-soft">{r.pedido}</p>

      <label className={labelClass} htmlFor="respuesta-reclamo">Observaciones y acciones adoptadas por el proveedor</label>
      <textarea
        id="respuesta-reclamo"
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        rows={5}
        placeholder="Escribe la respuesta que recibirá la clienta..."
        className={`mb-3 ${inputClass}`}
      />
      <div className="mb-2 flex flex-wrap gap-2">
        <button type="button" onClick={guardarRespuesta} disabled={enviando} className={btnPrimary}>
          {enviando ? 'Guardando…' : r.estado === 'respondido' ? 'Actualizar respuesta' : 'Guardar respuesta'}
        </button>
        {mailto && <a href={mailto} className={btnSecondary}>Enviar por correo</a>}
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={btnSecondary}>Enviar por WhatsApp</a>}
        {respuesta.trim() && <button type="button" onClick={copiar} className={btnSecondary}>Copiar</button>}
      </div>
      <p className="mb-8 text-xs text-ink-muted">
        Guardar deja constancia en el sistema. La clienta la recibe cuando se la envías por correo o WhatsApp con los botones de arriba.
      </p>

      <label className={labelClass} htmlFor="notas-reclamo">Notas internas (no las ve la clienta)</label>
      <textarea id="notas-reclamo" value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className={`mb-3 ${inputClass}`} />
      <button type="button" onClick={() => guardarInterno({ notas_internas: notas })} disabled={notas === (r.notas_internas || '')} className={btnSecondary}>
        Guardar notas
      </button>
    </Drawer>
  )
}
