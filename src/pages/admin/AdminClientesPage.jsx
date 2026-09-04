import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { listClientes, createCliente, updateCliente } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'

const labelClass = 'mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted'
const inputClass = 'w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-clay focus:outline-none'

const emptyForm = { nombre: '', telefono: '', email: '', direccion: '' }

export default function AdminClientesPage() {
  useDocumentMeta({ title: 'Clientes | Panel admin' })
  const toast = useToast()
  const [clientes, setClientes] = useState(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // null = cerrado, {} = nuevo, {id,...} = editar
  const [form, setForm] = useState(emptyForm)
  const [guardando, setGuardando] = useState(false)

  const cargar = () => listClientes().then(setClientes).catch((e) => toast.error(e.message))
  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const abrirNuevo = () => {
    setForm(emptyForm)
    setEditing({})
  }

  const abrirEditar = (cliente) => {
    setForm({ nombre: cliente.nombre, telefono: cliente.telefono || '', email: cliente.email || '', direccion: cliente.direccion || '' })
    setEditing(cliente)
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio.')
      return
    }
    setGuardando(true)
    try {
      if (editing?.id) {
        await updateCliente(editing.id, form)
        toast.success('Cliente actualizado.')
      } else {
        await createCliente(form)
        toast.success('Cliente registrado.')
      }
      setEditing(null)
      cargar()
    } catch (err) {
      toast.error('No se pudo guardar: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const filtrados = (clientes || []).filter((c) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return c.nombre.toLowerCase().includes(term) || (c.telefono || '').includes(term)
  })

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-luxe text-clay">Panel admin</p>
          <h1 className="font-serif text-3xl font-light text-ink">Clientes</h1>
        </div>
        <button
          type="button"
          onClick={abrirNuevo}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-clay"
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo cliente
        </button>
      </div>

      {editing !== null && (
        <form onSubmit={guardar} className="mb-8 grid grid-cols-1 gap-5 rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10 sm:grid-cols-2">
          <h2 className="col-span-full font-serif text-lg font-light text-ink">{editing.id ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <div>
            <label className={labelClass}>Nombre completo *</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className={inputClass} />
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
            <button type="submit" disabled={guardando} className="rounded-full bg-ink px-7 py-2.5 text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-clay disabled:opacity-60">
              Guardar
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-ink/20 px-7 py-2.5 text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-ink">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre o teléfono..."
        className="mb-6 w-full max-w-sm rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-clay focus:outline-none"
      />

      <div className="overflow-x-auto rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-luxe text-ink-muted">
              <th className="px-5 py-4">Nombre</th>
              <th className="px-5 py-4">Teléfono</th>
              <th className="px-5 py-4">Correo</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {clientes === null && <tr><td colSpan={4} className="px-5 py-8 text-center text-ink-muted">Cargando…</td></tr>}
            {clientes !== null && filtrados.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-ink-muted">Sin clientes todavía.</td></tr>}
            {filtrados.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-4 font-light text-ink">{c.nombre}</td>
                <td className="px-5 py-4 text-ink-soft">{c.telefono || '—'}</td>
                <td className="px-5 py-4 text-ink-soft">{c.email || '—'}</td>
                <td className="px-5 py-4 text-right">
                  <button type="button" onClick={() => abrirEditar(c)} className="text-xs uppercase tracking-wide text-clay hover:text-clay-dark">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
