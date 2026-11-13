import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getResumenPanel, listMovimientosRecientes } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { formatPEN } from '../../utils/price.js'
import { PLAZO_RESPUESTA_DIAS_HABILES } from '../../config/legal.js'
import { PageHeader, StatCard, Chip } from '../../components/admin/AdminUI.jsx'
import {
  ESTADO_VENTA_LABEL,
  origenLabel,
  fechaCorta,
  fechaHora,
  diasHabilesTranscurridos,
  motivoStockLabel,
} from '../../utils/adminUtils.js'

const PEN = (n) => formatPEN(n) || `S/ ${Number(n || 0).toFixed(2)}`

function inicioDeDia(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export default function AdminInicioPage() {
  useDocumentMeta({ title: 'Inicio | Panel admin' })
  const toast = useToast()
  const { profile } = useAuth()
  const esAdmin = profile?.rol === 'admin'
  const [data, setData] = useState(null)
  const [movimientos, setMovimientos] = useState([])

  useEffect(() => {
    getResumenPanel().then(setData).catch((e) => toast.error('No se pudo cargar el resumen: ' + e.message))
    if (esAdmin) listMovimientosRecientes(8).then(setMovimientos).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const m = useMemo(() => {
    if (!data) return null
    const validas = data.ventas.filter((v) => v.estado !== 'cancelado')
    const hoy = inicioDeDia()
    const mes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
    const suma = (arr) => arr.reduce((s, v) => s + (Number(v.total) || 0), 0)
    const deHoy = validas.filter((v) => new Date(v.created_at) >= hoy)
    const delMes = validas.filter((v) => new Date(v.created_at) >= mes)
    const delMesAnterior = validas.filter((v) => {
      const f = new Date(v.created_at)
      return f >= mesAnterior && f < mes
    })

    // Últimos 14 días para el gráfico de barras.
    const dias = []
    for (let i = 13; i >= 0; i--) {
      const d = inicioDeDia()
      d.setDate(d.getDate() - i)
      const sig = new Date(d)
      sig.setDate(sig.getDate() + 1)
      const ventasDia = validas.filter((v) => {
        const f = new Date(v.created_at)
        return f >= d && f < sig
      })
      dias.push({ fecha: d, total: suma(ventasDia), n: ventasDia.length })
    }

    // Productos más vendidos del mes (por unidades).
    const porProducto = {}
    for (const v of delMes) {
      for (const it of v.venta_items || []) {
        const p = it.producto_variantes?.productos
        if (!p) continue
        const r = (porProducto[p.id] ||= { nombre: p.nombre, unidades: 0, monto: 0 })
        r.unidades += it.cantidad
        r.monto += it.cantidad * Number(it.precio_unitario || 0)
      }
    }
    const top = Object.values(porProducto).sort((a, b) => b.unidades - a.unidades).slice(0, 5)

    return {
      hoyTotal: suma(deHoy),
      hoyN: deHoy.length,
      mesTotal: suma(delMes),
      mesN: delMes.length,
      mesAnteriorTotal: suma(delMesAnterior),
      ticket: delMes.length ? suma(delMes) / delMes.length : 0,
      porAtender: data.ventas.filter((v) => ['pendiente', 'confirmado', 'en_preparacion'].includes(v.estado)),
      dias,
      top,
      maxDia: Math.max(1, ...dias.map((d) => d.total)),
    }
  }, [data])

  if (!data || !m) return <p className="text-ink-muted">Cargando…</p>

  const variacion = m.mesAnteriorTotal > 0 ? ((m.mesTotal - m.mesAnteriorTotal) / m.mesAnteriorTotal) * 100 : null
  const reclamosConDias = data.reclamosPendientes
    .map((r) => ({ ...r, dias: diasHabilesTranscurridos(r.created_at) }))
    .sort((a, b) => b.dias - a.dias)

  return (
    <div className="max-w-6xl">
      <PageHeader title={`Hola${profile?.nombre ? `, ${profile.nombre.split(' ')[0]}` : ''}`} subtitle="Así va el negocio hoy." />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ventas de hoy" value={PEN(m.hoyTotal)} hint={`${m.hoyN} venta${m.hoyN === 1 ? '' : 's'}`} />
        <StatCard
          label="Ventas del mes"
          value={PEN(m.mesTotal)}
          hint={variacion == null ? `${m.mesN} ventas` : `${m.mesN} ventas · ${variacion >= 0 ? '+' : ''}${variacion.toFixed(0)}% vs. mes anterior`}
        />
        <StatCard label="Ticket promedio (mes)" value={PEN(m.ticket)} />
        <StatCard label="Clientes registradas" value={data.totalClientes} />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <AlertaCard
          to="/admin/ventas"
          titulo="Pedidos por atender"
          n={m.porAtender.length}
          vacio="No hay pedidos pendientes ni por enviar."
          texto={`${m.porAtender.length} pedido${m.porAtender.length === 1 ? '' : 's'} pendiente${m.porAtender.length === 1 ? '' : 's'} o confirmado${m.porAtender.length === 1 ? '' : 's'} sin enviar.`}
        />
        {esAdmin && (
          <AlertaCard
            to="/admin/stock"
            titulo="Stock bajo (≤3)"
            n={data.stockBajo.length}
            vacio="Todo el catálogo activo tiene más de 3 unidades."
            texto={`${data.stockBajo.length} variante${data.stockBajo.length === 1 ? '' : 's'} activa${data.stockBajo.length === 1 ? '' : 's'} por reponer.`}
          />
        )}
        <AlertaCard
          to="/admin/reclamaciones"
          titulo="Reclamos pendientes"
          n={reclamosConDias.length}
          alerta={reclamosConDias.some((r) => r.dias > PLAZO_RESPUESTA_DIAS_HABILES - 3)}
          vacio="No hay reclamos por responder."
          texto={
            reclamosConDias[0]
              ? `El más antiguo lleva ${reclamosConDias[0].dias} de ${PLAZO_RESPUESTA_DIAS_HABILES} días hábiles.`
              : ''
          }
        />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10 lg:col-span-2">
          <h2 className="mb-5 text-[10px] uppercase tracking-luxe text-ink-muted">Ventas · últimos 14 días</h2>
          <div className="flex h-40 items-end gap-1.5">
            {m.dias.map((d) => (
              <div key={d.fecha.toISOString()} className="group relative flex h-full flex-1 flex-col justify-end">
                <div
                  className="w-full rounded-t bg-clay/70 transition-colors group-hover:bg-clay"
                  style={{ height: `${Math.max(d.total > 0 ? 4 : 1, (d.total / m.maxDia) * 100)}%` }}
                  title={`${fechaCorta(d.fecha)}: ${PEN(d.total)} (${d.n})`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-ink-muted">
            <span>{fechaCorta(m.dias[0].fecha)}</span>
            <span>Hoy</span>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10">
          <h2 className="mb-4 text-[10px] uppercase tracking-luxe text-ink-muted">Más vendidos del mes</h2>
          {m.top.length === 0 ? (
            <p className="text-sm font-light text-ink-muted">Todavía no hay ventas este mes.</p>
          ) : (
            <ol className="space-y-3">
              {m.top.map((p, i) => (
                <li key={p.nombre} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-light text-ink">
                    <span className="mr-2 text-ink-muted">{i + 1}.</span>
                    {p.nombre}
                  </span>
                  <span className="whitespace-nowrap text-ink-soft">{p.unidades} u.</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[10px] uppercase tracking-luxe text-ink-muted">Últimas ventas</h2>
            <Link to="/admin/ventas" className="text-xs uppercase tracking-wide text-clay hover:text-clay-dark">Ver todas</Link>
          </div>
          {data.ventas.length === 0 ? (
            <p className="text-sm font-light text-ink-muted">Sin ventas todavía.</p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {data.ventas.slice(0, 6).map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-light text-ink">{v.clientes?.nombre || 'Sin cliente'}</p>
                    <p className="text-xs text-ink-muted">
                      {v.codigo} · {fechaHora(v.created_at)} · {origenLabel(v.origen)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-ink">{PEN(v.total)}</p>
                    <Chip tone={v.estado === 'cancelado' ? 'alerta' : 'neutral'}>{ESTADO_VENTA_LABEL[v.estado] || v.estado}</Chip>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {esAdmin && (
          <section className="rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[10px] uppercase tracking-luxe text-ink-muted">Últimos movimientos de stock</h2>
              <Link to="/admin/stock" className="text-xs uppercase tracking-wide text-clay hover:text-clay-dark">Ir a stock</Link>
            </div>
            {movimientos.length === 0 ? (
              <p className="text-sm font-light text-ink-muted">Sin movimientos registrados todavía.</p>
            ) : (
              <ul className="divide-y divide-ink/5">
                {movimientos.map((mv) => {
                  const v = mv.producto_variantes
                  return (
                    <li key={mv.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-light text-ink">
                          {v?.productos?.nombre || 'Variante'} <span className="text-ink-muted">({v?.colores?.nombre}/{v?.tallas?.nombre})</span>
                        </p>
                        <p className="text-xs text-ink-muted">
                          {motivoStockLabel(mv.motivo)} · {fechaHora(mv.created_at)}
                        </p>
                      </div>
                      <span className={`whitespace-nowrap font-medium ${mv.delta < 0 ? 'text-clay-dark' : 'text-ink'}`}>
                        {mv.delta > 0 ? '+' : ''}
                        {mv.delta}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function AlertaCard({ to, titulo, n, texto, vacio, alerta }) {
  const activo = n > 0
  return (
    <Link
      to={to}
      className={`block rounded-xl p-5 ring-1 transition-colors ${
        activo
          ? alerta
            ? 'bg-red-50 ring-red-200 hover:ring-red-300'
            : 'bg-white shadow-soft ring-ink/10 hover:ring-clay/40'
          : 'bg-white shadow-soft ring-ink/10 hover:ring-clay/40'
      }`}
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-luxe text-ink-muted">{titulo}</p>
        <p className={`font-serif text-2xl font-light ${activo ? (alerta ? 'text-red-700' : 'text-clay-dark') : 'text-ink'}`}>{n}</p>
      </div>
      <p className="mt-2 text-sm font-light text-ink-soft">{activo ? texto : vacio}</p>
    </Link>
  )
}
