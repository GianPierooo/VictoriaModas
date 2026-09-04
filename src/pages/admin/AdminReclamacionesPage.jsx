import { useEffect, useState } from 'react'
import { listReclamaciones, responderReclamacion } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { PLAZO_RESPUESTA_DIAS_HABILES } from '../../config/legal.js'

function diasHabilesTranscurridos(desde) {
  const inicio = new Date(desde)
  const ahora = new Date()
  let dias = 0
  const cursor = new Date(inicio)
  while (cursor < ahora) {
    cursor.setDate(cursor.getDate() + 1)
    const diaSemana = cursor.getDay()
    if (diaSemana !== 0 && diaSemana !== 6) dias++
  }
  return dias
}

export default function AdminReclamacionesPage() {
  useDocumentMeta({ title: 'Libro de Reclamaciones | Panel admin' })
  const toast = useToast()
  const [reclamos, setReclamos] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [respuesta, setRespuesta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [filtro, setFiltro] = useState('pendiente')

  const cargar = () => {
    listReclamaciones()
      .then(setReclamos)
      .catch((err) => toast.error('No se pudo cargar: ' + err.message))
  }

  useEffect(cargar, []) // eslint-disable-line react-hooks/exhaustive-deps

  const abrir = (r) => {
    setSeleccionado(r)
    setRespuesta(r.respuesta || '')
  }

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) {
      toast.error('Escribe una respuesta antes de enviar.')
      return
    }
    setEnviando(true)
    try {
      await responderReclamacion(seleccionado.id, respuesta.trim())
      toast.success('Respuesta guardada.')
      setSeleccionado(null)
      cargar()
    } catch (err) {
      toast.error('No se pudo guardar: ' + err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (reclamos === null) return <p className="text-ink-muted">Cargando…</p>

  const lista = reclamos.filter((r) => filtro === 'todos' || r.estado === filtro)
  const pendientesVencidos = reclamos.filter((r) => r.estado === 'pendiente' && diasHabilesTranscurridos(r.created_at) > PLAZO_RESPUESTA_DIAS_HABILES)

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-light text-ink">Libro de Reclamaciones</h1>
        <div className="flex gap-2">
          {['pendiente', 'respondido', 'todos'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.1em] transition-colors ${
                filtro === f ? 'bg-ink text-cream' : 'border border-ink/20 text-ink-soft hover:border-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {pendientesVencidos.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {pendientesVencidos.length} reclamo(s) superaron los {PLAZO_RESPUESTA_DIAS_HABILES} días hábiles de plazo legal de respuesta.
        </div>
      )}

      {lista.length === 0 ? (
        <p className="text-sm text-ink-muted">No hay reclamos {filtro !== 'todos' ? `en estado "${filtro}"` : 'todavía'}.</p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-[10px] uppercase tracking-luxe text-ink-muted">
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Consumidor</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Días hábiles</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((r) => {
                const dias = diasHabilesTranscurridos(r.created_at)
                const vencido = r.estado === 'pendiente' && dias > PLAZO_RESPUESTA_DIAS_HABILES
                return (
                  <tr key={r.id} className="border-t border-ink/5">
                    <td className="px-5 py-3 font-mono text-xs text-ink-soft">{r.codigo}</td>
                    <td className="px-5 py-3 capitalize text-ink-soft">{r.tipo}</td>
                    <td className="px-5 py-3 text-ink">{r.nombres} {r.apellido_paterno}</td>
                    <td className="px-5 py-3 text-ink-soft">{new Date(r.created_at).toLocaleDateString('es-PE')}</td>
                    <td className={`px-5 py-3 ${vencido ? 'font-medium text-red-600' : 'text-ink-soft'}`}>{dias}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${
                        r.estado === 'respondido' ? 'bg-clay/10 text-clay-dark' : 'bg-cream-dark text-ink-soft'
                      }`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => abrir(r)} className="text-xs uppercase tracking-[0.1em] text-clay hover:text-clay-dark">
                        Ver
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detalle / responder */}
      {seleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={() => setSeleccionado(null)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-7 shadow-soft" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-luxe text-clay">{seleccionado.tipo} — {seleccionado.codigo}</p>
                <h2 className="font-serif text-xl font-light text-ink">{seleccionado.nombres} {seleccionado.apellido_paterno} {seleccionado.apellido_materno}</h2>
              </div>
              <button type="button" onClick={() => setSeleccionado(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <dl className="mb-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-ink-muted">Documento</dt><dd className="text-ink">{seleccionado.tipo_documento} {seleccionado.numero_documento}</dd>
              <dt className="text-ink-muted">Correo</dt><dd className="text-ink">{seleccionado.correo}</dd>
              <dt className="text-ink-muted">Teléfono</dt><dd className="text-ink">{seleccionado.telefono || '—'}</dd>
              {seleccionado.producto && <><dt className="text-ink-muted">Producto</dt><dd className="text-ink">{seleccionado.producto}</dd></>}
              {seleccionado.monto_reclamado != null && <><dt className="text-ink-muted">Monto reclamado</dt><dd className="text-ink">S/ {seleccionado.monto_reclamado}</dd></>}
            </dl>

            <div className="mb-4">
              <p className="mb-1 text-[10px] uppercase tracking-luxe text-ink-muted">Detalle</p>
              <p className="text-sm text-ink-soft">{seleccionado.detalle}</p>
            </div>
            <div className="mb-6">
              <p className="mb-1 text-[10px] uppercase tracking-luxe text-ink-muted">Pedido del consumidor</p>
              <p className="text-sm text-ink-soft">{seleccionado.pedido}</p>
            </div>

            <label className="mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted">
              Observaciones y acciones adoptadas por el proveedor
            </label>
            <textarea
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              rows={4}
              placeholder="Escribe la respuesta que recibirá la clienta..."
              className="mb-4 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none"
            />
            <p className="mb-4 text-xs text-ink-muted">
              Nota: esto queda registrado en el sistema. Para que la clienta la reciba, cópiala y envíasela por correo o WhatsApp.
            </p>
            <button
              type="button"
              onClick={enviarRespuesta}
              disabled={enviando}
              className="rounded-full bg-ink px-8 py-3 text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-clay disabled:opacity-60"
            >
              {enviando ? 'Guardando…' : 'Guardar respuesta'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
