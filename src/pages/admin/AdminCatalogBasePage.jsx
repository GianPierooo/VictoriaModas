import { useEffect, useState } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { listCategorias, listTallas, listColores, createLookup, updateLookup, deleteLookup } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'

const TABS = [
  { key: 'categorias', label: 'Categorías' },
  { key: 'tallas', label: 'Tallas' },
  { key: 'colores', label: 'Colores' },
]

function slugify(s) {
  return s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminCatalogBasePage() {
  useDocumentMeta({ title: 'Catálogo base | Panel admin' })
  const [tab, setTab] = useState('categorias')

  return (
    <div className="max-w-2xl">
      <p className="mb-2 text-[11px] uppercase tracking-luxe text-clay">Panel admin</p>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Catálogo base</h1>

      <div className="mb-8 flex gap-2 rounded-full bg-cream-dark p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${
              tab === t.key ? 'bg-ink text-cream' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'categorias' && <CategoriasPanel />}
      {tab === 'tallas' && <TallasPanel />}
      {tab === 'colores' && <ColoresPanel />}
    </div>
  )
}

function CategoriasPanel() {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [nombre, setNombre] = useState('')

  const cargar = () => listCategorias().then(setItems).catch((e) => toast.error(e.message))
  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const agregar = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    try {
      await createLookup('categorias', { nombre: nombre.trim(), slug: slugify(nombre), orden: (items?.length || 0) + 1 })
      setNombre('')
      cargar()
    } catch (err) {
      toast.error('No se pudo crear: ' + err.message)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría? Los productos que la usan quedarán sin categoría.')) return
    try {
      await deleteLookup('categorias', id)
      cargar()
    } catch (err) {
      toast.error('No se pudo eliminar: ' + err.message)
    }
  }

  const toggleActivo = async (item) => {
    await updateLookup('categorias', item.id, { activo: !item.activo })
    cargar()
  }

  return (
    <LookupList
      items={items}
      renderExtra={(item) => (
        <button
          type="button"
          onClick={() => toggleActivo(item)}
          className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${item.activo ? 'bg-clay/10 text-clay' : 'bg-ink/5 text-ink-muted'}`}
        >
          {item.activo ? 'Activa' : 'Inactiva'}
        </button>
      )}
      onDelete={eliminar}
    >
      <form onSubmit={agregar} className="mb-6 flex gap-3">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la categoría" className="flex-1 rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm focus:border-clay focus:outline-none" />
        <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-xs uppercase tracking-[0.1em] text-cream hover:bg-clay">
          <PlusIcon className="h-4 w-4" /> Agregar
        </button>
      </form>
    </LookupList>
  )
}

function TallasPanel() {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [nombre, setNombre] = useState('')

  const cargar = () => listTallas().then(setItems).catch((e) => toast.error(e.message))
  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const agregar = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    try {
      await createLookup('tallas', { nombre: nombre.trim().toUpperCase(), orden: (items?.length || 0) + 1 })
      setNombre('')
      cargar()
    } catch (err) {
      toast.error('No se pudo crear (¿ya existe esa talla?): ' + err.message)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta talla? Las variantes que la usan se rompen.')) return
    try {
      await deleteLookup('tallas', id)
      cargar()
    } catch (err) {
      toast.error('No se pudo eliminar: ' + err.message)
    }
  }

  return (
    <LookupList items={items} onDelete={eliminar}>
      <form onSubmit={agregar} className="mb-6 flex gap-3">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. XL" className="flex-1 rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm focus:border-clay focus:outline-none" />
        <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-xs uppercase tracking-[0.1em] text-cream hover:bg-clay">
          <PlusIcon className="h-4 w-4" /> Agregar
        </button>
      </form>
    </LookupList>
  )
}

function ColoresPanel() {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [nombre, setNombre] = useState('')
  const [hex, setHex] = useState('#9C5F4E')

  const cargar = () => listColores().then(setItems).catch((e) => toast.error(e.message))
  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const agregar = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    try {
      await createLookup('colores', { nombre: nombre.trim(), hex, orden: (items?.length || 0) + 1 })
      setNombre('')
      cargar()
    } catch (err) {
      toast.error('No se pudo crear (¿ya existe ese color?): ' + err.message)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este color? Las variantes/fotos que lo usan se rompen.')) return
    try {
      await deleteLookup('colores', id)
      cargar()
    } catch (err) {
      toast.error('No se pudo eliminar: ' + err.message)
    }
  }

  return (
    <LookupList
      items={items}
      renderExtra={(item) => <span className="h-4 w-4 rounded-full ring-1 ring-ink/10" style={{ backgroundColor: item.hex || '#CCCCCC' }} />}
      onDelete={eliminar}
    >
      <form onSubmit={agregar} className="mb-6 flex items-center gap-3">
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-10 w-12 rounded-md border border-ink/15" />
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del color" className="flex-1 rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm focus:border-clay focus:outline-none" />
        <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-xs uppercase tracking-[0.1em] text-cream hover:bg-clay">
          <PlusIcon className="h-4 w-4" /> Agregar
        </button>
      </form>
    </LookupList>
  )
}

function LookupList({ items, children, renderExtra, onDelete }) {
  return (
    <div>
      {children}
      <div className="divide-y divide-ink/5 rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
        {items === null && <p className="px-5 py-4 text-sm text-ink-muted">Cargando…</p>}
        {items !== null && items.length === 0 && <p className="px-5 py-4 text-sm text-ink-muted">Nada todavía.</p>}
        {(items || []).map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <span className="flex items-center gap-3 text-sm font-light text-ink">
              {item.nombre}
              {renderExtra && renderExtra(item)}
            </span>
            <button type="button" onClick={() => onDelete(item.id)} aria-label={`Eliminar ${item.nombre}`} className="text-ink-muted hover:text-red-500">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
