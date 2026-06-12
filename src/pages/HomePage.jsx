import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import AnnouncementBanner from '../components/AnnouncementBanner.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

// ============= HERO EDITORIAL =============
function Hero() {
  return (
    <section className="relative bg-cream overflow-hidden">
      {/* Acento radial cálido, muy sutil */}
      <div className="absolute -top-32 -right-32 w-[36rem] h-[36rem] bg-gradient-radial-rose rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-radial-rose rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center min-h-[88vh] py-20">
        {/* Columna texto */}
        <div className="order-2 lg:order-1 text-center lg:text-left animate-fadeInUp">
          <p className="text-[11px] uppercase tracking-luxe text-clay mb-6">
            Nueva colección · 2026
          </p>
          <h1 className="font-serif font-light text-ink leading-[1.05] text-5xl md:text-6xl lg:text-7xl mb-8">
            Elegancia
            <span className="block italic text-clay">hecha para ti</span>
          </h1>
          <p className="text-ink-soft text-base md:text-lg max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
            Vestidos, blusas y abrigos en telas premium. Piezas pensadas para
            la mujer que viste con intención.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              to="/vestidos"
              className="group inline-flex items-center justify-center bg-ink text-cream px-9 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:bg-clay"
            >
              Explorar colección
              <ChevronRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/nosotros"
              className="inline-flex items-center justify-center border border-ink/20 text-ink px-9 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:border-ink hover:bg-ink/[0.03]"
            >
              Nuestra historia
            </Link>
          </div>
        </div>

        {/* Columna imagen */}
        <div className="order-1 lg:order-2 animate-fadeIn">
          <div className="relative aspect-[4/5] max-w-md mx-auto rounded-[1.5rem] overflow-hidden bg-cream-dark shadow-rose-lg">
            <img
              src="/imagenes/vestidos/vestido_suplex01/azul_adelante.png"
              alt="Vestido de la nueva colección Victoria Modas"
              className="w-full h-full object-cover object-top"
            />
            {/* Marco interior elegante */}
            <div className="absolute inset-4 border border-cream/40 rounded-[1rem] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Indicador scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-ink-muted animate-pulse-soft">
        <span className="text-[10px] uppercase tracking-luxe">Descubre</span>
        <ChevronDownIcon className="w-4 h-4" />
      </div>
    </section>
  )
}

// ============= SCROLL ANIMATION HOOK =============
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return [ref, isVisible]
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
      className="bg-white py-20 md:py-28"
      aria-labelledby="featured-title"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-14">
          <p className={`text-[11px] uppercase tracking-luxe text-clay mb-4 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Destacados
          </p>
          <h2
            id="featured-title"
            className={`font-serif font-light text-ink text-4xl md:text-5xl mb-4 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Nuestros más vendidos
          </h2>
          <p className={`text-ink-soft font-light transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Las prendas que enamoran a nuestras clientas
          </p>
        </div>

        {/* Grid — la entrada escalonada la maneja cada ProductCard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 lg:gap-x-6">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>

        {/* CTA */}
        <div className={`mt-14 text-center transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Link
            to="/vestidos"
            className="group inline-flex items-center justify-center bg-ink text-cream px-9 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:bg-clay"
          >
            Ver colección completa
            <ChevronRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============= COLECCIONES VISUALES =============
function Collections() {
  const [ref, isVisible] = useScrollAnimation()
  
  const collections = [
    {
      id: 'vestidos-elegantes',
      title: 'Vestidos Elegantes',
      description: 'Lame, Rit y Suplex de alta calidad',
      image: '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png',
      link: '/vestidos'
    },
    {
      id: 'pantalones-modernos',
      title: 'Pantalones Modernos',
      description: 'Comodidad y estilo en tela scuba',
      image: '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_negro_adelante.png',
      link: '/pantalones'
    }
  ]

  return (
    <section ref={ref} className="bg-cream py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {collections.map((collection, idx) => (
            <Link
              key={collection.id}
              to={collection.link}
              className={`group relative h-[480px] md:h-[560px] overflow-hidden rounded-lg bg-cream-dark transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <img
                src={collection.image}
                alt={collection.title}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay degradado sutil, se intensifica al hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent group-hover:from-ink/70 transition-colors duration-500" />

              {/* Contenido */}
              <div className="absolute inset-0 flex flex-col items-start justify-end p-8 md:p-10">
                <h3 className="font-serif font-light text-cream text-3xl md:text-4xl mb-2">
                  {collection.title}
                </h3>
                <p className="text-cream/80 mb-5 font-light">
                  {collection.description}
                </p>
                <span className="inline-flex items-center gap-2 text-cream text-xs uppercase tracking-[0.2em] border-b border-cream/40 pb-1 transition-all duration-500 group-hover:gap-3 group-hover:border-cream">
                  Explorar colección
                  <ChevronRightIcon className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
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
              <img
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
              <img
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
              <img
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
      <main id="main-content">
        <Hero />
        <FeaturedProducts />
        <Collections />
        <CategoryShowcase />
        <ProductSpotlight />
        <SocialFavorites />
      </main>
      <Footer />
    </>
  )
}
