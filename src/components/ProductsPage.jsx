import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { Link } from 'react-router-dom'
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'
import AnnouncementBanner from './AnnouncementBanner.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

// ============= PRODUCT CARD COMPLEJO (con selección de color/talla) =============
function CatalogProductCard({ product, onAddToCart }) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [intervalId, setIntervalId] = useState(null)
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null)
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null)
  
  // Mapa de colores a hexadecimales
  const colorMap = {
    'Beige': '#F5E6D3', 'Beach': '#F5E6D3',
    'Negro': '#2C2C2C', 'Blanco': '#FFFFFF',
    'Azul': '#1E40AF', 'Azul Marino': '#000080',
    'Azul Claro': '#87CEEB', 'Azul Oscuro': '#00008B',
    'Camello': '#C19A6B', 'Camel': '#C19A6B',
    'Vino': '#722F37', 'Burdeos': '#722F37',
    'Plomo': '#6B7280', 'Gris': '#808080',
    'Rosa': '#FFC0CB', 'Rosa Palo': '#FFB6C1',
    'Rojo': '#DC143C', 'Verde': '#228B22',
    'Dorado': '#FFD700', 'Plata': '#C0C0C0',
    'Celeste': '#87CEEB', 'Marrón': '#8B4513'
  }
  
  // Obtener imágenes según color
  const getCurrentImages = () => {
    if (product.colorImages && selectedColor && product.colorImages[selectedColor]) {
      return product.colorImages[selectedColor]
    }
    return product.images || [product.image]
  }
  
  const getCurrentImage = () => {
    const images = getCurrentImages()
    return images[currentImageIndex] || images[0] || product.image
  }
  
  // Image rotation on hover
  const handleMouseEnter = () => {
    setIsHovered(true)
    const images = getCurrentImages()
    if (images.length > 1) {
      const id = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length)
      }, 800)
      setIntervalId(id)
    }
  }
  
  const handleMouseLeave = () => {
    setIsHovered(false)
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    setCurrentImageIndex(0)
  }
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [intervalId])
  
  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <Link 
        to={`/producto/${product.id}`}
        className="block"
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img 
            src={getCurrentImage()} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Badge */}
          {product.badge && (
            <span className={`absolute top-3 left-3 z-10 px-3 py-1 text-xs font-semibold rounded-full ${
              product.badge.includes('%') || product.badge.includes('-')
                ? 'bg-rose text-white'
                : product.badge === 'Nuevo'
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white'
            }`}>
              {product.badge}
            </span>
          )}
          
          {/* Image Indicators */}
          {getCurrentImages().length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {getCurrentImages().map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Quick Add Button */}
          <button 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCart({
                ...product,
                image: getCurrentImage(),
                selectedColor,
                selectedSize
              }, 1)
            }}
          >
            Agregar
          </button>
        </div>
        
        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
          
          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {product.colors.map(color => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === color 
                      ? 'border-rose scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedColor(color)
                    setCurrentImageIndex(0)
                  }}
                  style={{ backgroundColor: colorMap[color] || '#ccc' }}
                  title={color}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          )}
          
          {/* Price - Removido */}
        </div>
      </Link>
    </div>
  )
}

// ============= COMPONENTE PRINCIPAL =============
export default function ProductsPage({ products = [], title = "PRODUCTOS", category = "productos", filters = {} }) {
  const { addItem } = useCart()
  const [sortBy, setSortBy] = useState('popularidad')
  const [viewMode, setViewMode] = useState('grid')
  
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
  const availableFabrics = filters.availableFabrics || []
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
  const handleAddToCart = (product) => {
    addItem({
      id: product.id,
      name: product.name,
      image: product.image,
      selectedColor: product.selectedColor,
      selectedSize: product.selectedSize,
      quantity: 1
    })
  }

  const toggleFabric = (fabric) => setSelectedFabrics(prev => prev.includes(fabric) ? prev.filter(f => f !== fabric) : [...prev, fabric])
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
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {sortedProducts.map(product => (
                  <CatalogProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
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
