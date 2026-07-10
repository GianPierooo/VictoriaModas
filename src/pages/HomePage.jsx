import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon, ChevronLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import AnnouncementBanner from '../components/AnnouncementBanner.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ResponsiveImage from '../components/ResponsiveImage.jsx'
import PageTransition from '../motion/PageTransition.jsx'
import { useInViewReveal } from '../motion/useInViewReveal.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

// ── Assets del hero. El dueño puede subir el video real a /videos/hero.mp4;
//    si no existe, el hero usa la imagen editorial de respaldo sin romperse. ──
const HERO_VIDEO = '/videos/hero.mp4'
const HERO_IMAGE = '/imagenes/vestidos/vestido_suplex01/azul_adelante.png'

// ¿El usuario pidió menos movimiento? (se respeta en video y animaciones)
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

// ============= HERO — tejido en movimiento =============
function Hero() {
  const reduced = usePrefersReducedMotion()
  const [showVideo, setShowVideo] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  // El LCP es la imagen (eager/high). El video se monta DESPUÉS del primer
  // paint (idle) para no competir con el LCP, y solo si no hay reduced-motion.
  useEffect(() => {
    if (reduced) return
    let idleId
    const start = () => setShowVideo(true)
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(start, { timeout: 1600 })
      return () => window.cancelIdleCallback?.(idleId)
    }
    const t = setTimeout(start, 800)
    return () => clearTimeout(t)
  }, [reduced])

  const videoLayer = showVideo && !videoFailed && !reduced

  return (
    <section className="relative w-full min-h-[92vh] overflow-hidden bg-ink">
      {/* Media base: imagen editorial (LCP). Siempre presente → si falta el
          video, no se rompe nada. */}
      <ResponsiveImage
        src={HERO_IMAGE}
        alt="Vestido de la nueva colección Victoria Modas"
        className="absolute inset-0 h-full w-full object-cover object-top"
        loading="eager"
        fetchPriority="high"
        width={1600}
        height={2000}
      />

      {/* Video de fondo, opcional y diferido. Si /videos/hero.mp4 no existe,
          onError lo retira y queda la imagen. */}
      {videoLayer && (
        <video
          className="absolute inset-0 h-full w-full object-cover object-top"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_IMAGE}
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      )}

      {/* Velo ink para legibilidad del texto (más denso abajo). */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/30 to-ink/25" />
      {/* Velo cream muy sutil arriba: mantiene legible el header transparente
          (texto oscuro) cuando aún no hay scroll. */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cream/70 to-transparent" />

      {/* Contenido — entrada secuenciada (titular → subtítulo → CTA). */}
      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-4xl flex-col items-center justify-center px-6 py-28 text-center">
        <p className="hero-line mb-6 text-[11px] uppercase tracking-luxe text-cream/85" style={{ animationDelay: '0.05s' }}>
          Nueva colección · 2026
        </p>
        <h1
          className="hero-line mb-8 font-serif text-6xl font-light leading-[1.02] tracking-[-0.01em] text-cream md:text-7xl lg:text-8xl"
          style={{ animationDelay: '0.18s' }}
        >
          Elegancia
          <span className="block italic text-clay-light">hecha para ti</span>
        </h1>
        <p
          className="hero-line mb-11 max-w-md text-base font-light leading-relaxed text-cream/80 md:text-lg"
          style={{ animationDelay: '0.32s' }}
        >
          Vestidos, blusas y pantalones en telas premium, pensados para la mujer
          que viste con intención.
        </p>
        <div className="hero-line" style={{ animationDelay: '0.46s' }}>
          <Link
            to="/vestidos"
            className="group inline-flex items-center justify-center rounded-full bg-ink px-10 py-4 text-xs uppercase tracking-[0.2em] text-cream shadow-soft ring-1 ring-cream/15 transition-colors duration-500 hover:bg-clay"
          >
            Explorar la colección
            <ChevronRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Indicador de scroll (bounce suave; se detiene con reduced-motion). */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-cream/70 lg:flex">
        <span className="text-[10px] uppercase tracking-luxe">Descubre</span>
        <ChevronDownIcon className="descubre-bounce h-4 w-4" />
      </div>
    </section>
  )
}

