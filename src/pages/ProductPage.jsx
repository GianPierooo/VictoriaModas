import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { 
  ChevronRightIcon, 
  TruckIcon, 
  ArrowPathIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import QuantitySelector from '../components/QuantitySelector'

// Mock products database
const MOCK_PRODUCTS = {
  'blusa-seda-francesa': {
    name: 'Blusa Seda Francesa',
    fabric: 'Seda francesa premium',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Azul', 'Negro', 'Plomo'],
    description: 'Blusa elegante confeccionada en seda francesa premium. Diseño sofisticado y versátil, perfecta para looks casuales y formales.',
    images: [
      '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png',
      '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_atras.png',
      '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_delado.png'
    ],
    colorImages: {
      'Azul': [
        '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png',
        '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_atras.png',
        '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_delado.png'
      ],
      'Negro': [
        '/imagenes/blusas/blusa_seda_francesa/negro_adelante.png',
        '/imagenes/blusas/blusa_seda_francesa/negro_atras.png',
        '/imagenes/blusas/blusa_seda_francesa/negro_delado.png'
      ],
      'Plomo': [
        '/imagenes/blusas/blusa_seda_francesa/plomo_adelante.png',
        '/imagenes/blusas/blusa_seda_francesa/plomo_atras.png',
        '/imagenes/blusas/blusa_seda_francesa/plomo_delado.png'
      ]
    }
  },
  'pantalon-scuba-vena': {
    name: 'Pantalón Scuba Vena',
    fabric: 'Scuba premium',
    sizes: ['S', 'M', 'L'],
    colors: ['Negro', 'Azul', 'Camello', 'Vino', 'Plomo'],
    description: 'Pantalón cómodo en tela scuba. Corte wide-leg con caída impecable y comodidad superior.',
    images: [
      '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_negro_adelante.png',
      '/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_atras.png',
      '/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_delado.png'
    ],
    colorImages: {
      'Negro': [
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_negro_adelante.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_atras.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_delado.png'
      ],
      'Azul': [
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_azul_defrente.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_azul_atras.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_azul_delado.png'
      ],
      'Camello': [
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_camello_adelante.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_camello_atras.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_camello_delado.png'
      ],
      'Vino': [
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_vino_adelante.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_vino_atras.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_vino_delado.png'
      ],
      'Plomo': [
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_plomo_adelante.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_plomo_atras.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_plomo_delado.png'
      ]
    }
  },
  'pantalon-scuba-correa': {
    name: 'Pantalón Scuba con Correa',
    fabric: 'Scuba premium',
    sizes: ['S', 'M', 'L'],
    colors: ['Beach', 'Negro', 'Azul', 'Plomo'],
    description: 'Pantalón scuba moderno con correa decorativa, ideal para looks elegantes. Comodidad y estilo en una sola prenda.',
    images: ['/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_beach.png'],
    colorImages: {
      'Beach': [
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_beach.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_beach.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_beach.png'
      ],
      'Negro': [
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_negro.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_negro.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_negro.png'
      ],
      'Azul': [
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_azul.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_azul.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_azul.png'
      ],
      'Plomo': [
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_plomo.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_plomo.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_plomo.png'
      ]
    }
  },
  'vestido-lame-elegante': {
    name: 'Vestido Lame Elegante',
    fabric: 'Tela lame premium',
    sizes: ['S', 'M', 'L'],
    colors: ['Plomo', 'Negro', 'Azul', 'Vino'],
    description: 'Vestido elegante en tela lame con brillo sutil y caída impecable. Perfecto para ocasiones especiales.',
    images: ['/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png'],
    colorImages: {
      'Plomo': [
        '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png',
        '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_atras.png',
        '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_delado.png'
      ],
      'Negro': [
        '/imagenes/vestidos/vestido_lame01/negro_adelante.png',
        '/imagenes/vestidos/vestido_lame01/negro_atras.png',
        '/imagenes/vestidos/vestido_lame01/negro_delado.png'
      ],
      'Azul': [
        '/imagenes/vestidos/vestido_lame01/azul_adelante.png',
        '/imagenes/vestidos/vestido_lame01/azul_atras.png',
        '/imagenes/vestidos/vestido_lame01/azul_delado.png'
      ],
      'Vino': [
        '/imagenes/vestidos/vestido_lame01/vino_defrente.png',
        '/imagenes/vestidos/vestido_lame01/vino_atras.png',
        '/imagenes/vestidos/vestido_lame01/vino_delado.png'
      ]
    }
  },
  'vestido-suplex-moderno': {
    name: 'Vestido Suplex Moderno',
    fabric: 'Suplex de alta calidad',
    sizes: ['S', 'M', 'L'],
    colors: ['Azul', 'Blanco', 'Negro', 'Vino'],
    description: 'Vestido moderno en suplex de alta calidad. Ajuste perfecto al cuerpo con diseño versátil y elegante.',
    images: ['/imagenes/vestidos/vestido_suplex01/azul_adelante.png'],
    colorImages: {
      'Azul': [
        '/imagenes/vestidos/vestido_suplex01/azul_adelante.png',
        '/imagenes/vestidos/vestido_suplex01/azul_atras.png',
        '/imagenes/vestidos/vestido_suplex01/azul_delado.png'
      ],
      'Blanco': [
        '/imagenes/vestidos/vestido_suplex01/blanco_adelante.png',
        '/imagenes/vestidos/vestido_suplex01/blanco_atras.png',
        '/imagenes/vestidos/vestido_suplex01/blanco_delado.png'
      ],
      'Negro': [
        '/imagenes/vestidos/vestido_suplex01/negro_adelante.png',
        '/imagenes/vestidos/vestido_suplex01/negro_atras.png',
        '/imagenes/vestidos/vestido_suplex01/negro_delado.png'
      ],
      'Vino': [
        '/imagenes/vestidos/vestido_suplex01/vino_adelante.png',
        '/imagenes/vestidos/vestido_suplex01/vino_atras.png',
        '/imagenes/vestidos/vestido_suplex01/vino_delado.png'
      ]
    }
  },
  'vestido-rit-elegante': {
    name: 'Vestido Rit Elegante',
    fabric: 'Tela Rit de alta calidad',
    sizes: ['S', 'M', 'L'],
    colors: ['Beige', 'Negro', 'Plomo'],
    description: 'Vestido elegante en tela Rit de primera calidad. Diseño sofisticado y moderno con excelente caída.',
    images: ['/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delante.png'],
    colorImages: {
      'Beige': [
        '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delante.png',
        '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_atras.png',
        '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delado.png'
      ],
      'Negro': [
        '/imagenes/vestidos/vestido_rit02/vestido_rit_negro_delante.png',
        '/imagenes/vestidos/vestido_rit02/vestido_rit_negro_atras.png',
        '/imagenes/vestidos/vestido_rit02/vestido_rit_negro_delado.png'
      ],
      'Plomo': [
        '/imagenes/vestidos/vestido_rit02/vestido_rit_plomo_delante.png',
        '/imagenes/vestidos/vestido_rit02/vestido_rit_plomo_atras.png',
        '/imagenes/vestidos/vestido_rit02/vestido_rit_plomo_delado.png'
      ]
    }
  }
}

export default function ProductPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const product = MOCK_PRODUCTS[id] || MOCK_PRODUCTS['vestido-suplex-moderno']

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [quantity, setQuantity] = useState(1)

  const colorMap = {
    'Beige': '#F5E6D3', 'Beach': '#F5E6D3', 'Negro': '#2C2C2C', 'Blanco': '#FFFFFF',
    'Azul': '#1E40AF', 'Camello': '#C19A6B', 'Vino': '#722F37',
    'Plomo': '#6B7280', 'Gris': '#6B7280'
  }

  const getCurrentImages = () => {
    if (product.colorImages && selectedColor && product.colorImages[selectedColor]) {
      return product.colorImages[selectedColor]
    }
    return product.images || []
  }

  const currentImages = getCurrentImages()

  return (
    <Layout>
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gray-900">Inicio</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link to="/vestidos" className="hover:text-gray-900">Productos</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <div className="space-y-4">
              {/* Main Image con bordes redondeados */}
              <div className="aspect-[3/4] bg-rose-50/30 rounded-3xl overflow-hidden shadow-lg">
                <img 
                  src={currentImages[selectedImage] || product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              {/* Thumbnails circulares */}
              {currentImages.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {currentImages.map((src, idx) => (
                    <button 
                      key={idx} 
                      className={`aspect-square bg-rose-50/30 rounded-3xl overflow-hidden border-3 transition-all ${
                        idx === selectedImage 
                          ? 'border-rose scale-105 shadow-[0_0_20px_rgba(247,202,201,0.6)]' 
                          : 'border-rose-200/40 hover:border-rose-200'
                      }`}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <img 
                        src={src} 
                        alt={`${product.name} vista ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8)</span>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* Options */}
              <div className="space-y-6 mb-8">
                {/* Size - botones circulares */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Talla:
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map(size => (
                      <button 
                        key={size} 
                        className={`w-14 h-14 rounded-full border-3 font-semibold transition-all duration-300 ${
                          selectedSize === size 
                            ? 'border-rose bg-gradient-to-br from-rose to-rose-200 text-white shadow-[0_0_20px_rgba(247,202,201,0.6)] scale-110' 
                            : 'border-rose-200/50 text-gray-700 hover:border-rose hover:scale-105'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color - círculos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color: <span className="font-normal text-rose-400">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map(color => (
                      <button 
                        key={color} 
                        className={`w-14 h-14 rounded-full border-4 transition-all duration-300 ${
                          selectedColor === color 
                            ? 'border-rose scale-125 shadow-[0_0_20px_rgba(247,202,201,0.6)]' 
                            : 'border-gray-300 hover:border-rose-200 hover:scale-110'
                        }`}
                        style={{ backgroundColor: colorMap[color] || '#ddd' }}
                        title={color}
                        onClick={() => {
                          setSelectedColor(color)
                          setSelectedImage(0)
                        }}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Fabric */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tela:
                  </label>
                  <span className="inline-block px-6 py-3 bg-rose-50 text-gray-700 rounded-full border border-rose-200/50">
                    {product.fabric}
                  </span>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <QuantitySelector
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  min={1}
                  max={10}
                />
              </div>

              {/* Actions - botones circulares */}
              <div className="space-y-3 mb-8">
                <button
                  onClick={() => {
                    const images = getCurrentImages()
                    addItem({
                      id: id || 'default-product',
                      name: product.name,
                      image: images[0] || product.images[0],
                      selectedColor,
                      selectedSize
                    }, quantity)
                  }}
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105 hover:shadow-xl"
                >
                  <span>🛒</span>
                  Agregar al carrito
                </button>
                <button className="w-full bg-gradient-to-r from-rose to-rose-200 hover:from-rose-600 hover:to-rose-300 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105 hover:shadow-[0_0_30px_rgba(247,202,201,0.6)]">
                  <span>⚡</span>
                  Comprar ahora
                </button>
                <button className="w-full bg-white hover:bg-rose-50 text-gray-900 px-8 py-4 rounded-full font-semibold border-2 border-rose-200/50 hover:border-rose transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105">
                  <span>❤️</span>
                  Agregar a favoritos
                </button>
              </div>

              {/* Features - tarjetas redondeadas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-rose-50 to-white rounded-2xl border-2 border-rose-200/40 hover:border-rose-200 transition-all duration-300 hover:shadow-lg">
                  <TruckIcon className="w-6 h-6 text-rose flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Envío gratis</p>
                    <p className="text-xs text-gray-600">En compras &gt; S/150</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-rose-50 to-white rounded-2xl border-2 border-rose-200/40 hover:border-rose-200 transition-all duration-300 hover:shadow-lg">
                  <ArrowPathIcon className="w-6 h-6 text-rose flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Devoluciones</p>
                    <p className="text-xs text-gray-600">30 días</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-rose-50 to-white rounded-2xl border-2 border-rose-200/40 hover:border-rose-200 transition-all duration-300 hover:shadow-lg">
                  <ShieldCheckIcon className="w-6 h-6 text-rose flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Garantía</p>
                    <p className="text-xs text-gray-600">Calidad garantizada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
