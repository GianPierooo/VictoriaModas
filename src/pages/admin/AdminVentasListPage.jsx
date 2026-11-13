import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, ArrowDownTrayIcon, MagnifyingGlassIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { listVentasStaff, updateVentaEstado, cancelarVenta, updateVentaNotas } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { formatPEN } from '../../utils/price.js'
import IdBadge from '../../components/admin/IdBadge.jsx'
import {
  PageHeader,
  StatCard,
  Chip,
  Drawer,
  Dato,
  TablaVacia,
  btnPrimary,
  btnSecondary,
  pillInputClass,
  inputClass,
  labelClass,
} from '../../components/admin/AdminUI.jsx'
import {
  ESTADOS_VENTA,
  ESTADO_VENTA_LABEL,
  origenLabel,
  fechaCorta,
  fechaHora,
  whatsappHref,
  descargarCSV,
} from '../../utils/adminUtils.js'

const PEN = (n) => formatPEN(n) || `S/ ${Number(n || 0).toFixed(2)}`
const PERIODOS = { todo: 'Todo', hoy: 'Hoy', '7d': 'Últimos 7 días', mes: 'Este mes', 'mes-ant': 'Mes anterior' }

function rangoPeriodo(p) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  if (p === 'hoy') return [hoy, null]
  if (p === '7d') {
    const d = new Date(hoy)
    d.setDate(d.getDate() - 6)
    return [d, null]
  }
  if (p === 'mes') return [new Date(hoy.getFullYear(), hoy.getMonth(), 1), null]
  if (p === 'mes-ant') return [new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1), new Date(hoy.getFullYear(), hoy.getMonth(), 1)]
  return [null, null]
}

