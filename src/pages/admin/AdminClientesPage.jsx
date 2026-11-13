import { useEffect, useMemo, useState } from 'react'
import { PlusIcon, ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { listClientes, createCliente, updateCliente, listResumenVentasPorCliente, listVentasStaff } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { formatPEN } from '../../utils/price.js'
import IdBadge from '../../components/admin/IdBadge.jsx'
import {
  PageHeader,
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
import { ESTADO_VENTA_LABEL, TIPOS_DOCUMENTO, errorDocumento, fechaCorta, whatsappHref, descargarCSV } from '../../utils/adminUtils.js'

const PEN = (n) => formatPEN(n) || `S/ ${Number(n || 0).toFixed(2)}`
const emptyForm = { nombre: '', tipo_documento: 'DNI', documento: '', telefono: '', email: '', direccion: '' }
const ORDENES = { nombre: 'Nombre (A–Z)', gasto: 'Mayor gasto', reciente: 'Compra más reciente', nuevas: 'Registro más reciente' }

export default function AdminClientesPage() {
  useDocumentMeta({ title: 'Clientes | Panel admin' })
  const toast = useToast()
  const [clientes, setClientes] = useState(null)
  const [resumen, setResumen] = useState({})
  const [search, setSearch] = useState('')
  const [orden, setOrden] = useState('nombre')
  const [soloCompradoras, setSoloCompradoras] = useState(false)
  const [editing, setEditing] = useState(null) // null = cerrado, {} = nuevo, {id,...} = editar
  const [form, setForm] = useState(emptyForm)
  const [guardando, setGuardando] = useState(false)
  const [ficha, setFicha] = useState(null)

  const cargar = () => {
    listClientes().then(setClientes).catch((e) => toast.error(e.message))
    listResumenVentasPorCliente().then(setResumen).catch(() => {})
  }
  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const abrirNuevo = () => {
    setForm(emptyForm)
    setEditing({})
  }

  const abrirEditar = (cliente) => {
    setForm({
      nombre: cliente.nombre,
      tipo_documento: cliente.tipo_documento || 'DNI',
      documento: cliente.documento || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      direccion: cliente.direccion || '',
    })
    setEditing(cliente)
    setFicha(null)
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio.')
      return
    }
    const documento = form.documento.trim().toUpperCase()
    const errDoc = errorDocumento(form.tipo_documento, documento)
    if (errDoc) {
      toast.error(errDoc)
      return
    }
    // El documento es único (índice en la base): no se crea un cliente duplicado.
    const mismoDoc = documento && (clientes || []).find((c) => c.id !== editing?.id && c.documento === documento)
    if (mismoDoc) {
      toast.error(`Ese documento ya está registrado: "${mismoDoc.nombre}" (${mismoDoc.codigo}).`)
      return
    }
    const datos = {
      ...form,
      documento: documento || null,
      tipo_documento: documento ? form.tipo_documento : null,
    }
    const tel = form.telefono.replace(/\D/g, '')
    if (tel) {
      const duplicado = (clientes || []).find((c) => c.id !== editing?.id && (c.telefono || '').replace(/\D/g, '').slice(-9) === tel.slice(-9))
      if (duplicado && !window.confirm(`Ya existe "${duplicado.nombre}" (${duplicado.codigo}) con ese teléfono. ¿Guardar de todas formas?`)) return
    }
    setGuardando(true)
    try {
      if (editing?.id) {
        await updateCliente(editing.id, { ...datos, updated_at: new Date().toISOString() })
        toast.success('Cliente actualizado.')
      } else {
        await createCliente(datos)
        toast.success('Cliente registrado.')
      }
      setEditing(null)
      cargar()
    } catch (err) {
      // 23505 = índice único: otro usuario registró el mismo documento a la vez.
      toast.error(err.code === '23505' ? 'Ese documento ya está registrado en otro cliente.' : 'No se pudo guardar: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase()
    const lista = (clientes || []).filter((c) => {
      if (soloCompradoras && !resumen[c.id]) return false
      if (!term) return true
      return [c.nombre, c.documento, c.telefono, c.email, c.codigo].filter(Boolean).some((s) => s.toLowerCase().includes(term))
    })
    const r = (c) => resumen[c.id] || { compras: 0, total: 0, ultima: null }
    const comparadores = {
      nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
      gasto: (a, b) => r(b).total - r(a).total,
      reciente: (a, b) => String(r(b).ultima || '').localeCompare(String(r(a).ultima || '')),
      nuevas: (a, b) => String(b.created_at).localeCompare(String(a.created_at)),
    }
    return [...lista].sort(comparadores[orden])
  }, [clientes, resumen, search, orden, soloCompradoras])

  const exportar = () => {
    descargarCSV(`clientes-${new Date().toISOString().slice(0, 10)}.csv`, [
      { label: 'Código', value: (c) => c.codigo },
      { label: 'Nombre', value: (c) => c.nombre },
      { label: 'Tipo doc.', value: (c) => c.tipo_documento },
      { label: 'Documento', value: (c) => c.documento },
      { label: 'Teléfono', value: (c) => c.telefono },
      { label: 'Correo', value: (c) => c.email },
      { label: 'Dirección', value: (c) => c.direccion },
      { label: 'Cuenta web', value: (c) => (c.user_id ? 'Sí' : 'No') },
      { label: 'Compras', value: (c) => resumen[c.id]?.compras || 0 },
      { label: 'Total gastado', value: (c) => (resumen[c.id]?.total || 0).toFixed(2) },
      { label: 'Última compra', value: (c) => (resumen[c.id]?.ultima ? new Date(resumen[c.id].ultima).toLocaleDateString('es-PE') : '') },
      { label: 'Registro', value: (c) => new Date(c.created_at).toLocaleDateString('es-PE') },
    ], filtrados)
  }

  return (
    <div className="max-w-6xl">
      <PageHeader title="Clientes" subtitle={clientes ? `${clientes.length} registradas · ${Object.keys(resumen).length} con compras` : ''}>
        <button type="button" onClick={exportar} disabled={!filtrados.length} className={btnSecondary}>
          <ArrowDownTrayIcon className="h-4 w-4" />
          Exportar
        </button>
        <button type="button" onClick={abrirNuevo} className={btnPrimary}>
          <PlusIcon className="h-4 w-4" />
          Nuevo cliente
        </button>
      </PageHeader>

      {editing !== null && (
        <form onSubmit={guardar} className="mb-8 grid grid-cols-1 gap-5 rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10 sm:grid-cols-2">
          <h2 className="col-span-full font-serif text-lg font-light text-ink">
            {editing.id ? `Editar cliente · ${editing.codigo || ''}` : 'Nuevo cliente'}
          </h2>
          <div>
            <label className={labelClass}>Nombre completo *</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className={inputClass} />
          </div>
          <div className="grid grid-cols-[auto,1fr] gap-3">
            <div>
              <label className={labelClass} htmlFor="tipo-doc">Documento</label>
              <select id="tipo-doc" name="tipo_documento" value={form.tipo_documento} onChange={handleChange} className={inputClass}>
                {Object.keys(TIPOS_DOCUMENTO).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="num-doc">Número</label>
              <input
                id="num-doc"
                type="text"
                name="documento"
                value={form.documento}
                onChange={handleChange}
                inputMode={form.tipo_documento === 'CE' ? 'text' : 'numeric'}
                maxLength={form.tipo_documento === 'DNI' ? 8 : 12}
                className={inputClass}
                placeholder={form.tipo_documento === 'RUC' ? '20123456789' : form.tipo_documento === 'DNI' ? '12345678' : ''}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} className={inputClass} placeholder="+51 999 999 999" />
          </div>
          <div>
            <label className={labelClass}>Correo</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Dirección</label>
            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className={inputClass} />
          </div>
          <div className="col-span-full flex gap-3">
            <button type="submit" disabled={guardando} className={btnPrimary}>Guardar</button>
            <button type="button" onClick={() => setEditing(null)} className={btnSecondary}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, DNI/RUC, teléfono, correo o código..."
            className={`w-full pl-9 ${pillInputClass}`}
          />
        </div>
        <select value={orden} onChange={(e) => setOrden(e.target.value)} className={pillInputClass}>
          {Object.entries(ORDENES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={soloCompradoras} onChange={(e) => setSoloCompradoras(e.target.checked)} />
          Solo con compras
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-luxe text-ink-muted">
              <th className="px-5 py-4">Código</th>
              <th className="px-5 py-4">Nombre</th>
              <th className="px-5 py-4">Contacto</th>
              <th className="px-5 py-4">Compras</th>
              <th className="px-5 py-4">Total gastado</th>
              <th className="px-5 py-4">Última compra</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {clientes === null && <TablaVacia cols={7}>Cargando…</TablaVacia>}
            {clientes !== null && filtrados.length === 0 && <TablaVacia cols={7}>Sin clientes que coincidan.</TablaVacia>}
            {filtrados.map((c) => {
              const r = resumen[c.id]
              const wa = whatsappHref(c.telefono)
              return (
                <tr key={c.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-4"><IdBadge value={c.codigo || c.id} /></td>
                  <td className="px-5 py-4 font-light text-ink">
                    {c.nombre}
                    {c.user_id && <span className="ml-2 align-middle"><Chip tone="ok">Cuenta web</Chip></span>}
                    {c.documento && <div className="text-xs text-ink-muted">{c.tipo_documento} {c.documento}</div>}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    <div>{c.telefono || '—'}</div>
                    {c.email && <div className="text-xs text-ink-muted">{c.email}</div>}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{r?.compras || 0}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-serif text-ink">{r ? PEN(r.total) : '—'}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-ink-soft">{r?.ultima ? fechaCorta(r.ultima) : '—'}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="mr-4 text-xs uppercase tracking-wide text-clay hover:text-clay-dark">
                        WhatsApp
                      </a>
                    )}
                    <button type="button" onClick={() => setFicha(c)} className="text-xs uppercase tracking-wide text-clay hover:text-clay-dark">
                      Ver
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <FichaCliente cliente={ficha} resumen={ficha ? resumen[ficha.id] : null} onClose={() => setFicha(null)} onEditar={abrirEditar} />
    </div>
  )
}

function FichaCliente({ cliente, resumen, onClose, onEditar }) {
  const [ventas, setVentas] = useState(null)

  useEffect(() => {
    if (!cliente) return
    setVentas(null)
    listVentasStaff()
      .then((todas) => setVentas(todas.filter((v) => v.cliente_id === cliente.id)))
      .catch(() => setVentas([]))
  }, [cliente])

  if (!cliente) return null
  const wa = whatsappHref(cliente.telefono, `Hola ${cliente.nombre.split(' ')[0]}, te escribimos de Victoria Modas.`)

  return (
    <Drawer
      open
      onClose={onClose}
      kicker={cliente.codigo}
      title={cliente.nombre}
      footer={
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => onEditar(cliente)} className={btnSecondary}>Editar datos</button>
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={btnSecondary}>WhatsApp</a>}
        </div>
      }
    >
      <dl className="mb-6 grid grid-cols-[auto,1fr] gap-x-5 gap-y-2 text-sm">
        <Dato label={cliente.tipo_documento || 'Documento'}>{cliente.documento}</Dato>
        <Dato label="Teléfono">{cliente.telefono}</Dato>
        <Dato label="Correo">{cliente.email}</Dato>
        <Dato label="Dirección">{cliente.direccion}</Dato>
        <Dato label="Cuenta web">{cliente.user_id ? 'Sí (compra con sesión)' : 'No'}</Dato>
        <Dato label="Registro">{fechaCorta(cliente.created_at)}</Dato>
        <Dato label="Compras">{resumen ? `${resumen.compras} · ${PEN(resumen.total)}` : 'Ninguna todavía'}</Dato>
      </dl>

      <p className={labelClass}>Historial de compras</p>
      {ventas === null && <p className="text-sm text-ink-muted">Cargando…</p>}
      {ventas?.length === 0 && <p className="text-sm text-ink-muted">Sin compras registradas.</p>}
      {ventas?.length > 0 && (
        <ul className="divide-y divide-ink/5 rounded-lg ring-1 ring-ink/10">
          {ventas.map((v) => (
            <li key={v.id} className="px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-ink-muted">{v.codigo} · {fechaCorta(v.created_at)}</span>
                <span className="font-serif text-ink">{PEN(v.total)}</span>
              </div>
              <div className="mt-1 flex items-start justify-between gap-3">
                <p className="text-xs text-ink-soft">
                  {(v.venta_items || []).map((it) => `${it.cantidad}× ${it.producto_variantes?.productos?.nombre || 'Producto'}`).join(', ')}
                </p>
                <Chip tone={v.estado === 'cancelado' ? 'alerta' : 'neutral'}>{ESTADO_VENTA_LABEL[v.estado] || v.estado}</Chip>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}
