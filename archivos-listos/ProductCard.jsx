import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const { id, name, image, badge, category } = product

  return (
    <article className="group">
      <Link to={`/producto/${id}`} className="block">
        {/* Imagen */}
        <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark rounded-lg">
          {/* Badge discreto */}
          {badge && (
            <span className="absolute top-3 left-3 z-10 px-3 py-1 bg-cream/90 backdrop-blur-sm text-ink text-[10px] uppercase tracking-luxe font-medium rounded-full">
              {badge}
            </span>
          )}

          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Velo cálido sutil al hover */}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/5 transition-colors duration-500" />

          {/* CTA que aparece al hover */}
          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <span className="block w-full text-center bg-cream/95 backdrop-blur-sm text-ink text-xs uppercase tracking-[0.2em] py-3 rounded-md font-medium">
              Ver detalle
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="pt-4 text-center">
          {category && (
            <p className="text-[10px] text-ink-muted uppercase tracking-luxe mb-1.5">
              {category}
            </p>
          )}
          <h3 className="font-serif text-lg text-ink font-light leading-snug group-hover:text-clay transition-colors duration-300">
            {name}
          </h3>
        </div>
      </Link>
    </article>
  )
}
