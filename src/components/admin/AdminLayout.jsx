import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  Squares2X2Icon,
  TagIcon,
  ArrowLeftIcon,
  GiftIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

// Un solo panel para todo (feedback: "el admin debe tener todo"). `roles`
// filtra qué ve cada quien — admin ve todo; vendedor solo ventas/clientes
// (mismo alcance que antes tenía /panel-ventas, ahora fusionado aquí).
const NAV = [
  { to: '/admin/productos', label: 'Productos', icon: Squares2X2Icon, roles: ['admin'] },
  { to: '/admin/stock', label: 'Stock', icon: ArchiveBoxIcon, roles: ['admin'] },
  { to: '/admin/catalogo-base', label: 'Catálogo base', icon: TagIcon, roles: ['admin'] },
  { to: '/admin/cupones', label: 'Cupones', icon: GiftIcon, roles: ['admin'] },
  { to: '/admin/ventas', label: 'Ventas', icon: ClipboardDocumentListIcon, roles: ['admin', 'vendedor'] },
  { to: '/admin/clientes', label: 'Clientes', icon: UserGroupIcon, roles: ['admin', 'vendedor'] },
]

// ============================================================
// AdminLayout — envoltorio de /admin/*: barra lateral + <Outlet/>.
// Protegido por RequireRole (ver src/main.jsx) — este componente asume
// que ya hay un usuario admin O vendedor con sesión; cada ruta hija decide
// si además requiere admin específicamente (ver main.jsx).
// ============================================================
export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const toast = useToast()
  const nav = NAV.filter((item) => item.roles.includes(profile?.rol))

  const handleLogout = async () => {
    await signOut()
    toast.success('Sesión cerrada.')
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink/10 bg-white px-5 py-8 lg:flex">
        <Link to="/" className="mb-10 font-serif text-xl font-light tracking-wide text-ink">
          Victoria<span className="italic text-clay">Modas</span>
        </Link>
        <p className="mb-6 text-[10px] uppercase tracking-luxe text-ink-muted">Panel admin</p>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-light transition-colors ${
                  isActive ? 'bg-cream-dark text-ink' : 'text-ink-soft hover:bg-cream-dark/60 hover:text-ink'
                }`
              }
            >
              <item.icon className="h-5 w-5 text-ink-muted" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-ink/10 pt-5">
          <p className="px-3.5 text-xs font-light text-ink-soft">{profile?.nombre || 'Cuenta del equipo'}</p>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-light text-ink-soft transition-colors hover:bg-cream-dark/60 hover:text-ink"
          >
            <ArrowLeftIcon className="h-5 w-5 text-ink-muted" aria-hidden="true" />
            Volver al sitio
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-light text-ink-soft transition-colors hover:bg-cream-dark/60 hover:text-ink"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Nav móvil simple (arriba), el panel admin es principalmente de escritorio */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-ink/10 bg-white px-5 py-4 lg:hidden">
          <Link to="/" className="font-serif text-lg font-light tracking-wide text-ink">
            Victoria<span className="italic text-clay">Modas</span>
          </Link>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-[0.1em] text-ink-soft">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'text-ink' : '')}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
