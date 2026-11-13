import { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { listEquipo, setRolUsuario } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { PageHeader, Chip, TablaVacia, pillInputClass } from '../../components/admin/AdminUI.jsx'
import { fechaCorta } from '../../utils/adminUtils.js'

const ROL_LABEL = { admin: 'Admin', vendedor: 'Vendedora', cliente: 'Clienta' }
const ROL_DESC = {
  admin: 'Todo el panel: productos, precios, stock, cupones, equipo y ajustes.',
  vendedor: 'Inicio, ventas, clientes y reclamaciones. No toca productos, precios, stock ni cupones.',
  cliente: 'Solo la tienda pública y su cuenta.',
}

export default function AdminEquipoPage() {
  useDocumentMeta({ title: 'Equipo | Panel admin' })
  const toast = useToast()
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [soloEquipo, setSoloEquipo] = useState(false)

  const cargar = () => listEquipo().then(setUsuarios).catch((e) => toast.error('No se pudo cargar: ' + e.message))
  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase()
    return (usuarios || []).filter((u) => {
      if (soloEquipo && u.rol === 'cliente') return false
      if (!term) return true
      return [u.email, u.nombre, u.telefono].filter(Boolean).some((s) => s.toLowerCase().includes(term))
    })
  }, [usuarios, busqueda, soloEquipo])

  const cambiarRol = async (u, rol) => {
    if (rol === u.rol) return
    const aviso =
      rol === 'admin'
        ? `¿Dar acceso TOTAL de admin a ${u.email}? Podrá cambiar precios, borrar productos y gestionar el equipo.`
        : `¿Cambiar a ${u.email} de ${ROL_LABEL[u.rol]} a ${ROL_LABEL[rol]}?`
    if (!window.confirm(aviso)) return
    try {
      await setRolUsuario(u.user_id, rol)
      toast.success(`${u.email} ahora es ${ROL_LABEL[rol]}.`)
      cargar()
    } catch (err) {
      toast.error('No se pudo cambiar: ' + err.message)
    }
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title="Equipo" subtitle="Quién puede entrar al panel y con qué permisos." />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {Object.entries(ROL_DESC).map(([rol, desc]) => (
          <div key={rol} className="rounded-xl bg-white p-4 text-sm shadow-soft ring-1 ring-ink/10">
            <p className="mb-1 text-[10px] uppercase tracking-luxe text-clay">{ROL_LABEL[rol]}</p>
            <p className="font-light text-ink-soft">{desc}</p>
          </div>
        ))}
      </div>

      <p className="mb-6 text-sm font-light text-ink-soft">
        Para sumar a alguien al equipo: que primero cree su cuenta en la web (Mi cuenta → Registrarme) y luego cámbiale el rol aquí.
      </p>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por correo, nombre o teléfono..."
            className={`w-full pl-9 ${pillInputClass}`}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={soloEquipo} onChange={(e) => setSoloEquipo(e.target.checked)} />
          Solo equipo (admin y vendedoras)
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-luxe text-ink-muted">
              <th className="px-5 py-4">Usuario</th>
              <th className="px-5 py-4">Teléfono</th>
              <th className="px-5 py-4">Registro</th>
              <th className="px-5 py-4">Último acceso</th>
              <th className="px-5 py-4">Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios === null && <TablaVacia cols={5}>Cargando…</TablaVacia>}
            {usuarios !== null && filtrados.length === 0 && <TablaVacia cols={5}>Sin usuarios que coincidan.</TablaVacia>}
            {filtrados.map((u) => {
              const soyYo = u.user_id === user?.id
              return (
                <tr key={u.user_id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-light text-ink">
                      {u.nombre || 'Sin nombre'}
                      {soyYo && <span className="ml-2 align-middle"><Chip tone="ok">Tú</Chip></span>}
                    </p>
                    <p className="text-xs text-ink-muted">{u.email}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{u.telefono || '—'}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-ink-soft">{fechaCorta(u.created_at)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-ink-soft">{u.ultimo_acceso ? fechaCorta(u.ultimo_acceso) : 'Nunca'}</td>
                  <td className="px-5 py-4">
                    <select
                      value={u.rol}
                      disabled={soyYo}
                      onChange={(e) => cambiarRol(u, e.target.value)}
                      title={soyYo ? 'No puedes cambiar tu propio rol' : ''}
                      className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs uppercase tracking-wide text-ink-soft focus:border-clay focus:outline-none disabled:opacity-60"
                    >
                      {Object.entries(ROL_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
