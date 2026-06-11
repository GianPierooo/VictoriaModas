import { useState } from 'react'
import {
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import AnnouncementBanner from './AnnouncementBanner.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ProductCard from './ProductCard.jsx'

// ============= COMPONENTE PRINCIPAL =============
export default function ProductsPage({ products = [], title = "PRODUCTOS", category = "productos", filters = {} }) {
  const [sortBy, setSortBy] = useState('popularidad')
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFabrics, setSelectedFabrics] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [showOnlySale, setShowOnlySale] = useState(false)
  const [showOnlyNew, setShowOnlyNew] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Usar productos sin normalizar precios
  const allProducts = products

  // Filtros disponibles
  const availableSizes = filters.availableSizes || []
  
  // Generar colores disponibles
  const availableColors = filters.availableColors || (() => {
    const colorCounts = {}
    allProducts.forEach(p => {
      if (p.colors) {
        p.colors.forEach(c => {
          colorCounts[c] = (colorCounts[c] || 0) + 1
        })
      }
    })
    
    const colorMap = {
      'Beige': '#F5E6D3', 'Negro': '#2C2C2C', 'Blanco': '#FFFFFF',
      'Azul': '#1E40AF', 'Vino': '#722F37', 'Plomo': '#6B7280'
    }
    
    return Object.keys(colorCounts).map(color => ({
      label: color,
      count: colorCounts[color],
      hex: colorMap[color] || '#CCCCCC'
    }))
  })()

  // Aplicar filtros
  const filteredProducts = allProducts.filter(product => {
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (selectedSizes.length > 0 && !selectedSizes.some(size => product.sizes?.includes(size))) return false
    if (selectedColors.length > 0 && !selectedColors.some(color => product.colors?.includes(color))) return false
    if (showOnlySale && !product.badge?.includes('%')) return false
    if (showOnlyNew && product.badge !== 'Nuevo') return false
    return true
  })

  // Aplicar ordenamiento (sin ordenar por precio)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'nuevos': return (b.badge === 'Nuevo' ? 1 : 0) - (a.badge === 'Nuevo' ? 1 : 0)
      default: return 0
    }
  })

  // Handlers
  const toggleSize = (size) => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  const toggleColor = (color) => setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])
  
  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedFabrics([])
    setSelectedSizes([])
    setSelectedColors([])
    setShowOnlySale(false)
    setShowOnlyNew(false)
  }

  const activeFiltersCount = [searchTerm, selectedFabrics.length, selectedSizes.length, selectedColors.length, showOnlySale, showOnlyNew].filter(Boolean).length

  return (
    <>
      <AnnouncementBanner />
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-white via-rose-50/30 to-white pt-28">
        {/* Hero Header */}
        <div className="relative h-56 md:h-72 bg-gradient-to-r from-rose via-rose-100 to-rose-50 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-dark/20 rounded-full blur-3xl animate-float"></div>
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 animate-fade-in">
                <span className="text-white drop-shadow-lg">{title.split(' ')[0]}</span>
                {title.split(' ')[1] && <span className="text-gray-900"> {title.split(' ')[1]}</span>}
              </h1>
              <p className="text-lg md:text-xl text-gray-800 font-medium animate-fade-in">
                {sortedProducts.length} producto{sortedProducts.length !== 1 ? 's' : ''} disponible{sortedProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="w-24 h-1 bg-white/80 mt-4 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters (Desktop) */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                {/* Filter Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                  {activeFiltersCount > 0 && (
                    <button 
                      onClick={clearAllFilters}
                      className="text-sm text-rose hover:text-rose-dark transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Búsqueda</h4>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Buscar ${category}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose focus:border-transparent"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sizes */}
                {availableSizes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Tallas</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map(size => (
                        <button
                          key={size.label}
                          onClick={() => toggleSize(size.label)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            selectedSizes.includes(size.label)
                              ? 'bg-rose text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {size.label} ({size.count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {availableColors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Colores</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {availableColors.map(color => (
                        <button
                          key={color.label}
                          onClick={() => toggleColor(color.label)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            selectedColors.includes(color.label)
                              ? 'border-rose scale-110'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={`${color.label} (${color.count})`}
                          aria-label={`Color ${color.label}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Filters */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Especiales</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowOnlySale(!showOnlySale)}
                      className={`w-full px-4 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                        showOnlySale ? 'bg-rose text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🔥 Solo Ofertas
                    </button>
                    <button
                      onClick={() => setShowOnlyNew(!showOnlyNew)}
                      className={`w-full px-4 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                        showOnlyNew ? 'bg-rose text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ✨ Solo Nuevos
                    </button>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Ordenar por</h4>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose focus:border-transparent"
                  >
                    <option value="popularidad">Popularidad</option>
                    <option value="nuevos">Más Nuevos</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 lg:hidden">
                <button
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className="flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose"
                >
                  <option value="popularidad">Popularidad</option>
                  <option value="nuevos">Más Nuevos</option>
                </select>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 lg:gap-x-6">
                {sortedProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                  />
                ))}
              </div>

              {/* Empty State */}
              {sortedProducts.length === 0 && (
                <div className="text-center py-20">
                  <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Intenta ajustar los filtros o búsqueda
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="btn-outline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  )
}
