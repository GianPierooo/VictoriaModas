import { Link } from 'react-router-dom'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'

export default function ProductCard({ product, showSizes = true }) {
  const { id, name, image, badge, category } = product
  
  return (
    <article className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_60px_rgba(247,202,201,0.4)] transition-all duration-500 hover:scale-105">
      {/* Badge circular */}
      {badge && (
        <span className={`absolute top-4 left-4 z-10 w-16 h-16 rounded-full flex items-center justify-center text-xs font-semibold shadow-lg ${
          badge === 'Nuevo' 
            ? 'bg-gradient-to-br from-green-400 to-green-500 text-white' 
            : 'bg-gradient-to-br from-rose to-rose-200 text-white'
        }`}>
          {badge}
        </span>
      )}

      {/* Image con círculo */}
      <Link 
        to={`/producto/${id}`} 
        className="block aspect-[3/4] overflow-hidden bg-rose-50/30 relative"
      >
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        {/* Overlay rosa sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </Link>

      {/* Info */}
      <div className="p-5">
        {/* Category */}
        {category && (
          <p className="text-xs text-rose-400 uppercase tracking-wide mb-2 font-light">
            {category}
          </p>
        )}
        
        {/* Name */}
        <h3 className="text-base font-semibold text-gray-900 mb-4 line-clamp-2 min-h-[3rem]">
          <Link 
            to={`/producto/${id}`} 
            className="hover:text-rose transition-colors"
          >
            {name}
          </Link>
        </h3>

        {/* Sizes - círculos */}
        {showSizes && (
          <div className="mb-4">
            <div className="flex items-center gap-2 justify-center">
              {['S', 'M', 'L'].map((size) => (
                <button
                  key={size}
                  className="w-12 h-12 rounded-full border-2 border-rose-200/50 hover:border-rose hover:bg-gradient-to-br hover:from-rose hover:to-rose-200 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(247,202,201,0.6)] font-semibold text-sm"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Link
          to={`/producto/${id}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose to-rose-200 text-white px-6 py-3 rounded-full text-sm font-medium hover:shadow-[0_0_30px_rgba(247,202,201,0.6)] hover:scale-105 transition-all duration-300 group/btn"
        >
          <ShoppingCartIcon className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
          Ver detalles
        </Link>
      </div>
    </article>
  )
}
