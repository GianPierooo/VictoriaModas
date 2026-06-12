import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  MapPinIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Abrigos oculto hasta tener stock (ver nota en Header.jsx para reactivar)
  const categories = [
    { name: 'Vestidos', href: '/vestidos' },
    { name: 'Pantalones', href: '/pantalones' },
    { name: 'Blusas', href: '/blusas' },
  ]

  const support = [
    { name: 'Seguimiento de pedido', href: '#' },
    { name: 'Políticas de envío', href: '#' },
    { name: 'Términos y condiciones', href: '#' },
    { name: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
    { name: 'Contáctanos', href: '/contacto' },
  ]

  const about = [
    { name: 'Nuestras tiendas', href: '#' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Política de datos', href: '#' },
    { name: 'Bases legales', href: '#' },
  ]

  return (
    <footer className="relative bg-gradient-to-br from-rose via-rose-50 to-rose-100 overflow-hidden border-t-4 border-rose-dark">
      {/* Decorative animated elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial-rose opacity-40 pointer-events-none animate-pulse-soft"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial-rose opacity-30 pointer-events-none animate-float"></div>
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-radial-rose opacity-20 pointer-events-none animate-pulse-soft"></div>
      
      <div className={`w-full px-8 py-20 lg:px-20 lg:py-24 relative z-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* Grid principal */}
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="transform transition-all duration-700 hover:translate-y-[-8px]">
            <div className="flex items-center gap-3 mb-6">
              {/* Isotipo: claro → normal → solo texto (no se ve roto si faltan archivos) */}
              <img
                src="/logo/isotipo-blanco.png"
                alt=""
                aria-hidden="true"
                className="h-10 w-auto"
                onError={(e) => {
                  const img = e.currentTarget
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = '1'
                    img.src = '/logo/isotipo.png'
                  } else {
                    img.style.display = 'none'
                  }
                }}
              />
              <h3 className="text-3xl font-serif font-bold tracking-tight text-gray-900">
                Victoria<span className="text-rose-dark">Modas</span>
              </h3>
            </div>
            <p className="text-gray-700 text-base mb-8 leading-relaxed font-light italic">
              Elegancia, modernidad y versatilidad para la mujer de hoy.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4 mb-8">
              <a 
                href="https://www.facebook.com/profile.php?id=61555283742078" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-full bg-white border-2 border-rose hover:border-rose-dark text-rose hover:bg-rose hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-rose-lg hover:rotate-12"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://wa.me/51993357672" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-full bg-white border-2 border-green-400 hover:border-green-600 text-green-600 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:rotate-12"
                aria-label="WhatsApp"
              >
                <svg className="w-7 h-7 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4 text-sm text-gray-700">
              <p className="flex items-start gap-3 hover:text-gray-900 transition-all duration-300 hover:translate-x-2">
                <MapPinIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-rose-dark" />
                <span className="font-medium">
                  Galería Naranja - Puesto 47-48<br />
                  Calle Misti con Huascarán
                </span>
              </p>
              <p className="flex items-center gap-3 hover:text-gray-900 transition-all duration-300 hover:translate-x-2">
                <EnvelopeIcon className="h-5 w-5 flex-shrink-0 text-rose-dark" />
                <a href="mailto:victoriamodas1053@gmail.com" className="hover:text-rose-dark transition-colors font-medium">
                  victoriamodas1053@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-3 hover:text-gray-900 transition-all duration-300 hover:translate-x-2">
                <ClockIcon className="h-5 w-5 flex-shrink-0 text-rose-dark" />
                <span className="font-medium">Lun-Sáb: 4:00 AM - 3:00 PM</span>
              </p>
              <p className="text-xs text-gray-600 italic font-semibold">✨ WhatsApp disponible 24/7</p>
            </div>

            {/* Libro de reclamaciones */}
            <button className="mt-8 flex items-center gap-3 text-xs font-bold text-gray-900 hover:text-white transition-all duration-300 bg-white/60 hover:bg-rose border-2 border-rose/50 hover:border-rose-dark rounded-xl px-5 py-3 hover:scale-105 hover:shadow-rose-lg">
              <span className="text-lg">📖</span>
              LIBRO DE RECLAMACIONES
            </button>
          </div>

          {/* Servicio al Cliente */}
          <div className="transform transition-all duration-700 hover:translate-y-[-8px]">
            <h4 className="text-base font-bold uppercase tracking-wider mb-6 text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose animate-pulse-soft"></span>
              Servicio al Cliente
            </h4>
            <div className="w-16 h-1 bg-gradient-to-r from-rose-dark via-rose to-transparent mb-6 rounded-full"></div>
            <ul className="space-y-4">
              {support.map((item, index) => (
                <li key={item.name} className="transform transition-all duration-300 hover:translate-x-3" style={{ transitionDelay: `${index * 50}ms` }}>
                  <Link 
                    to={item.href} 
                    className="text-sm text-gray-700 hover:text-rose-dark transition-all duration-300 inline-flex items-center gap-3 group font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose/60 group-hover:bg-rose-dark transition-all duration-300 group-hover:scale-150 group-hover:shadow-lg"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nosotros */}
          <div className="transform transition-all duration-700 hover:translate-y-[-8px]">
            <h4 className="text-base font-bold uppercase tracking-wider mb-6 text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose animate-pulse-soft"></span>
              Nosotros
            </h4>
            <div className="w-16 h-1 bg-gradient-to-r from-rose-dark via-rose to-transparent mb-6 rounded-full"></div>
            <ul className="space-y-4">
              {about.map((item, index) => (
                <li key={item.name} className="transform transition-all duration-300 hover:translate-x-3" style={{ transitionDelay: `${index * 50}ms` }}>
                  <Link 
                    to={item.href} 
                    className="text-sm text-gray-700 hover:text-rose-dark transition-all duration-300 inline-flex items-center gap-3 group font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose/60 group-hover:bg-rose-dark transition-all duration-300 group-hover:scale-150 group-hover:shadow-lg"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorías */}
          <div className="transform transition-all duration-700 hover:translate-y-[-8px]">
            <h4 className="text-base font-bold uppercase tracking-wider mb-6 text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose animate-pulse-soft"></span>
              Categorías
            </h4>
            <div className="w-16 h-1 bg-gradient-to-r from-rose-dark via-rose to-transparent mb-6 rounded-full"></div>
            <ul className="space-y-4">
              {categories.map((item, index) => (
                <li key={item.name} className="transform transition-all duration-300 hover:translate-x-3" style={{ transitionDelay: `${index * 50}ms` }}>
                  <Link 
                    to={item.href} 
                    className="text-sm text-gray-700 hover:text-rose-dark transition-all duration-300 inline-flex items-center gap-3 group font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose/60 group-hover:bg-rose-dark transition-all duration-300 group-hover:scale-150 group-hover:shadow-lg"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-10 border-t-2 border-rose-dark/30">
          <p className="text-center text-base text-gray-800 transition-all duration-300 hover:text-gray-900 font-medium">
            © {currentYear} <span className="text-rose-dark font-bold text-lg">VictoriaModas</span>. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/51993357672"
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-soft transition-transform duration-300 hover:scale-105"
        style={{ backgroundColor: '#25D366', animation: 'fadeIn 0.6s ease-out both' }}
        aria-label="Escríbenos por WhatsApp"
      >
        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        {/* Tooltip discreto (solo desktop) */}
        <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-full bg-ink px-4 py-2 text-xs font-light text-cream opacity-0 shadow-soft transition-opacity duration-300 group-hover:opacity-100 lg:block">
          ¿Tienes dudas? Escríbenos
        </span>
      </a>
    </footer>
  )
}