// Reveal al scroll (robusto: con fallback si IO no está/ no dispara).
// Delega en useInViewReveal para compartir la lógica con las cards.
function useScrollAnimation() {
  return useInViewReveal({ amount: 0.1 })
}

// ============= PRODUCTOS DESTACADOS =============
function FeaturedProducts() {
  const [ref, isVisible] = useScrollAnimation()
  const products = [
    {
      id: 'vestido-suplex-moderno',
      name: 'Vestido Suplex Moderno',
      image: '/imagenes/vestidos/vestido_suplex01/azul_adelante.png',
      badge: 'Nuevo',
      category: 'Vestidos'
    },
    {
      id: 'vestido-lame-elegante',
      name: 'Vestido Lame Elegante',
      image: '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png',
      badge: '-20%',
      category: 'Vestidos'
    },
    {
      id: 'blusa-seda-francesa',
      name: 'Blusa Seda Francesa',
      image: '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png',
      badge: '-28%',
      category: 'Blusas'
    },
    {
      id: 'vestido-rit-elegante',
      name: 'Vestido Rit Elegante',
      image: '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delante.png',
      badge: '-24%',
      category: 'Vestidos'
    }
  ]

  return (
    <section
      ref={ref}
      className="bg-white py-24 md:py-36"
      aria-labelledby="featured-title"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Encabezado editorial: título a la izquierda, enlace a la derecha */}
        <div
          className={`mb-16 flex flex-col gap-6 border-b border-ink/10 pb-8 transition-all duration-700 sm:flex-row sm:items-end sm:justify-between ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div>
            <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Destacados</p>
            <h2 id="featured-title" className="font-serif text-5xl font-light leading-[1.05] text-ink md:text-6xl">
              Los más deseados
            </h2>
          </div>
          <Link
            to="/vestidos"
            className="group inline-flex items-center gap-2 self-start text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-clay sm:self-auto sm:pb-2"
          >
            Ver todo
            <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid — cards más grandes y con más aire; cada ProductCard escalona su entrada */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= COLECCIONES — banners full-bleed =============
function Collections() {
  const [ref, isVisible] = useScrollAnimation()

  // `fabricImage` es opcional: si el dueño sube una foto de la tela en detalle
  // (p. ej. /imagenes/telas/lame-detalle.png), se usa en el inset; si no, el
  // inset muestra un acercamiento de la misma prenda. Nada se rompe si falta.
  const collections = [
    {
      id: 'vestidos-elegantes',
      title: 'Vestidos elegantes',
      description: 'Lamé, rit y suplex de alta calidad, con caída impecable.',
      fabric: 'Tela lamé',
      image: '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png',
      fabricImage: null,
      link: '/vestidos',
      align: 'left',
    },
    {
      id: 'pantalones-modernos',
      title: 'Pantalones modernos',
      description: 'Comodidad y estructura en tela scuba, con un corte que estiliza.',
      fabric: 'Tela scuba',
      image: '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_negro_adelante.png',
      fabricImage: null,
      link: '/pantalones',
      align: 'right',
    },
  ]

  return (
    <section ref={ref} className="bg-cream">
      <div className="flex flex-col">
        {collections.map((c, idx) => {
          const textLeft = c.align === 'left'
          return (
            <Link
              key={c.id}
              to={c.link}
              className={`group relative block h-[72vh] min-h-[460px] w-full overflow-hidden bg-cream-dark transition-all duration-700 ease-out ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${idx * 140}ms` }}
            >
              <ResponsiveImage
                src={c.image}
                alt={c.title}
                className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay elegante hacia el lado del texto */}
              <div
                className={`absolute inset-0 ${textLeft ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-ink/75 via-ink/30 to-transparent`}
              />

              {/* Detalle de la tela en grande (inset, lado opuesto al texto) */}
              <figure
                className={`absolute bottom-8 hidden md:block ${textLeft ? 'right-10' : 'left-10'}`}
              >
                <div className="h-52 w-40 overflow-hidden rounded-lg border border-cream/30 shadow-soft">
                  <ResponsiveImage
                    src={c.fabricImage || c.image}
                    alt=""
                    aria-hidden="true"
                    className={`h-full w-full object-cover ${c.fabricImage ? 'object-center' : 'scale-[2.4] object-[50%_38%]'}`}
                    loading="lazy"
                  />
                </div>
                <figcaption className="mt-2 text-center text-[10px] uppercase tracking-luxe text-cream/80">
                  {c.fabric}
                </figcaption>
              </figure>

              {/* Contenido */}
              <div
                className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 ${
                  textLeft ? 'items-start text-left' : 'items-end text-right'
                }`}
              >
                <div className="max-w-md">
                  <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay-light">Colección</p>
                  <h3 className="mb-4 font-serif text-4xl font-light leading-[1.05] text-cream md:text-6xl">
                    {c.title}
                  </h3>
                  <p className="mb-6 font-light leading-relaxed text-cream/80">{c.description}</p>
                  <span className="inline-flex items-center gap-2 border-b border-cream/40 pb-1 text-xs uppercase tracking-[0.2em] text-cream transition-all duration-500 group-hover:gap-3 group-hover:border-cream">
                    Explorar la colección
                    <ChevronRightIcon className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

// ============= CATEGORÍAS =============
function CategoryShowcase() {
  const [ref, isVisible] = useScrollAnimation()

  const categories = [
    { name: 'Vestidos', img: '/imagenes/vestidos/vestido_lame01/negro_adelante.png', link: '/vestidos' },
    { name: 'Blusas', img: '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png', link: '/blusas' },
    { name: 'Pantalones', img: '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_negro.png', link: '/pantalones' },
  ]

  return (
    <section
      ref={ref}
      className="bg-white py-20 md:py-28"
      aria-labelledby="category-title"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-14">
          <p className={`text-[11px] uppercase tracking-luxe text-clay mb-4 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Colecciones
          </p>
          <h2
            id="category-title"
            className={`font-serif font-light text-ink text-4xl md:text-5xl transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Encuentra tu estilo
          </h2>
        </div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={cat.name}
              to={cat.link}
              className={`group relative aspect-[3/4] overflow-hidden rounded-lg bg-cream-dark transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${idx * 100 + 100}ms` }}
            >
              <ResponsiveImage
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay degradado sutil, se intensifica al hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent group-hover:from-ink/65 transition-colors duration-500" />

              {/* Nombre de la categoría */}
              <div className="absolute inset-x-0 bottom-0 pb-8 text-center">
                <h3 className="font-serif font-light text-cream text-2xl md:text-3xl tracking-wide">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= PRODUCTO SPOTLIGHT =============
function ProductSpotlight() {
  const [ref, isVisible] = useScrollAnimation()
  
  return (
    <section ref={ref} className="bg-cream py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Imagen */}
          <div className={`transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="group relative aspect-[3/4] max-w-md mx-auto lg:max-w-none overflow-hidden rounded-lg bg-cream-dark">
              <ResponsiveImage
                src="/imagenes/vestidos/vestido_suplex01/azul_adelante.png"
                alt="Vestido Suplex Moderno"
                className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105"
                loading="lazy"
              />
              {/* Badge discreto */}
              <span className="absolute top-3 left-3 px-3 py-1 bg-cream/90 backdrop-blur-sm text-clay-dark text-[10px] uppercase tracking-luxe font-medium rounded-full">
                -24%
              </span>
            </div>
          </div>

          {/* Contenido */}
          <div className={`transition-all duration-700 ease-out delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-[11px] uppercase tracking-luxe text-clay mb-6">
              Producto destacado
            </p>

            <h2 className="font-serif font-light text-ink leading-[1.1] text-4xl md:text-5xl mb-8">
              Vestido Suplex
              <span className="block italic text-clay">Moderno</span>
            </h2>

            <p className="text-ink-soft mb-10 leading-relaxed font-light">
              Vestido moderno confeccionado en suplex de alta calidad. Ajuste perfecto al cuerpo
              con diseño versátil y elegante. Ideal para cualquier ocasión, desde eventos casuales
              hasta reuniones formales.
            </p>

            {/* Detalles */}
            <ul className="space-y-4 mb-10">
              {[
                { label: 'Tela', value: 'Suplex de alta calidad' },
                { label: 'Corte', value: 'Ajuste perfecto y moderno' },
                { label: 'Tallas', value: 'S a L disponibles' }
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-clay mt-2.5"></div>
                  <div className="flex-1">
                    <span className="text-ink-muted text-[10px] uppercase tracking-luxe">{item.label}</span>
                    <p className="text-ink font-light">{item.value}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              to="/producto/vestido-suplex-moderno"
              className="group inline-flex items-center justify-center bg-ink text-cream px-9 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:bg-clay"
            >
              Ver detalles completos
              <ChevronRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============= SOCIAL FAVORITES =============
function SocialFavorites() {
  const [ref, isVisible] = useScrollAnimation()
  
  const favorites = [
    { id: 'vestido-suplex-moderno', name: 'Vestido Suplex Moderno', image: '/imagenes/vestidos/vestido_suplex01/negro_adelante.png', collection: 'Colección Suplex' },
    { id: 'vestido-lame-elegante', name: 'Vestido Lame Elegante', image: '/imagenes/vestidos/vestido_lame01/azul_adelante.png', collection: 'Elegancia Premium' },
    { id: 'pantalon-scuba-vena', name: 'Pantalón Scuba Vena', image: '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_vino_adelante.png', collection: 'Scuba Collection' },
  ]

  return (
    <section ref={ref} className="bg-white py-20 md:py-28" aria-labelledby="social-title">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-14">
          <p className={`text-[11px] uppercase tracking-luxe text-clay mb-4 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Comunidad
          </p>
          <h2
            id="social-title"
            className={`font-serif font-light text-ink text-4xl md:text-5xl mb-4 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Favoritos de Instagram
          </h2>
          <p className={`text-ink-soft font-light transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Las prendas que más aman nuestras clientas en redes sociales
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {favorites.map((item, idx) => (
            <Link
              key={item.id}
              to={`/producto/${item.id}`}
              className={`group relative aspect-[3/4] overflow-hidden rounded-lg bg-cream-dark transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${idx * 100 + 100}ms` }}
            >
              <ResponsiveImage
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay al hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Contenido al hover */}
              <div className="absolute inset-x-0 bottom-0 p-8 text-cream translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <h3 className="font-serif font-light text-xl mb-1">{item.collection}</h3>
                <p className="text-sm text-cream/80 mb-4 font-light">{item.name}</p>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] border-b border-cream/40 pb-1">
                  Ver más
                  <ChevronRightIcon className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className={`mt-14 text-center transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <a
            href="https://www.facebook.com/profile.php?id=61555283742078"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 border border-ink/20 text-ink px-9 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:border-ink hover:bg-ink/[0.03]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07C1.86 17.12 5.57 21.25 10.38 22v-7.01H7.9v-2.92h2.48V9.41c0-2.45 1.46-3.8 3.7-3.8 1.07 0 2.18.19 2.18.19v2.4h-1.23c-1.21 0-1.59.75-1.59 1.52v1.82h2.71l-.43 2.92h-2.28V22c4.81-.75 8.52-4.88 8.52-9.93z"/>
            </svg>
            Síguenos en Facebook
          </a>
        </div>
      </div>
    </section>
  )
}

// ============= HOMEPAGE PRINCIPAL =============
export default function HomePage() {
  useDocumentMeta({
    title: 'Victoria Modas — Moda femenina elegante | Lima, Perú',
    description: 'Moda femenina elegante desde Gamarra, Lima. Vestidos, blusas y pantalones en telas premium: scuba, suplex, lamé y seda francesa. Pedidos por WhatsApp.',
  })

  return (
    <>
      <AnnouncementBanner />
      <Header />
      <PageTransition id="main-content">
        <Hero />
        <FeaturedProducts />
        <Collections />
        <CategoryShowcase />
        <ProductSpotlight />
        <SocialFavorites />
      </PageTransition>
      <Footer />
    </>
  )
}
