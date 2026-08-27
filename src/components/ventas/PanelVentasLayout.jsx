import { Link, NavLink, Outlet } from 'react-router-dom'
import { UserGroupIcon, ClipboardDocumentListIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const NAV = [
  { to: '/panel-ventas/ventas', label: 'Ventas', icon: ClipboardDocumentListIcon },
  { to: '/panel-ventas/clientes', label: 'Clientes', icon: UserGroupIcon },
]

// ============================================================
// PanelVentasLayout — envoltorio de /panel-ventas/*: barra lateral + <Outlet/>.
// Separado a propósito de AdminLayout: aquí entra rol admin O vendedor (ver
// RequireRole en main.jsx), y NO da acceso a editar el catálogo — solo
// clientes y ventas.
// ============================================================
export default function PanelVentasLayout() {
  const { profile, signOut } = useAuth()
  const toast = useToast()

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
        <p className="mb-6 text-[10px] uppercase tracking-luxe text-ink-muted">Panel de ventas</p>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
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
          <p className="px-3.5 text-xs font-light text-ink-soft">{profile?.nombre || 'Vendedora'}</p>
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

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-ink/10 bg-white px-5 py-4 lg:hidden">
          <Link to="/" className="font-serif text-lg font-light tracking-wide text-ink">
            Victoria<span className="italic text-clay">Modas</span>
          </Link>
          <div className="flex gap-4 text-xs uppercase tracking-[0.1em] text-ink-soft">
            {NAV.map((item) => (
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