const escHTML = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// Comprobante interno (no es boleta SUNAT): ventana aparte lista para imprimir
// o "Guardar como PDF", con ancho de ticket de 80 mm.
function imprimirTicket(venta) {
  const w = window.open('', '_blank', 'width=420,height=700')
  if (!w) return false
  const c = venta.clientes
  const filas = (venta.venta_items || [])
    .map((it) => {
      const v = it.producto_variantes
      const detalle = v ? `${v.colores?.nombre || ''} / ${v.tallas?.nombre || ''}` : ''
      return `<tr><td>${it.cantidad}</td><td>${escHTML(v?.productos?.nombre || 'Producto')}<br><small>${escHTML(detalle)}</small></td><td class="r">${escHTML(PEN(it.precio_unitario))}</td><td class="r">${escHTML(PEN(it.cantidad * it.precio_unitario))}</td></tr>`
    })
    .join('')
  const descuento = Number(venta.descuento) > 0
    ? `<tr><td colspan="3">Descuento${venta.cupones?.codigo ? ` (${escHTML(venta.cupones.codigo)})` : ''}</td><td class="r">− ${escHTML(PEN(venta.descuento))}</td></tr>`
    : ''
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escHTML(venta.codigo)}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:12px;color:#2B2424;width:72mm;margin:0 auto;padding:4mm 0}
  h1{font-size:16px;text-align:center;margin:0;letter-spacing:.15em}
  p{margin:2px 0}.c{text-align:center}.r{text-align:right}
  table{width:100%;border-collapse:collapse;margin:6px 0}
  td{padding:3px 2px;vertical-align:top;border-bottom:1px dashed #ccc}
  .tot td{border:0;font-weight:bold;font-size:14px}
  hr{border:0;border-top:1px dashed #999;margin:6px 0}
  small{color:#756967}
  @media print{@page{size:80mm auto;margin:0}}
</style></head><body>
<h1>VICTORIA MODAS</h1>
<p class="c">Gamarra, Lima · WhatsApp 994 347 405</p>
<p class="c">www.victoriamodas.online</p>
<hr>
<p class="c"><b>COMPROBANTE INTERNO DE VENTA</b></p>
<p class="c"><b>${escHTML(venta.codigo)}</b></p>
<p>Fecha: ${escHTML(new Date(venta.created_at).toLocaleString('es-PE'))}</p>
<p>Estado: ${escHTML(ESTADO_VENTA_LABEL[venta.estado] || venta.estado)} · ${escHTML(origenLabel(venta.origen))}</p>
${c?.nombre ? `<p>Cliente: ${escHTML(c.nombre)}${c.codigo ? ` (${escHTML(c.codigo)})` : ''}</p>` : ''}
${c?.documento ? `<p>${escHTML(c.tipo_documento || 'Doc.')}: ${escHTML(c.documento)}</p>` : ''}
${venta.telefono_contacto || c?.telefono ? `<p>Teléfono: ${escHTML(venta.telefono_contacto || c.telefono)}</p>` : ''}
${venta.direccion_envio ? `<p>Envío: ${escHTML(venta.direccion_envio)}</p>` : ''}
<table><tr><td><b>Cant</b></td><td><b>Descripción</b></td><td class="r"><b>P.U.</b></td><td class="r"><b>Importe</b></td></tr>
${filas}
<tr><td colspan="3">Subtotal</td><td class="r">${escHTML(PEN(venta.subtotal))}</td></tr>
${descuento}
<tr class="tot"><td colspan="3">TOTAL</td><td class="r">${escHTML(PEN(venta.total))}</td></tr></table>
${venta.referencia_pago ? `<p><small>Pago con tarjeta (Culqi): ${escHTML(venta.referencia_pago)}</small></p>` : ''}
<hr>
<p class="c"><small>Documento interno, no válido como comprobante de pago SUNAT.</small></p>
<p class="c">¡Gracias por tu compra!</p>
<script>window.onload=function(){window.print()}</script>
</body></html>`)
  w.document.close()
  return true
}

const describirItem = (it) => {
  const v = it.producto_variantes
  return `${it.cantidad}× ${v?.productos?.nombre || 'Producto'}${v ? ` (${v.colores?.nombre}/${v.tallas?.nombre})` : ''}`
}

export default function AdminVentasListPage() {
  useDocumentMeta({ title: 'Ventas | Panel admin' })
  const toast = useToast()
  const [ventas, setVentas] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('todos')
  const [origen, setOrigen] = useState('todos')
  const [periodo, setPeriodo] = useState('todo')
  const [abierta, setAbierta] = useState(null)

  const cargar = () => listVentasStaff().then(setVentas).catch((e) => toast.error(e.message))
  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtradas = useMemo(() => {
    const [desde, hasta] = rangoPeriodo(periodo)
    const term = busqueda.trim().toLowerCase()
    return (ventas || []).filter((v) => {
      if (estado !== 'todos' && v.estado !== estado) return false
      if (origen !== 'todos' && v.origen !== origen) return false
      const f = new Date(v.created_at)
      if (desde && f < desde) return false
      if (hasta && f >= hasta) return false
      if (!term) return true
      return [v.codigo, v.clientes?.nombre, v.clientes?.telefono, v.telefono_contacto, v.referencia_pago, ...(v.venta_items || []).map(describirItem)]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(term))
    })
  }, [ventas, busqueda, estado, origen, periodo])

  const totales = useMemo(() => {
    const validas = filtradas.filter((v) => v.estado !== 'cancelado')
    const monto = validas.reduce((s, v) => s + (Number(v.total) || 0), 0)
    const unidades = validas.reduce((s, v) => s + (v.venta_items || []).reduce((a, it) => a + it.cantidad, 0), 0)
    return { n: validas.length, monto, unidades, ticket: validas.length ? monto / validas.length : 0 }
  }, [filtradas])

  const origenes = useMemo(() => [...new Set((ventas || []).map((v) => v.origen).filter(Boolean))], [ventas])

  const reemplazar = (id, cambios) => {
    setVentas((prev) => prev.map((v) => (v.id === id ? { ...v, ...cambios } : v)))
    setAbierta((a) => (a?.id === id ? { ...a, ...cambios } : a))
  }

  const cambiarEstado = async (venta, nuevo) => {
    if (nuevo === venta.estado) return
    if (nuevo === 'cancelado') {
      const motivo = window.prompt(
        `¿Cancelar la venta ${venta.codigo}? Se devolverá el stock${venta.cupon_id ? ' y se liberará el cupón usado' : ''}.\n\nMotivo (opcional):`,
        ''
      )
      if (motivo === null) return
      try {
        await cancelarVenta(venta.id, motivo.trim())
        toast.success('Venta cancelada y stock devuelto.')
        cargar()
        setAbierta(null)
      } catch (err) {
        toast.error('No se pudo cancelar: ' + err.message)
      }
      return
    }
    if (venta.estado === 'cancelado') {
      toast.error('Una venta cancelada no se puede reactivar (el stock ya se devolvió). Registra una venta nueva.')
      return
    }
    try {
      await updateVentaEstado(venta.id, nuevo)
      reemplazar(venta.id, { estado: nuevo })
    } catch (err) {
      toast.error('No se pudo actualizar: ' + err.message)
    }
  }

  const exportar = () => {
    descargarCSV(`ventas-${new Date().toISOString().slice(0, 10)}.csv`, [
      { label: 'Código', value: (v) => v.codigo },
      { label: 'Fecha', value: (v) => new Date(v.created_at).toLocaleString('es-PE') },
      { label: 'Cliente', value: (v) => v.clientes?.nombre },
      { label: 'Teléfono', value: (v) => v.telefono_contacto || v.clientes?.telefono },
      { label: 'Artículos', value: (v) => (v.venta_items || []).map(describirItem).join(' | ') },
      { label: 'Subtotal', value: (v) => Number(v.subtotal).toFixed(2) },
      { label: 'Descuento', value: (v) => Number(v.descuento).toFixed(2) },
      { label: 'Total', value: (v) => Number(v.total).toFixed(2) },
      { label: 'Cupón', value: (v) => v.cupones?.codigo },
      { label: 'Estado', value: (v) => ESTADO_VENTA_LABEL[v.estado] || v.estado },
      { label: 'Origen', value: (v) => origenLabel(v.origen) },
      { label: 'Referencia de pago', value: (v) => v.referencia_pago },
      { label: 'Dirección', value: (v) => v.direccion_envio },
      { label: 'Notas', value: (v) => v.notas },
    ], filtradas)
  }

  return (
    <div className="max-w-6xl">
      <PageHeader title="Ventas">
        <button type="button" onClick={exportar} disabled={!filtradas.length} className={btnSecondary}>
          <ArrowDownTrayIcon className="h-4 w-4" />
          Exportar
        </button>
        <Link to="/admin/ventas/nueva" className={btnPrimary}>
          <PlusIcon className="h-4 w-4" />
          Nueva venta
        </Link>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ventas (sin canceladas)" value={totales.n} />
        <StatCard label="Monto" value={PEN(totales.monto)} />
        <StatCard label="Ticket promedio" value={PEN(totales.ticket)} />
        <StatCard label="Prendas vendidas" value={totales.unidades} />
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código, cliente, teléfono o producto..."
            className={`w-full pl-9 ${pillInputClass}`}
          />
        </div>
        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className={pillInputClass}>
          {Object.entries(PERIODOS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={pillInputClass}>
          <option value="todos">Todos los estados</option>
          {ESTADOS_VENTA.map((e) => <option key={e} value={e}>{ESTADO_VENTA_LABEL[e]}</option>)}
        </select>
        <select value={origen} onChange={(e) => setOrigen(e.target.value)} className={pillInputClass}>
          <option value="todos">Todo origen</option>
          {origenes.map((o) => <option key={o} value={o}>{origenLabel(o)}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-luxe text-ink-muted">
              <th className="px-5 py-4">Código</th>
              <th className="px-5 py-4">Fecha</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Artículos</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Origen</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {ventas === null && <TablaVacia cols={8}>Cargando…</TablaVacia>}
            {ventas !== null && filtradas.length === 0 && (
              <TablaVacia cols={8}>{ventas.length ? 'Ninguna venta coincide con los filtros.' : 'Sin ventas todavía.'}</TablaVacia>
            )}
            {filtradas.map((v) => (
              <tr key={v.id} className={`border-b border-ink/5 last:border-0 ${v.estado === 'cancelado' ? 'opacity-60' : ''}`}>
                <td className="px-5 py-4"><IdBadge value={v.codigo || v.id} /></td>
                <td className="whitespace-nowrap px-5 py-4 text-ink-soft">{fechaCorta(v.created_at)}</td>
                <td className="px-5 py-4 font-light text-ink">{v.clientes?.nombre || '—'}</td>
                <td className="px-5 py-4 text-ink-soft">
                  {(v.venta_items || []).map((it, i) => <div key={i}>{describirItem(it)}</div>)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-serif text-ink">{PEN(v.total)}</td>
                <td className="px-5 py-4"><Chip tone={v.origen === 'culqi' ? 'clay' : 'neutral'}>{origenLabel(v.origen)}</Chip></td>
                <td className="px-5 py-4">
                  <SelectorEstado venta={v} onChange={cambiarEstado} />
                </td>
                <td className="px-5 py-4 text-right">
                  <button type="button" onClick={() => setAbierta(v)} className="text-xs uppercase tracking-wide text-clay hover:text-clay-dark">
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetalleVenta venta={abierta} onClose={() => setAbierta(null)} onEstado={cambiarEstado} onNotas={reemplazar} />
    </div>
  )
}

function SelectorEstado({ venta, onChange }) {
  return (
    <select
      value={venta.estado}
      onChange={(e) => onChange(venta, e.target.value)}
      disabled={venta.estado === 'cancelado'}
      className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs uppercase tracking-wide text-ink-soft focus:border-clay focus:outline-none disabled:opacity-70"
    >
      {ESTADOS_VENTA.map((e) => <option key={e} value={e}>{ESTADO_VENTA_LABEL[e]}</option>)}
    </select>
  )
}

function DetalleVenta({ venta, onClose, onEstado, onNotas }) {
  const toast = useToast()
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => setNotas(venta?.notas || ''), [venta?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!venta) return null
  const telefono = venta.telefono_contacto || venta.clientes?.telefono
  const nombre = venta.clientes?.nombre?.split(' ')[0] || ''
  const wa = whatsappHref(
    telefono,
    `Hola${nombre ? ` ${nombre}` : ''}, te escribimos de Victoria Modas sobre tu pedido ${venta.codigo}.`
  )

  const guardarNotas = async () => {
    setGuardando(true)
    try {
      await updateVentaNotas(venta.id, notas)
      onNotas(venta.id, { notas })
      toast.success('Notas guardadas.')
    } catch (err) {
      toast.error('No se pudieron guardar: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      kicker={`${venta.codigo} · ${origenLabel(venta.origen)}`}
      title={venta.clientes?.nombre || 'Venta sin cliente'}
      footer={
        <div className="flex flex-wrap items-center gap-3">
          <SelectorEstado venta={venta} onChange={onEstado} />
          <button
            type="button"
            onClick={() => imprimirTicket(venta) || toast.error('El navegador bloqueó la ventana. Permite ventanas emergentes para este sitio.')}
            className={btnSecondary}
          >
            <PrinterIcon className="h-4 w-4" />
            Comprobante
          </button>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
              WhatsApp a la clienta
            </a>
          )}
        </div>
      }
    >
      <dl className="mb-6 grid grid-cols-[auto,1fr] gap-x-5 gap-y-2 text-sm">
        <Dato label="Fecha">{fechaHora(venta.created_at)}</Dato>
        {venta.clientes?.documento && <Dato label={venta.clientes.tipo_documento || 'Documento'}>{venta.clientes.documento}</Dato>}
        <Dato label="Teléfono">{telefono}</Dato>
        <Dato label="Correo">{venta.clientes?.email}</Dato>
        <Dato label="Dirección / ciudad">{venta.direccion_envio}</Dato>
        <Dato label="Canal">{venta.canal === 'mayor' ? 'Mayoreo' : 'Por menor'}</Dato>
        {venta.referencia_pago && <Dato label="Cobro Culqi"><span className="font-mono text-xs">{venta.referencia_pago}</span></Dato>}
        {venta.cupones?.codigo && <Dato label="Cupón">{venta.cupones.codigo}</Dato>}
      </dl>

      <p className={labelClass}>Artículos</p>
      <ul className="mb-4 divide-y divide-ink/5 rounded-lg ring-1 ring-ink/10">
        {(venta.venta_items || []).map((it) => {
          const v = it.producto_variantes
          return (
            <li key={it.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-light text-ink">{v?.productos?.nombre || 'Producto eliminado'}</p>
                <p className="text-xs text-ink-muted">
                  {v ? `${v.colores?.nombre} / ${v.tallas?.nombre} · ${v.codigo}` : ''} · {it.cantidad} × {PEN(it.precio_unitario)}
                </p>
              </div>
              <span className="whitespace-nowrap text-ink">{PEN(it.cantidad * it.precio_unitario)}</span>
            </li>
          )
        })}
      </ul>

      <dl className="mb-6 ml-auto grid w-full max-w-xs grid-cols-2 gap-y-1 text-sm">
        <dt className="text-ink-muted">Subtotal</dt>
        <dd className="text-right text-ink">{PEN(venta.subtotal)}</dd>
        {Number(venta.descuento) > 0 && (
          <>
            <dt className="text-ink-muted">Descuento</dt>
            <dd className="text-right text-clay-dark">− {PEN(venta.descuento)}</dd>
          </>
        )}
        <dt className="font-medium text-ink">Total</dt>
        <dd className="text-right font-serif text-lg text-ink">{PEN(venta.total)}</dd>
      </dl>

      <label className={labelClass} htmlFor="notas-venta">Notas internas</label>
      <textarea id="notas-venta" value={notas} onChange={(e) => setNotas(e.target.value)} rows={4} className={`mb-3 ${inputClass}`} />
      <button type="button" onClick={guardarNotas} disabled={guardando || notas === (venta.notas || '')} className={btnSecondary}>
        {guardando ? 'Guardando…' : 'Guardar notas'}
      </button>
    </Drawer>
  )
}
