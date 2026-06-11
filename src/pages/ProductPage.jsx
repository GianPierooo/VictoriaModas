import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Disclosure, Transition } from '@headlessui/react'
import {
  ChevronRightIcon,
  ChevronUpIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import QuantitySelector from '../components/QuantitySelector'
import ProductCard from '../components/ProductCard.jsx'
import { useCart } from '../context/CartContext.jsx'
import { COLOR_HEX } from '../utils/colorMap.js'

const WHATSAPP_NUMBER = '51993357672'

// Rutas de catálogo por categoría (para el breadcrumb)
const CATEGORY_PATH = {
  Vestidos: '/vestidos',
  Blusas: '/blusas',
  Pantalones: '/pantalones',
}

// Mock products database
const MOCK_PRODUCTS = {
  'blusa-seda-francesa': {
    name: 'Blusa Seda Francesa',
    category: 'Blusas',
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
    category: 'Pantalones',
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
    category: 'Pantalones',
    fabric: 'Scuba premium',
    sizes: ['S', 'M', 'L'],
    colors: ['Beach', 'Negro', 'Azul', 'Plomo'],
    description: 'Pantalón scuba moderno con correa decorativa, ideal para looks elegantes. Comodidad y estilo en una sola prenda.',
    images: [
      '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_beach.png',
      '/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_beach.png',
      '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_beach.png'
    ],
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
    category: 'Vestidos',
    fabric: 'Tela lame premium',
    sizes: ['S', 'M', 'L'],
    colors: ['Plomo', 'Negro', 'Azul', 'Vino'],
    description: 'Vestido elegante en tela lame con brillo sutil y caída impecable. Perfecto para ocasiones especiales.',
    images: [
      '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png',
      '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_atras.png',
      '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_delado.png'
    ],
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
    category: 'Vestidos',
    fabric: 'Suplex de alta calidad',
    sizes: ['S', 'M', 'L'],
    colors: ['Azul', 'Blanco', 'Negro', 'Vino'],
    description: 'Vestido moderno en suplex de alta calidad. Ajuste perfecto al cuerpo con diseño versátil y elegante.',
    images: [
      '/imagenes/vestidos/vestido_suplex01/azul_adelante.png',
      '/imagenes/vestidos/vestido_suplex01/azul_atras.png',
      '/imagenes/vestidos/vestido_suplex01/azul_delado.png'
    ],
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
    category: 'Vestidos',
    fabric: 'Tela Rit de alta calidad',
    sizes: ['S', 'M', 'L'],
    colors: ['Beige', 'Negro', 'Plomo'],
    description: 'Vestido elegante en tela Rit de primera calidad. Diseño sofisticado y moderno con excelente caída.',
    images: [
      '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delante.png',
      '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_atras.png',
      '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delado.png'
    ],
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

// Construye el objeto que consume ProductCard a partir de una entrada mock
function toCardProduct(id, p) {
  const base = p.colorImages?.[p.colors[0]] || p.images || []
  return {
    id,
    name: p.name,
    category: p.category,
    image: base[0],
    images: base,
    colors: p.colors,
    colorImages: p.colorImages,
  }
}

export default function ProductPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const productId = MOCK_PRODUCTS[id] ? id : 'vestido-suplex-moderno'
  const product = MOCK_PRODUCTS[productId]

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [quantity, setQuantity] = useState(1)

  // Al cambiar de producto (navegación entre detalles), reiniciar selección
  useEffect(() => {
    setSelectedImage(0)
    setSelectedColor(product.colors[0])
    setSelectedSize(product.sizes[0])
    setQuantity(1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [productId]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentImages = useMemo(() => {
    if (product.colorImages?.[selectedColor]?.length) return product.colorImages[selectedColor]
    return product.images || []
  }, [product, selectedColor])

  const mainImage = currentImages[selectedImage] || currentImages[0]

  // Tallas no disponibles (capacidad lista; los datos actuales no marcan ninguna)
  const unavailableSizes = product.unavailableSizes || []

  // Swipe en móvil
  const touchStartX = useRef(0)
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) < 50) return
    setSelectedImage((i) => {
      if (dx < 0) return Math.min(i + 1, currentImages.length - 1)
      return Math.max(i - 1, 0)
    })
  }

  const handleColorChange = (color) => {
    setSelectedColor(color)
    setSelectedImage(0)
  }

  const handleAddToCart = () => {
    addItem({
      id: productId,
      name: product.name,
      image: currentImages[0] || product.images[0],
      selectedColor,
      selectedSize,
    }, quantity)
  }

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, me interesa la prenda "${product.name}" (color ${selectedColor}, talla ${selectedSize}). ¿Está disponible?`
  )}`

  // Relacionados: misma categoría, excluyendo el actual
  const relatedProducts = Object.entries(MOCK_PRODUCTS)
    .filter(([key, p]) => key !== productId && p.category === product.category)
    .slice(0, 4)
    .map(([key, p]) => toCardProduct(key, p))

  const categoryPath = CATEGORY_PATH[product.category] || '/vestidos'

  const accordion = [
    {
      title: 'Detalles y tela',
      body: `Confeccionado en ${product.fabric.toLowerCase()}. ${product.description}`,
    },
    {
      title: 'Envíos',
      body: 'Envío gratis en compras mayores a S/ 200. Entregas en Lima en 2 a 4 días hábiles y a provincias en 4 a 7 días hábiles mediante agencia.',
    },
    {
      title: 'Cambios y devoluciones',
      body: 'Aceptamos cambios dentro de los 7 días posteriores a la entrega, con la prenda sin uso y en su empaque original. Coordínalo con nosotras por WhatsApp.',
    },
  ]

  return (
    <Layout>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-12">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-ink-muted" aria-label="Breadcrumb">
            <Link to="/" className="transition-colors hover:text-clay">Inicio</Link>
            <ChevronRightIcon className="h-3 w-3" />
            <Link to={categoryPath} className="transition-colors hover:text-clay">{product.category}</Link>
            <ChevronRightIcon className="h-3 w-3" />
            <span className="text-ink-soft">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
            {/* Galería (60%) */}
            <div className="lg:col-span-3">
              <div className="flex flex-col-reverse gap-4 lg:flex-row">
                {/* Miniaturas */}
                {currentImages.length > 1 && (
                  <div className="flex gap-3 lg:flex-col">
                    {currentImages.map((src, idx) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setSelectedImage(idx)}
                        className={`relative aspect-[3/4] w-16 flex-shrink-0 overflow-hidden rounded-md bg-cream-dark transition-all duration-300 lg:w-20 ${
                          idx === selectedImage ? 'ring-1 ring-clay ring-offset-2 ring-offset-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        aria-label={`Ver imagen ${idx + 1}`}
                      >
                        <img src={src} alt="" aria-hidden="true" className="h-full w-full object-cover object-top" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Imagen principal */}
                <div
                  className="relative aspect-[3/4] flex-1 overflow-hidden rounded-lg bg-cream-dark"
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                >
                  <img
                    key={mainImage}
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full object-cover object-top"
                    style={{ animation: 'fadeIn 0.4s ease-out both' }}
                    loading="eager"
                  />
                </div>
              </div>
            </div>

            {/* Info (40%) */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-28">
                <p className="mb-3 text-[11px] uppercase tracking-luxe text-clay">
                  {product.category}
                </p>
                <h1 className="mb-5 font-serif text-3xl font-light leading-tight text-ink">
                  {product.name}
                </h1>
                <p className="mb-8 font-light leading-relaxed text-ink-soft">
                  {product.description}
                </p>

                {/* Color */}
                <div className="mb-7">
                  <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-luxe text-ink-muted">
                    Color
                    <span className="text-ink-soft">· {selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorChange(color)}
                        className="flex h-11 w-11 items-center justify-center rounded-full"
                        title={color}
                        aria-label={`Color ${color}`}
                        aria-pressed={selectedColor === color}
                      >
                        <span
                          className={`block h-8 w-8 rounded-full border border-ink/15 transition-all duration-300 ${
                            selectedColor === color ? 'ring-1 ring-clay ring-offset-2 ring-offset-white' : ''
                          }`}
                          style={{ backgroundColor: COLOR_HEX[color] || '#CCCCCC' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Talla */}
                <div className="mb-7">
                  <div className="mb-3 text-[10px] uppercase tracking-luxe text-ink-muted">Talla</div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const disabled = unavailableSizes.includes(size)
                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={disabled}
                          onClick={() => setSelectedSize(size)}
                          className={`h-11 min-w-[48px] rounded-md border px-4 text-sm uppercase tracking-[0.1em] transition-colors duration-300 ${
                            disabled
                              ? 'cursor-not-allowed border-ink/10 text-ink-muted/40 line-through'
                              : selectedSize === size
                                ? 'border-ink bg-ink text-cream'
                                : 'border-ink/20 text-ink-soft hover:border-ink'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Cantidad */}
                <div className="mb-8">
                  <QuantitySelector
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    min={1}
                    max={10}
                  />
                </div>

                {/* Acciones */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
                  >
                    Agregar al carrito
                  </button>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:border-ink hover:bg-ink/[0.03]"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    Consultar por WhatsApp
                  </a>
                </div>

                {/* Acordeón */}
                <div className="mt-10 border-t border-ink/10">
                  {accordion.map((item) => (
                    <Disclosure key={item.title}>
                      {({ open }) => (
                        <div className="border-b border-ink/10">
                          <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:text-clay">
                            {item.title}
                            <ChevronUpIcon className={`h-4 w-4 text-ink-muted transition-transform duration-300 ${open ? '' : 'rotate-180'}`} />
                          </Disclosure.Button>
                          <Transition
                            enter="transition duration-200 ease-out"
                            enterFrom="opacity-0 -translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition duration-150 ease-in"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 -translate-y-1"
                          >
                            <Disclosure.Panel className="pb-5 text-sm font-light leading-relaxed text-ink-soft">
                              {item.body}
                            </Disclosure.Panel>
                          </Transition>
                        </div>
                      )}
                    </Disclosure>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* También te puede gustar */}
        {relatedProducts.length > 0 && (
          <section className="bg-cream py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-12 text-center">
                <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Quizá te guste</p>
                <h2 className="font-serif text-3xl font-light text-ink md:text-4xl">
                  También te puede gustar
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
                {relatedProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}
