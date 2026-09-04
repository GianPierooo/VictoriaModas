import { useEffect, useState } from 'react'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { listCupones, createCupon, updateCupon, deleteCupon } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { formatPEN } from '../../utils/price.js'

const TIPOS = [
  { value: 'porcentaje', label: '% de descuento' },
  { value: 'monto_fijo', label: 'Monto fijo (S/)' },
  { value: 'envio_gratis', label: 'Envío gratis' },
]

const VACIO = {
  id: null,
  codigo: '',
  descripcion: '',
  tipo: 'porcentaje',
  valor: '',
  monto_minimo: '',
  usos_maximos: '',
  canal: '',
  fecha_fin: '',
  activo: true,
}

export default function AdminCuponesPage() {
  useDocumentMeta({ title: 'Cupones | Panel admin' })
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [saving, setSaving] = useState(false)

  const cargar = () => listCupones().then(setItems).catch((e) => toast.error(e.message))
  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const editar = (cupon) => {
    setForm({
      id: cupon.id,
      codigo: cupon.codigo,
      descripcion: cupon.descripcion || '',
      tipo: cupon.tipo,
      valor: cupon.valor ?? '',
      monto_minimo: cupon.monto_minimo ?? '',
      usos_maximos: cupon.usos_maximos ?? '',
      canal: cupon.canal || '',
      fecha_fin: cupon.fecha_fin ? cupon.fecha_fin.slice(0, 10) : '',
      activo: cupon.activo,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelar = () => setForm(VACIO)

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.codigo.trim()) {
      toast.error('El código es obligatorio.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        codigo: form.codigo,
        descripcion: form.descripcion.trim() || null,
        tipo: form.tipo,
        valor: form.tipo === 'envio_gratis' ? 0 : Number(form.valor) || 0,
        monto_minimo: Number(form.monto_minimo) || 0,
        usos_maximos: form.usos_maximos === '' ? null : Number(form.usos_maximos),
        canal: form.canal.trim() || null,
        fecha_fin: form.fecha_fin ? new Date(form.fecha_fin).toISOString() : null,
        activo: form.activo,
      }
      if (form.id) {
        await updateCupon(form.id, payload)
        toast.success('Cupón actualizado.')
      } else {
        await createCupon(payload)
        toast.success('Cupón creado.')
      }
      cancelar()
      cargar()
    } catch (err) {
      toast.error('No se pudo guardar (¿código repetido?): ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async (cupon) => {
    if (!window.confirm(`¿Eliminar el cupón ${cupon.codigo}?`)) return
    try {
      await deleteCupon(cupon.id)
      cargar()
    } catch (err) {
      toast.error('No se pudo eliminar: ' + err.message)
    }
  }

  const toggleActivo = async (cupon) => {
    await updateCupon(cupon.id, { activo: !cupon.activo })
    cargar()
  }

  const inputClass = 'w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm focus:border-clay focus:outline-none'
  const labelClass = 'mb-1.5 block text-[10px] uppercase tracking-luxe text-ink-muted'

  return (
    <div className="max-w-3xl">
      <p className="mb-2 text-[11px] uppercase tracking-luxe text-clay">Panel admin</p>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Cupones</h1>

      {/* Formulario crear/editar */}
      <form onSubmit={guardar} className="mb-10 rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10">
        <p className="mb-5 text-sm font-light text-ink-soft">
          {form.id ? `Editando ${form.codigo}` : 'Nuevo cupón'}
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Código *</label>
            <input
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              placeholder="BIENVENIDA10"
              className={`${inputClass} uppercase`}
            />
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))} className={inputClass}>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {form.tipo !== 'envio_gratis' && (
            <div>
              <label className={labelClass}>
                Valor {form.tipo === 'porcentaje' ? '(%)' : '(S/)'}
              </label>
              <input
                type="number"
                min="0"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                className={inputClass}
              />
            </div>
          )}
          <div>
            <label className={labelClass}>Compra mínima (S/)</label>
            <input
              type="number"
              min="0"
              value={form.monto_minimo}
              onChange={(e) => setForm((f) => ({ ...f, monto_minimo: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Usos máximos (vacío = ilimitado)</label>
            <input
              type="number"
              min="0"
              value={form.usos_maximos}
              onChange={(e) => setForm((f) => ({ ...f, usos_maximos: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Vence (opcional)</label>
            <input
              type="date"
              value={form.fecha_fin}
              onChange={(e) => setForm((f) => ({ ...f, fecha_fin: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Canal (opcional, ej. IG, TIKTOK)</label>
            <input
              value={form.canal}
              onChange={(e) => setForm((f) => ({ ...f, canal: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Descripción (opcional, uso interno)</label>
            <input
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="10% en tu primera compra"
              className={inputClass}
            />
          </div>
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
          />
          Activo
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-6 py-2.5 text-xs uppercase tracking-[0.1em] text-cream transition-colors hover:bg-clay disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            {form.id ? 'Guardar cambios' : 'Crear cupón'}
          </button>
          {form.id && (
            <button type="button" onClick={cancelar} className="text-xs uppercase tracking-[0.1em] text-ink-muted hover:text-ink">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      <div className="divide-y divide-ink/5 rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
        {items === null && <p className="px-5 py-4 text-sm text-ink-muted">Cargando…</p>}
        {items !== null && items.length === 0 && <p className="px-5 py-4 text-sm text-ink-muted">Todavía no hay cupones.</p>}
        {(items || []).map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-light text-ink">{c.codigo}</span>
                <button
                  type="button"
                  onClick={() => toggleActivo(c)}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide ${c.activo ? 'bg-clay/10 text-clay' : 'bg-ink/5 text-ink-muted'}`}
                >
                  {c.activo ? 'Activo' : 'Inactivo'}
                </button>
              </div>
              <p className="mt-0.5 text-xs text-ink-muted">
                {c.tipo === 'porcentaje' && `${c.valor}% de descuento`}
                {c.tipo === 'monto_fijo' && `${formatPEN(c.valor)} de descuento`}
                {c.tipo === 'envio_gratis' && 'Envío gratis'}
                {c.monto_minimo > 0 && ` · mín. ${formatPEN(c.monto_minimo)}`}
                {c.usos_maximos != null && ` · ${c.usos_actuales}/${c.usos_maximos} usos`}
                {c.fecha_fin && ` · vence ${new Date(c.fecha_fin).toLocaleDateString('es-PE')}`}
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-1">
              <button type="button" onClick={() => editar(c)} aria-label={`Editar ${c.codigo}`} className="rounded-md p-1.5 text-ink-muted hover:text-ink">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => eliminar(c)} aria-label={`Eliminar ${c.codigo}`} className="rounded-md p-1.5 text-ink-muted hover:text-red-500">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
