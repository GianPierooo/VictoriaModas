import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { getProductById } from '../data/products.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

export default function FavoritesPage() {
  const { favorites } = useWishlist()
  useDocumentMeta({
    title: 'Tus favoritos | Victoria Modas',
    description: 'Las prendas que guardaste para volver a ellas cuando quieras.',
  })

  // Resolver ids → productos; descartar ids que ya no existan
  const products = favorites.map(getProductById).filter(Boolean)

  return (
    <Layout>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
          {/* Encabezado — entrada secuenciada */}
          <div className="mb-12">
            <p className="hero-line mb-3 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
              Tu selección
            </p>
            <h1 className="hero-line font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl" style={{ animationDelay: '0.14s' }}>
              Favoritos
            </h1>
          </div>

          {products.length === 0 ? (
            /* Vacío — invitación con dirección */
            <div className="mx-auto max-w-md py-24 text-center">
              <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Aún sin favoritos</p>
              <h2 className="mb-4 font-serif text-3xl font-light leading-[1.1] text-ink md:text-4xl">
                Guarda lo que te enamore
              </h2>
              <p className="mb-10 font-light leading-relaxed text-ink-soft">
                Toca el corazón en cualquier prenda para volver a ella cuando quieras.
              </p>
              <Link
                to="/vestidos"
                className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
              >
                Explorar la colección
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 md:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
