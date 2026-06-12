import { Link } from 'react-router-dom'
import { HeartIcon } from '@heroicons/react/24/outline'
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
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          {/* Encabezado */}
          <div className="mb-10">
            <p className="mb-3 text-[11px] uppercase tracking-luxe text-clay">Tu selección</p>
            <h1 className="font-serif text-4xl font-light text-ink md:text-5xl">Favoritos</h1>
          </div>

          {products.length === 0 ? (
            /* Vacío */
            <div className="py-20 text-center">
              <HeartIcon className="mx-auto mb-6 h-16 w-16 text-ink/20" strokeWidth={1} />
              <h2 className="mb-3 font-serif text-2xl font-light text-ink md:text-3xl">
                Aún no has guardado favoritos
              </h2>
              <p className="mb-8 font-light text-ink-soft">
                Toca el corazón en cualquier prenda para guardarla aquí y volver a ella cuando quieras.
              </p>
              <Link
                to="/vestidos"
                className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
              >
                Explorar la colección
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
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
