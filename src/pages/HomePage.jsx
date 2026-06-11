import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import AnnouncementBanner from '../components/AnnouncementBanner.jsx'
import ProductCard from '../components/ProductCard.jsx'

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
      className="relative py-20 md:py-28 lg:py-32 bg-gradient-to-b from-white via-rose-50/30 to-white overflow-hidden"
      aria-labelledby="featured-title"
    >
      {/* Elementos decorativos con círculos rosa animados */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-rose/20 rounded-full opacity-40 animate-breathe pointer-events-none"></div>
      <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-rose-200/30 rounded-full opacity-30 animate-float pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-rose-100/20 rounded-full opacity-20 animate-pulse-soft pointer-events-none"></div>
      
      {/* Círculos decorativos pequeños */}
      <div className="absolute top-40 left-1/4 w-3 h-3 rounded-full bg-rose-200/40 animate-float"></div>
      <div className="absolute bottom-40 right-1/3 w-2 h-2 rounded-full bg-rose/40 animate-breathe"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header mejorado con rosa */}
        <div className="text-center mb-16 md:mb-20">
          {/* Decoración superior con círculos */}
          <div className={`flex items-center justify-center gap-3 mb-6 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            <div className="w-16 h-px bg-rose/60"></div>
            <div className="w-3 h-3 rounded-full bg-rose animate-pulse"></div>
            <div className="w-16 h-px bg-rose/60"></div>
          </div>
          
          <h2 
            id="featured-title" 
            className={`text-5xl md:text-6xl lg:text-7xl font-serif font-light mb-6 tracking-tight transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="block text-rose-400 text-3xl md:text-4xl mb-2 font-light">Nuestros</span>
            <span className="relative inline-block">
              <span className="relative z-10 font-bold">Más Vendidos</span>
              <div className={`absolute bottom-0 left-0 h-3 bg-rose-200/40 w-full transition-all duration-1000 delay-500 ${
                isVisible ? 'w-full' : 'w-0'
              }`}></div>
            </span>
          </h2>
          
          <p 
            className={`text-lg md:text-xl text-gray-500 mb-6 font-light max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Las prendas que enamoran a nuestras clientas
          </p>
          
          {/* Círculo decorativo animado */}
          <div className={`w-2 h-2 rounded-full bg-rose mx-auto transition-all duration-1000 delay-400 animate-pulse ${
            isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}></div>
        </div>

        {/* Grid — la entrada escalonada la maneja cada ProductCard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 lg:gap-x-6">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>

        {/* CTA mejorado con rosa */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Link 
            to="/vestidos" 
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-rose to-rose-200 text-white px-12 py-4 rounded-full transition-all duration-500 hover:shadow-[0_0_30px_rgba(247,202,201,0.6)] hover:scale-105"
          >
            <span className="text-sm font-light uppercase tracking-wider">Ver colección completa</span>
            <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-2" />
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
    <section ref={ref} className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-white to-rose-50/30">
      {/* Círculos decorativos grandes */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-3xl animate-float opacity-40"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose/20 rounded-full blur-3xl animate-breathe opacity-30"></div>
      
      {/* Decoración superior circular */}
      <div className={`flex items-center justify-center gap-3 mb-16 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="w-24 h-px bg-rose/60"></div>
        <div className="w-4 h-4 rounded-full bg-rose animate-pulse"></div>
        <div className="w-24 h-px bg-rose/60"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {collections.map((collection, idx) => (
            <Link
              key={collection.id}
              to={collection.link}
              className={`group relative h-[500px] md:h-[600px] overflow-hidden rounded-3xl shadow-lg transition-all duration-1000 hover:shadow-[0_30px_80px_rgba(247,202,201,0.5)] ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${idx * 200}ms` }}
            >
              {/* Fondo con imagen */}
              <div className="absolute inset-0 bg-rose-50/30">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              
              {/* Overlay con gradiente rosa */}
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/70 via-rose-900/30 to-transparent transition-opacity duration-500 group-hover:from-rose-900/50"></div>
              
              {/* Círculos decorativos flotantes */}
              <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-rose-200/30 backdrop-blur-sm animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-20 left-10 w-16 h-16 rounded-full bg-rose/20 backdrop-blur-sm animate-breathe opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Borde animado circular */}
              <div className="absolute inset-0 rounded-3xl border-2 border-rose-200/0 group-hover:border-rose-200/60 transition-all duration-500 pointer-events-none shadow-[inset_0_0_40px_rgba(247,202,201,0)] group-hover:shadow-[inset_0_0_40px_rgba(247,202,201,0.3)]"></div>
              
              {/* Líneas decorativas circulares */}
              <div className="absolute top-6 left-6 w-0 h-0.5 bg-rose-200 rounded-full group-hover:w-20 transition-all duration-700 delay-100"></div>
              <div className="absolute top-6 right-6 w-3 h-3 rounded-full border-2 border-rose-200/0 group-hover:border-rose-200 transition-all duration-700 delay-300"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-start justify-end p-8 md:p-10">
                {/* Decoración con círculos */}
                <div className="flex items-center gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                  <div className="w-3 h-3 rounded-full bg-rose-200"></div>
                  <div className="w-2 h-2 rounded-full bg-rose-100"></div>
                  <div className="w-16 h-px bg-rose-200/60"></div>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-serif font-light text-white mb-3 transform transition-all duration-500 group-hover:translate-x-2">
                  {collection.title}
                </h3>
                
                <p className="text-rose-100 mb-6 font-light transform transition-all duration-500 delay-100 group-hover:translate-x-2">
                  {collection.description}
                </p>
                
                {/* Botón circular */}
                <div className="inline-flex items-center gap-3 text-white text-sm uppercase tracking-wider font-light transition-all duration-500 group-hover:gap-5">
                  Explorar colección
                  <div className="w-10 h-10 rounded-full border-2 border-rose-200/80 flex items-center justify-center transition-all duration-500 group-hover:bg-rose-200/30 group-hover:shadow-[0_0_20px_rgba(247,202,201,0.6)] group-hover:scale-110">
                    <ChevronRightIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl">
                <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-rose-200/0 via-rose-200/10 to-rose-200/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
    { name: 'Vestidos', img: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop', link: '/vestidos' },
    { name: 'Pantalones', img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop', link: '/pantalones' },
    { name: 'Conjuntos', img: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=800&auto=format&fit=crop', link: '/vestidos' },
    { name: 'Bodys', img: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=800&auto=format&fit=crop', link: '/vestidos' }
  ]

  return (
    <section 
      ref={ref}
      className="relative py-20 md:py-28 bg-gradient-to-b from-white via-rose-50/20 to-white overflow-hidden" 
      aria-labelledby="category-title"
    >
      {/* Círculos decorativos de fondo */}
      <div className="absolute top-1/4 left-10 w-[400px] h-[400px] bg-rose-200/20 rounded-full blur-3xl animate-float opacity-30"></div>
      <div className="absolute bottom-1/4 right-10 w-[350px] h-[350px] bg-rose/15 rounded-full blur-3xl animate-breathe opacity-25"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header minimalista */}
        <div className="text-center mb-16">
          {/* Mini decoración circular */}
          <div className={`inline-flex items-center gap-3 mb-6 transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}>
            <div className="w-3 h-3 rounded-full bg-rose-200 animate-pulse"></div>
            <div className="w-4 h-4 rounded-full bg-rose animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 rounded-full bg-rose-200 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          <h2 
            id="category-title" 
            className={`text-4xl md:text-5xl lg:text-6xl font-serif font-light text-gray-900 mb-4 transition-all duration-1000 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Explora por <span className="font-bold text-rose-400">categoría</span>
          </h2>
          
          <p className={`text-lg text-gray-500 font-light transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Encuentra el estilo perfecto para ti
          </p>
          
          {/* Círculo decorativo */}
          <div className={`w-2 h-2 rounded-full bg-rose mx-auto mt-6 transition-all duration-1000 delay-300 animate-pulse ${
            isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}></div>
        </div>

        {/* Grid con círculos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((cat, idx) => (
            <Link
              key={cat.name}
              to={cat.link}
              className={`group relative aspect-[3/4] overflow-hidden bg-rose-50/20 rounded-3xl shadow-md transition-all duration-700 hover:shadow-[0_20px_60px_rgba(247,202,201,0.4)] hover:scale-105 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${idx * 100 + 400}ms` }}
            >
              {/* Image */}
              <img
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              />
              
              {/* Overlay rosa */}
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/70 via-rose-900/20 to-transparent group-hover:from-rose-900/50 transition-all duration-500" />
              
              {/* Círculos decorativos flotantes */}
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-rose-200/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 animate-float"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 rounded-full bg-rose/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
              
              {/* Borde circular en hover */}
              <div className="absolute inset-0 rounded-3xl border-2 border-rose-200/0 group-hover:border-rose-200/60 transition-all duration-500 shadow-[inset_0_0_30px_rgba(247,202,201,0)] group-hover:shadow-[inset_0_0_30px_rgba(247,202,201,0.3)]"></div>
              
              {/* Content minimalista */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 text-white">
                {/* Círculos decorativos superiores */}
                <div className="flex gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="w-2 h-2 rounded-full bg-rose-200"></div>
                  <div className="w-2 h-2 rounded-full bg-rose-100"></div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-serif font-light mb-3 transform group-hover:translate-y-[-4px] transition-transform duration-500">
                  {cat.name}
                </h3>
                
                {/* Botón circular */}
                <div className="w-10 h-10 rounded-full border-2 border-rose-200/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 hover:bg-rose-200/30 hover:scale-110">
                  <ChevronRightIcon className="w-5 h-5" />
                </div>
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
    <section ref={ref} className="relative py-20 md:py-28 bg-gradient-to-b from-rose-50/30 to-white overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial-rose opacity-10 animate-breathe pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-px h-1/2 bg-gradient-to-b from-rose/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image con efectos */}
          <div className={`relative aspect-[3/4] bg-gray-50 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
          }`}>
            {/* Imagen principal */}
            <div className="relative h-full overflow-hidden group">
              <img
                src="/imagenes/vestidos/vestido_suplex01/azul_adelante.png"
                alt="Vestido Suplex Moderno"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay sutil */}
              <div className="absolute inset-0 bg-rose/0 group-hover:bg-rose/5 transition-colors duration-700"></div>
              
              {/* Marco decorativo */}
              <div className="absolute inset-0 border border-gray-200/0 group-hover:border-rose/30 transition-colors duration-700"></div>
            </div>
            
            {/* Decoración flotante */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white border border-rose/20 flex items-center justify-center animate-float">
              <div className="text-center">
                <div className="text-3xl font-serif font-bold text-gray-900">-24%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Descuento</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
          }`}>
            {/* Badge minimalista */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-rose"></div>
              <span className="text-rose text-xs uppercase tracking-[0.3em] font-light">
                Producto destacado
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-gray-900 mb-6 leading-tight">
              VESTIDO SUPLEX
              <span className="block font-bold mt-2">MODERNO</span>
            </h2>
            
            {/* Línea decorativa */}
            <div className="w-24 h-px bg-rose/40 mb-8"></div>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed font-light">
              Vestido moderno confeccionado en suplex de alta calidad. Ajuste perfecto al cuerpo 
              con diseño versátil y elegante. Ideal para cualquier ocasión, desde eventos casuales 
              hasta reuniones formales.
            </p>
            
            {/* Features minimalistas */}
            <ul className="space-y-4 mb-10">
              {[
                { label: 'Tela', value: 'Suplex de alta calidad' },
                { label: 'Corte', value: 'Ajuste perfecto y moderno' },
                { label: 'Tallas', value: 'S a L disponibles' }
              ].map((item, idx) => (
                <li 
                  key={item.label}
                  className="flex items-start gap-4 group"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-1 h-1 bg-rose mt-2.5 group-hover:scale-150 transition-transform"></div>
                  <div className="flex-1">
                    <span className="text-gray-400 text-sm uppercase tracking-wider">{item.label}</span>
                    <p className="text-gray-900 font-light">{item.value}</p>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* CTA */}
            <Link 
              to="/producto/vestido-suplex-moderno" 
              className="group inline-flex items-center gap-3 bg-gray-900 text-white px-12 py-4 transition-all duration-500 hover:bg-rose hover:tracking-widest"
            >
              <span className="text-sm uppercase tracking-wider font-light">Ver detalles completos</span>
              <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-2" />
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
    <section ref={ref} className="py-20 md:py-28 bg-gray-50" aria-labelledby="social-title">
      <div className="container mx-auto px-4">
        {/* Header minimalista */}
        <div className="text-center mb-16">
          {/* Decoración */}
          <div className={`inline-flex items-center gap-2 mb-6 transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}>
            <div className="w-2 h-2 rotate-45 border border-rose"></div>
            <div className="w-8 h-px bg-rose/40"></div>
            <div className="w-2 h-2 bg-rose"></div>
            <div className="w-8 h-px bg-rose/40"></div>
            <div className="w-2 h-2 rotate-45 border border-rose"></div>
          </div>
          
          <h2 
            id="social-title" 
            className={`text-4xl md:text-5xl lg:text-6xl font-serif font-light text-gray-900 mb-4 transition-all duration-1000 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Favoritos de <span className="font-bold">Instagram</span>
          </h2>
          
          <p className={`text-lg text-gray-500 font-light transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Las prendas que más aman nuestras clientas en redes sociales
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((item, idx) => (
            <Link
              key={item.id}
              to={`/producto/${item.id}`}
              className={`group relative aspect-[3/4] bg-gray-100 overflow-hidden transition-all duration-1000 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${idx * 150 + 300}ms` }}
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:blur-sm"
                loading="lazy"
              />
              
              {/* Overlay minimalista */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                {/* Línea decorativa */}
                <div className="w-12 h-px bg-white/60 mb-4"></div>
                
                <h3 className="text-xl font-serif font-light mb-2">{item.collection}</h3>
                <p className="text-sm text-white/80 mb-4">{item.name}</p>
                
                <span className="inline-flex items-center gap-2 text-sm uppercase tracking-wider border-b border-white/40 pb-1">
                  Ver más
                  <ChevronRightIcon className="w-4 h-4" />
                </span>
              </div>
              
              {/* Badge de Instagram */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-white text-xl">📸</span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA mejorado */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <a
            href="https://www.facebook.com/profile.php?id=61555283742078"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-4 transition-all duration-500 hover:bg-blue-700 hover:tracking-widest"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07C1.86 17.12 5.57 21.25 10.38 22v-7.01H7.9v-2.92h2.48V9.41c0-2.45 1.46-3.8 3.7-3.8 1.07 0 2.18.19 2.18.19v2.4h-1.23c-1.21 0-1.59.75-1.59 1.52v1.82h2.71l-.43 2.92h-2.28V22c4.81-.75 8.52-4.88 8.52-9.93z"/>
            </svg>
            <span className="text-sm uppercase tracking-wider font-light">Síguenos en Facebook</span>
          </a>
        </div>
      </div>
    </section>
  )
}

// ============= BLOG =============
function BlogNoticias() {
  const [ref, isVisible] = useScrollAnimation()
  
  const posts = [
    {
      title: 'Cómo combinar pantalones wide-leg en 2025',
      img: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'Guía rápida para estilizar pantalones wide-leg con siluetas limpias y tonos neutros.',
      date: '15 Mar 2025'
    },
    {
      title: 'Tendencias en tejidos: scuba y suplex',
      img: 'https://images.unsplash.com/photo-1520975433059-7415e1d2d6e2?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'Por qué estos materiales dominan el guardarropa moderno: ajuste, caída y confort.',
      date: '10 Mar 2025'
    },
    {
      title: 'Minimalismo elegante: claves del look VictoriaModas',
      img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'Cómo lograr un estilo refinado con cortes simples, paleta neutra y texturas premium.',
      date: '5 Mar 2025'
    }
  ]

  return (
    <section ref={ref} className="relative py-20 md:py-28 bg-white overflow-hidden" aria-labelledby="blog-title">
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-rose/10 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Mini decoración */}
          <div className={`inline-flex items-center gap-3 mb-6 transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}>
            <div className="w-16 h-px bg-rose/40"></div>
            <div className="w-2 h-2 bg-rose rotate-45"></div>
            <div className="w-16 h-px bg-rose/40"></div>
          </div>
          
          <h2 
            id="blog-title" 
            className={`text-4xl md:text-5xl lg:text-6xl font-serif font-light text-gray-900 mb-4 transition-all duration-1000 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Blog & <span className="font-bold">Novedades</span>
          </h2>
          
          <p className={`text-lg text-gray-500 font-light transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Consejos de moda, tendencias y guías de estilo
          </p>
          
          {/* Línea decorativa */}
          <div className={`w-px h-16 bg-gradient-to-b from-rose/60 to-transparent mx-auto mt-6 transition-all duration-1000 delay-300 ${
            isVisible ? 'h-16 opacity-100' : 'h-0 opacity-0'
          }`}></div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {posts.map((post, idx) => (
            <article 
              key={post.title}
              className={`group transition-all duration-1000 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${idx * 150 + 400}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-video bg-gray-100 mb-6 overflow-hidden">
                <img
                  src={post.img}
                  alt={post.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay minimalista */}
                <div className="absolute inset-0 bg-rose/0 group-hover:bg-rose/10 transition-colors duration-500"></div>
                
                {/* Borde */}
                <div className="absolute inset-0 border border-gray-200/0 group-hover:border-rose/30 transition-colors duration-500"></div>
              </div>

              {/* Content */}
              <time className="text-xs text-gray-400 uppercase tracking-wider font-light">{post.date}</time>
              
              <h3 className="text-xl md:text-2xl font-serif font-light text-gray-900 mt-3 mb-4 group-hover:text-rose transition-colors duration-500">
                {post.title}
              </h3>
              
              <p className="text-gray-600 mb-6 line-clamp-2 font-light leading-relaxed">
                {post.excerpt}
              </p>
              
              <Link
                to="/vestidos"
                className="inline-flex items-center gap-2 text-sm text-gray-900 uppercase tracking-wider font-light border-b border-gray-900/0 group-hover:border-gray-900 pb-1 transition-all duration-500 group-hover:gap-3"
              >
                Leer artículo
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============= HOMEPAGE PRINCIPAL =============
export default function HomePage() {
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
        <BlogNoticias />
      </main>
      <Footer />
    </>
  )
}
