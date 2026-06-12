import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { COLOR_HEX } from '../utils/colorMap.js'
import { useWishlist } from '../context/WishlistContext.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'

const MAX_SWATCHES = 4

export default function ProductCard({ product, index = 0 }) {
  const { id, name, image, badge, category, colors, colorImages } = product

  const { isFavorite, toggleFavorite } = useWishlist()
  const fav = isFavorite(id)
  const [pop, setPop] = useState(false)

  const [activeColor, setActiveColor] = useState(null)
  const [inView, setInView] = useState(false)
  const rootRef = useRef(null)

  const handleToggleFavorite = (e) => {
    // El corazón vive dentro del <Link>: evitar navegar al togglear
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(id)
    setPop(true)
    setTimeout(() => setPop(false), 220)
  }

  // Imágenes vigentes: las del color activo, o las generales del producto
  const images = useMemo(() => {
    if (activeColor && colorImages?.[activeColor]?.length) return colorImages[activeColor]
    if (product.images?.length) return product.images
    return image ? [image] : []
  }, [activeColor, colorImages, product.images, image])

  const front = images[0]
  const back = images[1] || null

  // Capa inferior del crossfade al cambiar de color: conserva la imagen anterior
  // mientras la nueva aparece encima con fade
  const prevFrontRef = useRef(front)
  useEffect(() => {
    prevFrontRef.current = front
  }, [front])

  // Entrada al viewport (una sola vez); sin animación si el usuario
  // prefiere movimiento reducido
  useEffect(() => {
    const el = rootRef.current
    if (
      !el ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const swatchColors = colors && colorImages ? colors.slice(0, MAX_SWATCHES) : []
  const extraColors = colors && colorImages ? colors.length - swatchColors.length : 0
  const isOffer = badge && (badge.includes('%') || badge.toLowerCase().includes('oferta'))

  return (
    <article
      ref={rootRef}
      className={`group transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: inView ? `${(index % 4) * 90}ms` : '0ms' }}
    >
      <Link to={`/producto/${id}`} className="block">
        {/* Imagen */}
        <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark rounded-lg">
          {/* Badge discreto */}
          {badge && (
            <span
              className={`absolute top-3 left-3 z-10 px-3 py-1 bg-cream/90 backdrop-blur-sm text-[10px] uppercase tracking-luxe font-medium rounded-full ${
                isOffer ? 'text-clay-dark' : 'text-ink'
              }`}
            >
              {badge}
            </span>
          )}

          {/* Favorito */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={fav ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`}
            aria-pressed={fav}
            className="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-cream/80 backdrop-blur-sm transition-colors duration-300 hover:bg-cream"
          >
            {fav ? (
              <HeartIconSolid
                className={`h-5 w-5 text-clay transition-transform duration-200 ${pop ? 'scale-125' : 'scale-100'}`}
              />
            ) : (
              <HeartIcon className="h-5 w-5 text-ink-soft transition-transform duration-200 active:scale-90" />
            )}
          </button>

          {/* Capa base: imagen anterior (para el crossfade al cambiar de color) */}
          <ResponsiveImage
            src={prevFrontRef.current}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-top"
            loading="lazy"
            width={900}
            height={1200}
          />

          {/* Imagen frontal vigente: entra con fade sobre la anterior */}
          <ResponsiveImage
            key={front}
            src={front}
            alt={name}
            style={{ animation: 'fadeIn 0.5s ease-out both' }}
            className={`absolute inset-0 h-full w-full object-cover object-top ${
              back
                ? ''
                : 'transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]'
            }`}
            loading="lazy"
            width={900}
            height={1200}
          />

          {/* Segunda vista (espalda/lado): crossfade al hover */}
          {back && (
            <ResponsiveImage
              src={back}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
              loading="lazy"
              width={900}
              height={1200}
            />
          )}

          {/* Velo cálido sutil al hover */}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/5 transition-colors duration-500" />

          {/* CTA: siempre visible en móvil, sube con el hover en desktop */}
          <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-500 ease-out">
            <span className="block w-full text-center bg-cream/90 backdrop-blur-sm text-ink text-[11px] sm:text-xs uppercase tracking-[0.2em] py-3 rounded-md font-medium">
              Ver detalle
            </span>
          </div>
        </div>
      </Link>

      {/* Swatches de color (fuera del Link para no navegar al tocarlos) */}
      {swatchColors.length > 1 && (
        <div className="mt-2 flex items-center justify-center">
          {swatchColors.map((color) => (
            <button
              key={color}
              type="button"
              onMouseEnter={() => setActiveColor(color)}
              onFocus={() => setActiveColor(color)}
              onClick={() => setActiveColor(color)}
              className="relative flex h-10 w-10 items-center justify-center"
              title={color}
              aria-label={`Ver color ${color}`}
              aria-pressed={activeColor === color}
            >
              <span
                className={`block h-4 w-4 rounded-full border border-ink/15 transition-all duration-300 ${
                  activeColor === color
                    ? 'ring-1 ring-clay ring-offset-2 ring-offset-cream scale-110'
                    : ''
                }`}
                style={{ backgroundColor: COLOR_HEX[color] || '#CCCCCC' }}
              />
            </button>
          ))}
          {extraColors > 0 && (
            <span className="ml-1 text-[10px] text-ink-muted">+{extraColors}</span>
          )}
        </div>
      )}

      {/* Info */}
      <Link to={`/producto/${id}`} className="block">
        <div className={`${swatchColors.length > 1 ? 'pt-1' : 'pt-4'} text-center`}>
          {category && (
            <p className="text-[10px] text-ink-muted uppercase tracking-luxe mb-1.5">
              {category}
            </p>
          )}
          <h3 className="font-serif text-base sm:text-lg text-ink font-light leading-snug group-hover:text-clay transition-colors duration-300">
            {name}
          </h3>
        </div>
      </Link>
    </article>
  )
}
