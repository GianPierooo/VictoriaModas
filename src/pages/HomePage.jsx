import { useEffect, useRef, useState } from 'react'
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

// ── Assets del hero: rutas centralizadas en src/config/assets.js (el dueño
//    sube el archivo y encaja solo; si no existe, hay fallback y nada se rompe).
import { ASSETS } from '../config/assets.js'

const HERO_VIDEO_WEBM = ASSETS.heroVideoWebm
const HERO_VIDEO = ASSETS.heroVideoMp4
const HERO_IMAGE = ASSETS.heroImage

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
          <source src={HERO_VIDEO_WEBM} type="video/webm" />
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

  // `fabricImage` viene de src/config/assets.js: si el dueño sube la foto de
  // la tela en detalle, se usa en el inset; si es null, el inset muestra un
  // acercamiento de la misma prenda. Nada se rompe si falta.
  const collections = [
    {
      id: 'vestidos-elegantes',
      title: 'Vestidos elegantes',
      description: 'Lamé, rit y suplex de alta calidad, con caída impecable.',
      fabric: 'Tela lamé',
      image: '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png',
      fabricImage: ASSETS.fabricLame,
      link: '/vestidos',
      align: 'left',
    },
    {
      id: 'pantalones-modernos',
      title: 'Pantalones modernos',
      description: 'Comodidad y estructura en tela scuba, con un corte que estiliza.',
      fabric: 'Tela scuba',
      image: '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_negro_adelante.png',
      fabricImage: ASSETS.fabricScuba,
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
      className="bg-white py-24 md:py-36"
      aria-labelledby="category-title"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-16 text-center">
          <p className={`mb-4 text-[11px] uppercase tracking-luxe text-clay transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            Colecciones
          </p>
          <h2
            id="category-title"
            className={`font-serif text-5xl font-light text-ink transition-all delay-100 duration-700 md:text-6xl ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Compra por categoría
          </h2>
        </div>

        {/* Grid de categorías — imágenes más grandes y editoriales */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={cat.name}
              to={cat.link}
              className={`group relative aspect-[3/4] overflow-hidden rounded-lg bg-cream-dark transition-all duration-700 ease-out lg:aspect-[4/5] ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${idx * 120 + 100}ms` }}
            >
              <ResponsiveImage
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay degradado, se intensifica al hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent transition-colors duration-500 group-hover:from-ink/70" />

              {/* Nombre + reveal "Explorar" al hover */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-9 text-center">
                <h3 className="font-serif text-3xl font-light tracking-wide text-cream md:text-4xl">
                  {cat.name}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-cream/85 opacity-0 transition-all duration-500 group-hover:mt-3 group-hover:opacity-100">
                  Explorar
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= PRODUCTO SPOTLIGHT — banner full-bleed =============
function ProductSpotlight() {
  const [ref, isVisible] = useScrollAnimation()

  // Foto de la tela en detalle desde la config central (null → acercamiento
  // de la propia prenda).
  const SPOTLIGHT_IMAGE = '/imagenes/vestidos/vestido_suplex01/azul_adelante.png'
  const FABRIC_IMAGE = ASSETS.fabricSuplex

  const details = [
    { label: 'Tela', value: 'Suplex de alta calidad' },
    { label: 'Corte', value: 'Ajuste perfecto y moderno' },
    { label: 'Tallas', value: 'S a L disponibles' },
  ]

  return (
    <section ref={ref} className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-ink">
      <ResponsiveImage
        src={SPOTLIGHT_IMAGE}
        alt="Vestido Suplex Moderno"
        className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-[1400ms] ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
        }`}
        loading="lazy"
      />

      {/* Overlay elegante hacia el texto (izquierda) */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent" />

      {/* Detalle de la tela en grande (inset, lado derecho) */}
      <figure className="absolute bottom-10 right-10 hidden lg:block">
        <div className="h-56 w-44 overflow-hidden rounded-lg border border-cream/30 shadow-soft">
          <ResponsiveImage
            src={FABRIC_IMAGE || SPOTLIGHT_IMAGE}
            alt=""
            aria-hidden="true"
            className={`h-full w-full object-cover ${FABRIC_IMAGE ? 'object-center' : 'scale-[2.4] object-[50%_45%]'}`}
            loading="lazy"
          />
        </div>
        <figcaption className="mt-2 text-center text-[10px] uppercase tracking-luxe text-cream/80">
          Tela suplex
        </figcaption>
      </figure>

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 lg:px-8">
        <div
          className={`max-w-lg transition-all duration-700 ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <p className="mb-6 text-[11px] uppercase tracking-luxe text-clay-light">Producto destacado</p>
          <h2 className="mb-8 font-serif text-5xl font-light leading-[1.05] text-cream md:text-6xl lg:text-7xl">
            Vestido suplex
            <span className="block italic text-clay-light">moderno</span>
          </h2>
          <p className="mb-9 max-w-md font-light leading-relaxed text-cream/80">
            Confeccionado en suplex de alta calidad, con un ajuste perfecto y un diseño versátil.
            Para eventos casuales o reuniones formales.
          </p>

          <ul className="mb-10 space-y-4">
            {details.map((item) => (
              <li key={item.label} className="flex items-start gap-4">
                <div className="mt-2.5 h-1 w-1 rounded-full bg-clay-light" />
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-luxe text-cream/60">{item.label}</span>
                  <p className="font-light text-cream">{item.value}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/producto/vestido-suplex-moderno"
            className="group inline-flex items-center justify-center rounded-full bg-cream px-9 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:bg-clay hover:text-cream"
          >
            Ver detalles completos
            <ChevronRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============= SOCIAL FAVORITES — carrusel horizontal =============
function SocialFavorites() {
  const [ref, isVisible] = useScrollAnimation()
  const reduced = usePrefersReducedMotion()
  const scrollerRef = useRef(null)

  const favorites = [
    { id: 'vestido-suplex-moderno', name: 'Vestido suplex moderno', image: '/imagenes/vestidos/vestido_suplex01/negro_adelante.png', collection: 'Colección suplex' },
    { id: 'vestido-lame-elegante', name: 'Vestido lamé elegante', image: '/imagenes/vestidos/vestido_lame01/azul_adelante.png', collection: 'Elegancia premium' },
    { id: 'pantalon-scuba-vena', name: 'Pantalón scuba vena', image: '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_vino_adelante.png', collection: 'Colección scuba' },
    { id: 'blusa-seda-francesa', name: 'Blusa seda francesa', image: '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png', collection: 'Seda francesa' },
  ]

  const scrollByCards = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <section ref={ref} className="overflow-hidden bg-white py-24 md:py-36" aria-labelledby="social-title">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Encabezado con flechas (desktop) */}
        <div
          className={`mb-12 flex items-end justify-between gap-6 transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div>
            <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Comunidad</p>
            <h2 id="social-title" className="font-serif text-5xl font-light leading-[1.05] text-ink md:text-6xl">
              Favoritos de la comunidad
            </h2>
          </div>
          <div className="hidden shrink-0 gap-3 md:flex">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              aria-label="Ver anteriores"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:border-ink hover:bg-ink/[0.03]"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              aria-label="Ver siguientes"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:border-ink hover:bg-ink/[0.03]"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Carrusel deslizable (táctil en móvil, snap) */}
      <div
        ref={scrollerRef}
        role="region"
        aria-label="Favoritos de la comunidad"
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-4 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {favorites.map((item, idx) => (
          <Link
            key={item.id}
            to={`/producto/${item.id}`}
            className={`group relative aspect-[3/4] w-[78%] shrink-0 snap-start overflow-hidden rounded-lg bg-cream-dark transition-all duration-700 ease-out first:ml-0 sm:w-[46%] lg:w-[31%] ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: `${idx * 90 + 100}ms` }}
          >
            <ResponsiveImage
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              loading="lazy"
            />
            {/* Overlay permanente suave (legible también sin hover en móvil) */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-cream">
              <p className="mb-1 text-[10px] uppercase tracking-luxe text-cream/70">{item.collection}</p>
              <h3 className="mb-3 font-serif text-xl font-light">{item.name}</h3>
              <span className="inline-flex items-center gap-2 border-b border-cream/40 pb-1 text-[11px] uppercase tracking-[0.2em] transition-all duration-500 group-hover:gap-3 group-hover:border-cream">
                Ver más
                <ChevronRightIcon className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div
        className={`mx-auto mt-14 max-w-7xl px-6 text-center transition-all delay-200 duration-700 lg:px-8 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <a
          href="https://www.facebook.com/profile.php?id=61555283742078"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center justify-center gap-3 rounded-full border border-ink/20 px-9 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:border-ink hover:bg-ink/[0.03]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07C1.86 17.12 5.57 21.25 10.38 22v-7.01H7.9v-2.92h2.48V9.41c0-2.45 1.46-3.8 3.7-3.8 1.07 0 2.18.19 2.18.19v2.4h-1.23c-1.21 0-1.59.75-1.59 1.52v1.82h2.71l-.43 2.92h-2.28V22c4.81-.75 8.52-4.88 8.52-9.93z" />
          </svg>
          Síguenos en Facebook
        </a>
      </div>
    </section>
  )
}

// ============= HOMEPAGE PRINCIPAL =============
export default function HomePage() {
  useDocumentMeta({
    title: 'Victoria Modas — Moda femenina, hecha en Perú',
    description: 'Moda femenina premium en telas de calidad: scuba, suplex, lamé y seda francesa. Vestidos, blusas y pantalones diseñados y confeccionados en Perú.',
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
