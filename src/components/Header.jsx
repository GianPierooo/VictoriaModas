import { Fragment, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Dialog, Transition, Menu } from '@headlessui/react'
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import SearchModal from './SearchModal.jsx'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const location = useLocation()
  const { items, openDrawer } = useCart()
  const { count: favCount } = useWishlist()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Links de navegación principal
  // ABRIGOS: oculto hasta tener stock con fotos (la página sigue activa en
  // /abrigos mostrando "Próximamente"). Para reactivarlo, descomenta la
  // línea de ABRIGOS de abajo Y la de "Abrigos" en `mobileNavigation`.
  const navigation = [
    { name: 'INICIO', href: '/' },
    { name: 'BLUSAS', href: '/blusas' },
    { name: 'PANTALONES', href: '/pantalones' },
    // { name: 'ABRIGOS', href: '/abrigos' }, // ← descomentar para reactivar Abrigos
    { name: 'VESTIDOS', href: '/vestidos' },
  ]

  // Links del menú móvil
  const mobileNavigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Blusas', href: '/blusas' },
    { name: 'Pantalones', href: '/pantalones' },
    // { name: 'Abrigos', href: '/abrigos' }, // ← descomentar para reactivar Abrigos
    { name: 'Vestidos', href: '/vestidos' },
  ]

  const supportLinks = [
    { name: 'Nosotros', href: '/nosotros', icon: UserGroupIcon },
    { name: 'Contacto', href: '/contacto', icon: PhoneIcon },
    { name: 'Preguntas Frecuentes', href: '/preguntas-frecuentes', icon: QuestionMarkCircleIcon },
  ]

  // Detectar scroll: fondo al bajar + ocultar al hacer scroll hacia abajo,
  // mostrar al subir (patrón moderno de e-commerce). rAF para no trabar.
  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false
    const update = () => {
      const y = window.scrollY
      setScrolled(y > 10)
      // Oculta solo más allá del banner+header; siempre visible arriba
      // y al subir. Si el menú móvil está abierto, no ocultar.
      if (!mobileMenuOpen) {
        if (y > lastY && y > 120) setHidden(true)
        else if (y < lastY) setHidden(false)
      }
      lastY = y
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [mobileMenuOpen])

  // Atajo de teclado para búsqueda (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Cerrar menú móvil al navegar
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      {/* Skip to content (accesibilidad) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-ink text-cream px-4 py-2 rounded-md"
      >
        Saltar al contenido principal
      </a>
      
      {/* Header */}
      <header
        className={`fixed top-8 left-0 right-0 z-40 w-full transition-all duration-500 ease-out ${
          scrolled
            ? 'bg-cream/90 backdrop-blur-md shadow-soft'
            : 'bg-transparent'
        } ${hidden ? '-translate-y-[140%]' : 'translate-y-0'}`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link
              to="/"
              className="group flex items-center gap-2.5 font-serif text-2xl font-light tracking-wide text-ink transition-colors duration-300 hover:text-clay"
            >
              <img
                src="/logo/isotipo.png"
                alt=""
                aria-hidden="true"
                className="h-8 lg:h-10 w-auto"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <span>Victoria<span className="italic font-normal text-clay">Modas</span></span>
            </Link>
          </div>

          {/* Botón hamburguesa (mobile) */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2.5 text-ink hover:bg-ink/5 transition-all"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú de navegación"
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navegación desktop */}
          <div className="hidden lg:flex lg:items-center lg:gap-x-8">
            {navigation.map((item) => {
              const active = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`border-b pb-1 text-xs font-medium uppercase tracking-[0.15em] transition-colors duration-300 ${
                    active
                      ? 'border-clay text-ink'
                      : 'border-transparent text-ink-soft hover:border-clay/40 hover:text-clay'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
            
            {/* Dropdown AYUDA (desktop) — panel del sistema, centrado bajo el trigger */}
            <Menu as="div" className="relative flex items-center">
              {({ open }) => (
                <>
                  <Menu.Button
                    className="inline-flex items-center gap-1 border-b border-transparent pb-1 text-xs font-medium uppercase tracking-[0.15em] text-ink-soft transition-colors duration-300 hover:border-clay/40 hover:text-clay"
                  >
                    Ayuda
                    <ChevronDownIcon
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-150"
                    enterFrom="opacity-0 -translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 -translate-y-1"
                  >
                    <Menu.Items className="absolute left-1/2 top-full z-50 mt-3 w-60 -translate-x-1/2 rounded-xl bg-cream p-1.5 shadow-soft ring-1 ring-ink/10 focus:outline-none">
                      <p className="px-3.5 pb-2 pt-2.5 text-[10px] uppercase tracking-luxe text-ink-muted">
                        ¿Necesitas ayuda?
                      </p>
                      <div className="border-t border-ink/5">
                        {supportLinks.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                to={item.href}
                                className={`group flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-light transition-colors ${
                                  active ? 'bg-cream-dark text-ink' : 'text-ink-soft'
                                }`}
                              >
                                <item.icon className={`h-4 w-4 flex-shrink-0 transition-colors ${active ? 'text-clay' : 'text-ink-muted'}`} />
                                {item.name}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </>
              )}
            </Menu>
          </div>

          {/* Iconos de acción (desktop) */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
            {/* Búsqueda */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`p-2 rounded-md transition-all duration-300 ${
                'text-ink-soft hover:text-clay hover:bg-ink/5'
              }`}
              aria-label="Buscar productos (Ctrl+K)"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            
            {/* Favoritos */}
            <Link
              to="/favoritos"
              className="relative p-2 rounded-md text-ink-soft hover:text-clay hover:bg-ink/5 transition-all duration-300"
              aria-label={`Favoritos${favCount > 0 ? ` (${favCount})` : ''}`}
            >
              <HeartIcon className="h-6 w-6" />
              {favCount > 0 && (
                <span key={favCount} className="count-pop absolute -top-1 -right-1 bg-clay-dark text-cream text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-soft">
                  {favCount}
                </span>
              )}
            </Link>

            {/* Carrito — abre el mini-carrito lateral (drawer) */}
            <button
              type="button"
              onClick={openDrawer}
              className="relative rounded-md p-2 text-ink-soft transition-all duration-300 hover:bg-ink/5 hover:text-clay"
              aria-label={`Abrir carrito${cartCount > 0 ? ` (${cartCount} producto${cartCount !== 1 ? 's' : ''})` : ' (vacío)'}`}
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span key={cartCount} className="count-pop absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-clay-dark text-xs font-bold text-cream shadow-soft">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Menú móvil (Headless UI Dialog) */}
      <Transition show={mobileMenuOpen} as={Fragment}>
        <Dialog onClose={setMobileMenuOpen} className="lg:hidden">
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 z-40" />
          </Transition.Child>

          {/* Panel */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-cream px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-ink/10">
              {/* Header del menú */}
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-serif text-xl font-light tracking-wide text-ink">
                  <img
                    src="/logo/isotipo.png"
                    alt=""
                    aria-hidden="true"
                    className="h-8 w-auto"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <span>Victoria<span className="italic font-normal text-clay">Modas</span></span>
                </Link>
                <button
                  type="button"
                  className="rounded-md p-2.5 text-ink hover:bg-ink/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Cerrar menú</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              {/* Navegación móvil */}
              <div className="mt-6 flow-root">
                <div className="space-y-2 py-6">
                  {/* Navegación principal */}
                  <div className="space-y-1">
                    {mobileNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center rounded-lg px-3 py-3 text-sm uppercase tracking-[0.15em] transition-colors ${
                          location.pathname === item.href
                            ? 'text-ink font-medium bg-cream-dark'
                            : 'text-ink-soft font-medium hover:bg-cream-dark hover:text-clay'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {/* Separador */}
                  <div className="border-t border-ink/10 my-4"></div>

                  {/* Ayuda */}
                  <div className="space-y-1">
                    <p className="mb-2 px-3 text-[10px] uppercase tracking-luxe text-ink-muted">
                      Ayuda
                    </p>
                    {supportLinks.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="group flex items-center gap-3 rounded-lg px-3 py-3 text-base font-light text-ink-soft transition-colors hover:bg-cream-dark hover:text-ink"
                        >
                          <Icon className="h-5 w-5 flex-shrink-0 text-ink-muted transition-colors group-hover:text-clay" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>

                  {/* Separador */}
                  <div className="border-t border-ink/10 my-4"></div>

                  {/* Acciones rápidas */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/favoritos"
                      className="relative flex flex-col items-center justify-center gap-2 rounded-lg bg-cream-dark px-4 py-4 text-sm font-medium text-ink transition-colors hover:text-clay"
                    >
                      <HeartIcon className="h-6 w-6" />
                      Favoritos
                      {favCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-clay-dark text-cream text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {favCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/carrito"
                      className="relative flex flex-col items-center justify-center gap-2 rounded-lg bg-ink text-cream px-4 py-4 text-sm font-medium hover:bg-clay transition-colors"
                    >
                      <ShoppingCartIcon className="h-6 w-6" />
                      Carrito
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-clay-dark text-cream text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Footer del menú móvil */}
              <div className="border-t border-ink/10 pt-6 mt-6">
                <p className="text-center font-serif text-sm text-ink-soft">
                  Victoria<span className="italic text-clay">Modas</span> © 2026
                </p>
                <p className="text-center text-xs text-ink-muted mt-1">
                  Moda elegante y minimalista
                </p>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* Modal de búsqueda */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  )
}
