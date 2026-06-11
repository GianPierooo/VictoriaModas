import { Fragment, useState } from 'react'
import { Dialog, Popover, Transition } from '@headlessui/react'
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import AnnouncementBanner from './AnnouncementBanner.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ProductCard from './ProductCard.jsx'
import { COLOR_HEX } from '../utils/colorMap.js'

// "VESTIDOS ELEGANTES" → "Vestidos elegantes"
function toSentenceCase(text) {
  const lower = text.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

// Dropdown minimal para la barra de filtros (desktop)
function FilterDropdown({ label, activeCount, children }) {
  return (
    <Popover className="relative">
      <Popover.Button
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors duration-300 focus:outline-none ${
          activeCount > 0
            ? 'border-clay text-clay'
            : 'border-ink/20 text-ink-soft hover:border-ink hover:text-ink'
        }`}
      >
        {label}
        {activeCount > 0 && <span>· {activeCount}</span>}
        <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute left-0 z-30 mt-2 w-60 rounded-lg bg-cream p-4 shadow-soft ring-1 ring-ink/10">
          {children}
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}

// ============= COMPONENTE PRINCIPAL =============
export default function ProductsPage({ products = [], title = "Productos", filters = {} }) {
  const [sortBy, setSortBy] = useState('popularidad')
  const [selectedFabrics, setSelectedFabrics] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [showOnlySale, setShowOnlySale] = useState(false)
  const [showOnlyNew, setShowOnlyNew] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const allProducts = products

  // Opciones disponibles: usa las de la prop o derívalas de los productos
  const availableSizes = filters.availableSizes || (() => {
    const counts = {}
    allProducts.forEach(p => p.sizes?.forEach(s => { counts[s] = (counts[s] || 0) + 1 }))
    return Object.keys(counts).map(label => ({ label, count: counts[label] }))
  })()

  const availableFabrics = (filters.availableFabrics?.length
    ? filters.availableFabrics
    : (() => {
        const counts = {}
        allProducts.forEach(p => { if (p.fabric) counts[p.fabric] = (counts[p.fabric] || 0) + 1 })
        return Object.keys(counts).map(label => ({ label, count: counts[label] }))
      })()
  )

  const availableColors = filters.availableColors || (() => {
    const counts = {}
    allProducts.forEach(p => p.colors?.forEach(c => { counts[c] = (counts[c] || 0) + 1 }))
    return Object.keys(counts).map(label => ({
      label,
      count: counts[label],
      hex: COLOR_HEX[label] || '#CCCCCC'
    }))
  })()

  // Aplicar filtros (la tela compara contra product.fabric)
  const filteredProducts = allProducts.filter(product => {
    if (selectedSizes.length > 0 && !selectedSizes.some(size => product.sizes?.includes(size))) return false
    if (selectedColors.length > 0 && !selectedColors.some(color => product.colors?.includes(color))) return false
    if (selectedFabrics.length > 0 && !selectedFabrics.includes(product.fabric)) return false
    if (showOnlySale && !product.badge?.includes('%')) return false
    if (showOnlyNew && product.badge !== 'Nuevo') return false
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'nuevos': return (b.badge === 'Nuevo' ? 1 : 0) - (a.badge === 'Nuevo' ? 1 : 0)
      default: return 0
    }
  })

  // Handlers
  const toggleSize = (size) => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  const toggleColor = (color) => setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])
  const toggleFabric = (fabric) => setSelectedFabrics(prev => prev.includes(fabric) ? prev.filter(f => f !== fabric) : [...prev, fabric])

  const clearAllFilters = () => {
    setSelectedFabrics([])
    setSelectedSizes([])
    setSelectedColors([])
    setShowOnlySale(false)
    setShowOnlyNew(false)
  }

  const activeFiltersCount = [selectedFabrics.length, selectedSizes.length, selectedColors.length, showOnlySale, showOnlyNew].filter(Boolean).length

  // Bloques de opciones reutilizados en barra desktop y panel móvil
  const sizeOptions = (large) => (
    <div className="flex flex-wrap gap-2">
      {availableSizes.map(size => (
        <button
          key={size.label}
          type="button"
          onClick={() => toggleSize(size.label)}
          className={`${large ? 'h-11 min-w-[44px] px-4' : 'h-9 min-w-[36px] px-3'} rounded-full border text-xs uppercase tracking-[0.1em] transition-colors duration-300 ${
            selectedSizes.includes(size.label)
              ? 'border-ink bg-ink text-cream'
              : 'border-ink/20 text-ink-soft hover:border-ink'
          }`}
        >
          {size.label}
        </button>
      ))}
    </div>
  )

  const colorOptions = (large) => (
    <div className="flex flex-wrap gap-1">
      {availableColors.map(color => (
        <button
          key={color.label}
          type="button"
          onClick={() => toggleColor(color.label)}
          className={`flex items-center justify-center rounded-full ${large ? 'h-11 w-11' : 'h-10 w-10'}`}
          title={color.label}
          aria-label={`Color ${color.label}`}
          aria-pressed={selectedColors.includes(color.label)}
        >
          <span
            className={`block h-5 w-5 rounded-full border border-ink/15 transition-all duration-300 ${
              selectedColors.includes(color.label)
                ? 'ring-1 ring-clay ring-offset-2 ring-offset-cream scale-110'
                : ''
            }`}
            style={{ backgroundColor: color.hex }}
          />
        </button>
      ))}
    </div>
  )

  const fabricOptions = (large) => (
    <div className="flex flex-wrap gap-2">
      {availableFabrics.map(fabric => (
        <button
          key={fabric.label}
          type="button"
          onClick={() => toggleFabric(fabric.label)}
          className={`${large ? 'h-11 px-5' : 'h-9 px-4'} rounded-full border text-xs tracking-[0.05em] transition-colors duration-300 ${
            selectedFabrics.includes(fabric.label)
              ? 'border-ink bg-ink text-cream'
              : 'border-ink/20 text-ink-soft hover:border-ink'
          }`}
        >
          {fabric.label}
        </button>
      ))}
    </div>
  )

  const specialToggle = (label, active, onToggle, large) => (
    <button
      type="button"
      onClick={onToggle}
      className={`${large ? 'h-11 px-5' : 'h-9 px-4'} rounded-full border text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${
        active ? 'border-ink bg-ink text-cream' : 'border-ink/20 text-ink-soft hover:border-ink hover:text-ink'
      }`}
    >
      {label}
    </button>
  )

  const sortSelect = (extraClasses = '') => (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className={`rounded-full border border-ink/20 bg-transparent px-4 py-2 text-xs uppercase tracking-[0.1em] text-ink-soft focus:border-ink focus:outline-none ${extraClasses}`}
      aria-label="Ordenar por"
    >
      <option value="popularidad">Popularidad</option>
      <option value="nuevos">Más nuevos</option>
    </select>
  )

  return (
    <>
      <AnnouncementBanner />
      <Header />

      <main className="min-h-screen bg-white pt-28">
        {/* Cabecera de categoría */}
        <section className="bg-cream py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
            <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">
              Colección
            </p>
            <h1 className="mb-3 font-serif text-4xl font-light text-ink md:text-5xl">
              {toSentenceCase(title)}
            </h1>
            <p className="text-sm font-light text-ink-muted">
              {sortedProducts.length} pieza{sortedProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </section>

        {/* Barra de filtros */}
        <div className="border-b border-ink/10 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
            {/* Desktop */}
            <div className="hidden items-center gap-3 md:flex">
              {availableSizes.length > 0 && (
                <FilterDropdown label="Talla" activeCount={selectedSizes.length}>
                  {sizeOptions(false)}
                </FilterDropdown>
              )}
              {availableColors.length > 0 && (
                <FilterDropdown label="Color" activeCount={selectedColors.length}>
                  {colorOptions(false)}
                </FilterDropdown>
              )}
              {availableFabrics.length > 0 && (
                <FilterDropdown label="Tela" activeCount={selectedFabrics.length}>
                  {fabricOptions(false)}
                </FilterDropdown>
              )}

              {specialToggle('Nuevo', showOnlyNew, () => setShowOnlyNew(v => !v), false)}
              {specialToggle('Oferta', showOnlySale, () => setShowOnlySale(v => !v), false)}

              <div className="ml-auto flex items-center gap-3">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] text-ink-muted transition-colors hover:text-clay"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                    Limpiar
                  </button>
                )}
                {sortSelect()}
              </div>
            </div>

            {/* Móvil */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-ink/20 text-xs uppercase tracking-[0.15em] text-ink transition-colors"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                Filtrar
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[10px] text-cream">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              {sortSelect('h-11 flex-1')}
            </div>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8">
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            /* Estado vacío */
            <div className="py-24 text-center">
              <h2 className="mb-3 font-serif text-2xl font-light text-ink md:text-3xl">
                No encontramos piezas con esos filtros
              </h2>
              <p className="mb-8 font-light text-ink-soft">
                Prueba con otra combinación o revisa toda la colección.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-all duration-500 hover:bg-clay"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Panel de filtros móvil (bottom sheet) */}
      <Transition show={mobileFiltersOpen} as={Fragment}>
        <Dialog onClose={setMobileFiltersOpen} className="md:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 z-40 bg-ink/30" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-300 transform"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transition ease-in duration-300 transform"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-cream px-6 pb-8 pt-5">
              {/* Asa + cerrar */}
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink/15" />
              <div className="mb-6 flex items-center justify-between">
                <Dialog.Title className="font-serif text-xl font-light text-ink">
                  Filtrar
                </Dialog.Title>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-md p-2.5 text-ink transition-colors hover:bg-ink/5"
                  aria-label="Cerrar filtros"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-7">
                {availableSizes.length > 0 && (
                  <div>
                    <p className="mb-3 text-[10px] uppercase tracking-luxe text-ink-muted">Talla</p>
                    {sizeOptions(true)}
                  </div>
                )}
                {availableColors.length > 0 && (
                  <div>
                    <p className="mb-3 text-[10px] uppercase tracking-luxe text-ink-muted">Color</p>
                    {colorOptions(true)}
                  </div>
                )}
                {availableFabrics.length > 0 && (
                  <div>
                    <p className="mb-3 text-[10px] uppercase tracking-luxe text-ink-muted">Tela</p>
                    {fabricOptions(true)}
                  </div>
                )}
                <div>
                  <p className="mb-3 text-[10px] uppercase tracking-luxe text-ink-muted">Especiales</p>
                  <div className="flex gap-2">
                    {specialToggle('Nuevo', showOnlyNew, () => setShowOnlyNew(v => !v), true)}
                    {specialToggle('Oferta', showOnlySale, () => setShowOnlySale(v => !v), true)}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
                >
                  Ver {sortedProducts.length} pieza{sortedProducts.length !== 1 ? 's' : ''}
                </button>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="block w-full py-2 text-center text-xs uppercase tracking-[0.15em] text-ink-muted transition-colors hover:text-clay"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>

      <Footer />
    </>
  )
}
