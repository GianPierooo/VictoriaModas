import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Disclosure, Transition } from '@headlessui/react'
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import QuantitySelector from '../components/QuantitySelector'
import ProductCard from '../components/ProductCard.jsx'
import ResponsiveImage from '../components/ResponsiveImage.jsx'
import { useCart } from '../context/CartContext.jsx'
import { COLOR_HEX } from '../utils/colorMap.js'
import { useProducts } from '../hooks/useProducts.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { useStock, estadoStyle } from '../hooks/useStock.js'
import { formatPEN, formatFechaCorta } from '../utils/price.js'
import { trackEvent } from '../lib/metaPixel.js'

const SITE_URL = 'https://victoriamodas.store'

const WHATSAPP_NUMBER = '51994347405'

// ¿El usuario pidió menos movimiento? (respeta el scroll del carrusel)
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])
  return reduced
}


export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addItem } = useCart()
  const { products, getProductById, getProductsByCategory } = useProducts()
  const product = getProductById(id) || getProductById('vestido-suplex-moderno')
  const productId = product.id

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [quantity, setQuantity] = useState(1)

  // Stock en vivo (si la hoja no está conectada, estado = 'consultar' y el
  // indicador no se muestra; no altera el diseño).
  const { getEstado, getPrecio, getPrecioProducto, getOferta, getOfertaProducto } = useStock()
  const stockStyle = estadoStyle(getEstado(productId, selectedColor, selectedSize))
  // Precio retail: el de la variante elegida, o el representativo del producto.
  const precio = getPrecio(productId, selectedColor, selectedSize) ?? getPrecioProducto(productId)
  // Oferta REAL (nunca inventada — ver api/stock.js#ofertaFor).
  const oferta = getOferta(productId, selectedColor, selectedSize) ?? getOfertaProducto(productId)

  // Al cambiar de producto (navegación entre detalles), reiniciar selección.
  // Si la URL trae ?color=..&talla=.. (pensado para deep-link de anuncios —
  // que el color/talla del video/foto ya venga elegido), se usa si es una
  // opción real de la prenda; si no, cae al comportamiento de siempre.
  useEffect(() => {
    setSelectedImage(0)
    const colorURL = searchParams.get('color')
    const tallaURL = searchParams.get('talla')
    setSelectedColor(colorURL && product.colors.includes(colorURL) ? colorURL : product.colors[0])
    setSelectedSize(tallaURL && product.sizes.includes(tallaURL) ? tallaURL : product.sizes[0])
    setQuantity(1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [productId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Meta Ads: ViewContent una vez por producto visto (no en cada cambio de
  // color/talla — solo cuando cambia de prenda).
  useEffect(() => {
    trackEvent('ViewContent', {
      content_ids: [productId],
      content_name: product.name,
      content_type: 'product',
      currency: 'PEN',
      value: precio ?? undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

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

  // Compartido por "Agregar al carrito" y "Comprar ahora" — agrega la
  // prenda elegida y avisa a Meta Ads (AddToCart) en los dos casos.
  const agregarAlCarrito = () => {
    addItem({
      id: productId,
      name: product.name,
      image: currentImages[0] || product.images[0],
      selectedColor,
      selectedSize,
    }, quantity)
    trackEvent('AddToCart', {
      content_ids: [productId],
      content_name: product.name,
      content_type: 'product',
      currency: 'PEN',
      value: precio != null ? precio * quantity : undefined,
    })
  }

  const handleAddToCart = () => agregarAlCarrito()

  // "Comprar ahora" — el camino más corto: agrega esta prenda y va directo
  // al checkout, sin pasar por el mini-carrito. Pensado para tráfico de
  // anuncios que ya decidió comprar y no quiere pasos de más.
  const handleBuyNow = () => {
    agregarAlCarrito()
    navigate('/checkout')
  }

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, me interesa la prenda "${product.name}" (color ${selectedColor}, talla ${selectedSize}). ¿Está disponible?`
  )}`

  // "Consultar por WhatsApp" es otro camino real de compra (se salta el
  // carrito por completo) — sin esto, Meta no se enteraba de esa intención.
  const handleConsultarWhatsApp = () => {
    trackEvent('Contact', {
      content_ids: [productId],
      content_name: product.name,
      currency: 'PEN',
      value: precio ?? undefined,
    })
  }

  // Relacionados: misma categoría primero, luego el resto del catálogo
  // (para llenar el carrusel), excluyendo el actual.
  const relatedProducts = useMemo(() => {
    const sameCat = getProductsByCategory(product.category).filter(p => p.id !== productId)
    const others = products.filter(p => p.id !== productId && p.category !== product.category)
    return [...sameCat, ...others].slice(0, 8)
  }, [product.category, productId, products]) // eslint-disable-line react-hooks/exhaustive-deps

  const reduced = usePrefersReducedMotion()
  const relatedRef = useRef(null)
  const scrollRelated = (dir) => {
    const el = relatedRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduced ? 'auto' : 'smooth' })
  }

  const categoryPath = `/${product.category}`
  const categoryLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1)

  // SEO: título dinámico + JSON-LD Product (sin price: el modelo es por WhatsApp)
  const productJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: (product.images || [product.image]).map(src => `${SITE_URL}${src}`),
    category: categoryLabel,
    brand: { '@type': 'Brand', name: 'Victoria Modas' },
  }), [product, categoryLabel])

  useDocumentMeta({
    title: `${product.name} | Victoria Modas`,
    description: product.description,
    jsonLd: productJsonLd,
  })

  const accordion = [
    {
      title: 'Detalles y tela',
      body: `Confeccionado en ${product.fabric.toLowerCase()}. ${product.description}`,
    },
    {
      title: 'Envíos',
      body: 'Envío gratis en compras mayores a S/ 60. Entregas en Lima en 2 a 4 días hábiles y a provincias en 4 a 7 días hábiles mediante agencia.',
    },
    {
      title: 'Cambios y devoluciones',
      body: 'Aceptamos cambios dentro de los 7 días posteriores a la entrega, con la prenda sin uso y en su empaque original. Coordínalo con nosotras por WhatsApp.',
    },
  ]

  return (
    <Layout>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
          {/* Breadcrumb */}
          <nav className="mb-10 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-ink-muted" aria-label="Breadcrumb">
            <Link to="/" className="transition-colors hover:text-clay">Inicio</Link>
            <ChevronRightIcon className="h-3 w-3" />
            <Link to={categoryPath} className="transition-colors hover:text-clay">{categoryLabel}</Link>
            <ChevronRightIcon className="h-3 w-3" />
            <span className="text-ink-soft">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-14">
            {/* Galería (60%) */}
            <div className="lg:col-span-3">
              <div className="flex flex-col-reverse gap-4 lg:flex-row lg:gap-5">
                {/* Miniaturas verticales (desktop) / horizontales (móvil) */}
                {currentImages.length > 1 && (
                  <div className="flex gap-3 lg:flex-col" aria-label="Miniaturas del producto">
                    {currentImages.map((src, idx) => {
                      const active = idx === selectedImage
                      return (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setSelectedImage(idx)}
                          className={`relative aspect-[3/4] w-16 flex-shrink-0 overflow-hidden rounded-lg bg-cream-dark transition-all duration-300 active:scale-95 lg:w-24 ${
                            active ? 'ring-1 ring-clay ring-offset-2 ring-offset-white' : 'opacity-60 hover:opacity-100'
                          }`}
                          aria-label={`Ver imagen ${idx + 1}`}
                          aria-current={active ? 'true' : undefined}
                        >
                          <ResponsiveImage src={src} alt="" aria-hidden="true" className="h-full w-full object-cover object-top" loading="lazy" width={200} height={266} />
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Imagen principal — zoom sutil al hover (desktop), swipe (móvil) */}
                <div
                  className="group/zoom relative aspect-[3/4] flex-1 overflow-hidden rounded-xl bg-cream-dark lg:cursor-zoom-in"
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                >
                  <ResponsiveImage
                    key={mainImage}
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-out lg:group-hover/zoom:scale-105"
                    style={{ animation: 'fadeIn 0.45s ease-out both' }}
                    loading="eager"
                    fetchPriority="high"
                    width={900}
                    height={1200}
                  />

                  {/* Contador de imagen (móvil, discreto) */}
                  {currentImages.length > 1 && (
                    <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/50 px-3 py-1 text-[10px] tracking-[0.2em] text-cream backdrop-blur-sm lg:hidden">
                      {selectedImage + 1} / {currentImages.length}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info (40%) */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-28">
                <p className="hero-line mb-4 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.04s' }}>
                  {product.category}
                </p>
                <h1 className="hero-line mb-4 font-serif text-4xl font-light leading-[1.1] text-ink md:text-5xl" style={{ animationDelay: '0.12s' }}>
                  {product.name}
                </h1>
                <div className="hero-line mb-6" style={{ animationDelay: '0.16s' }}>
                  {oferta ? (
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-base font-light text-ink-muted line-through">{formatPEN(oferta.precioAnteriorPEN)}</span>
                      <span className="text-xl font-light text-clay-dark">{formatPEN(precio)}</span>
                      <span className="rounded-full bg-clay/10 px-2.5 py-0.5 text-[10px] uppercase tracking-luxe text-clay-dark">
                        -{oferta.porcentaje}%
                      </span>
                    </div>
                  ) : (
                    <p className="text-xl font-light text-ink">
                      {formatPEN(precio) || <span className="text-ink-soft">Precio a consultar</span>}
                    </p>
                  )}
                  {oferta?.hasta && (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-clay-dark">
                      Oferta por tiempo limitado — hasta el {formatFechaCorta(oferta.hasta)}
                    </p>
                  )}
                </div>
                <p className="hero-line mb-9 max-w-md font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.2s' }}>
                  {product.description}
                </p>

                {/* Color */}
                <div className="mb-8">
                  <div className="mb-3 text-[10px] uppercase tracking-luxe text-ink-muted">
                    Color <span className="text-ink-soft">· {selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorChange(color)}
                        className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90"
                        title={color}
                        aria-label={`Color ${color}`}
                        aria-pressed={selectedColor === color}
                      >
                        <span
                          className={`block h-9 w-9 rounded-full border border-ink/15 transition-all duration-300 ${
                            selectedColor === color ? 'scale-105 ring-1 ring-clay ring-offset-2 ring-offset-white' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: COLOR_HEX[color] || '#CCCCCC' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Talla */}
                <div className="mb-8">
                  <div className="mb-3 text-[10px] uppercase tracking-luxe text-ink-muted">Talla</div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.sizes.map((size) => {
                      const disabled = unavailableSizes.includes(size)
                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={disabled}
                          onClick={() => setSelectedSize(size)}
                          aria-pressed={selectedSize === size}
                          className={`h-11 min-w-[52px] rounded-full border px-5 text-sm uppercase tracking-[0.1em] transition-all duration-300 active:scale-95 ${
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

                {/* Disponibilidad en vivo (discreto; oculto si no hay hoja conectada) */}
                {stockStyle && (
                  <div
                    className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em]"
                    style={{ color: stockStyle.color }}
                    aria-live="polite"
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: stockStyle.dot }}
                      aria-hidden="true"
                    />
                    {stockStyle.label}
                  </div>
                )}

                {/* Cantidad */}
                <div className="mb-8">
                  <QuantitySelector
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    min={1}
                    max={10}
                  />
                </div>

                {/* Acciones — "Comprar ahora" es el camino más corto (va
                    directo al checkout), por eso es la acción principal;
                    "Agregar al carrito" queda como secundaria para quien
                    sigue viendo más prendas. */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-all duration-500 hover:bg-clay active:scale-[0.99]"
                  >
                    Comprar ahora
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="block w-full rounded-full border border-ink/20 py-4 text-center text-xs uppercase tracking-[0.2em] text-ink transition-all duration-500 hover:border-ink hover:bg-ink/[0.03] active:scale-[0.99]"
                  >
                    Agregar al carrito
                  </button>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleConsultarWhatsApp}
                    className="flex w-full items-center justify-center gap-2 py-2 text-xs uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    Consultar por WhatsApp
                  </a>
                </div>

                {/* Línea de confianza (envío y cambios; sin precios) */}
                <div className="mt-5 flex flex-col gap-2 text-[11px] font-light text-ink-muted sm:flex-row sm:items-center sm:gap-5">
                  <span className="inline-flex items-center gap-1.5">
                    <TruckIcon className="h-4 w-4 text-clay" />
                    Envío gratis desde S/ 60
                  </span>
                  <span className="hidden text-ink/20 sm:inline">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowPathIcon className="h-4 w-4 text-clay" />
                    Cambios dentro de 7 días
                  </span>
                </div>

                {/* Acordeón — hairlines refinados */}
                <div className="mt-12 border-t border-ink/10">
                  {accordion.map((item) => (
                    <Disclosure key={item.title}>
                      {({ open }) => (
                        <div className="border-b border-ink/10">
                          <Disclosure.Button className="flex w-full items-center justify-between py-5 text-left text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:text-clay">
                            {item.title}
                            <ChevronUpIcon className={`h-4 w-4 flex-shrink-0 text-ink-muted transition-transform duration-300 ${open ? '' : 'rotate-180'}`} />
                          </Disclosure.Button>
                          <Transition
                            enter="transition duration-200 ease-out"
                            enterFrom="opacity-0 -translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition duration-150 ease-in"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 -translate-y-1"
                          >
                            <Disclosure.Panel className="pb-6 text-sm font-light leading-relaxed text-ink-soft">
                              {item.body}
                            </Disclosure.Panel>
                          </Transition>
                        </div>
                      )}
                    </Disclosure>
                  ))}
                </div>

                {/* ── RESEÑAS ─────────────────────────────────────────────
                    Bloque preparado para cuando el dueño tenga reseñas reales.
                    Descomentar y alimentar `product.reviews` (array de
                    { autor, estrellas, texto, fecha }) desde products.js o una
                    fuente externa. Mantener la paleta (estrellas en clay) y no
                    inventar reseñas.

                {product.reviews?.length > 0 && (
                  <div className="mt-12 border-t border-ink/10 pt-8">
                    <h2 className="mb-6 font-serif text-2xl font-light text-ink">Reseñas</h2>
                    <ul className="space-y-6">
                      {product.reviews.map((r, i) => (
                        <li key={i}>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-clay" aria-label={`${r.estrellas} de 5`}>
                              {'★'.repeat(r.estrellas)}{'☆'.repeat(5 - r.estrellas)}
                            </span>
                            <span className="text-xs text-ink-muted">{r.autor}</span>
                          </div>
                          <p className="text-sm font-light leading-relaxed text-ink-soft">{r.texto}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                ───────────────────────────────────────────────────────── */}
              </div>
            </div>
          </div>
        </div>

        {/* También te puede gustar — carrusel horizontal (coherente con el Home) */}
        {relatedProducts.length > 0 && (
          <section className="overflow-hidden bg-cream py-20 md:py-28">
            <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6 px-6 lg:px-8">
              <div>
                <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Quizá te guste</p>
                <h2 className="font-serif text-3xl font-light leading-[1.05] text-ink md:text-4xl">
                  También te puede gustar
                </h2>
              </div>
              <div className="hidden shrink-0 gap-3 md:flex">
                <button
                  type="button"
                  onClick={() => scrollRelated(-1)}
                  aria-label="Ver anteriores"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:border-ink hover:bg-ink/[0.03]"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRelated(1)}
                  aria-label="Ver siguientes"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:border-ink hover:bg-ink/[0.03]"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              ref={relatedRef}
              role="region"
              aria-label="También te puede gustar"
              tabIndex={0}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-4 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {relatedProducts.map((p, i) => (
                <div key={p.id} className="w-[62%] shrink-0 snap-start sm:w-[40%] lg:w-[23%]">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}
