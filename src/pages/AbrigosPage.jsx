import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'

// NOTA: la categoría Abrigos aún no tiene productos con foto. Mientras tanto
// se muestra un estado "Próximamente". Cuando llegue el stock:
//   1) Añade los productos de abrigos en src/data/products.js (category: 'abrigos')
//   2) Reemplaza este archivo por el patrón de las otras categorías:
//        <ProductsPage products={getProductsByCategory('abrigos')} title="ABRIGOS Y CHAQUETAS" />
//   3) Reactiva el ítem "Abrigos" del menú en Header.jsx (ver nota allí)
export default function AbrigosPage() {
  const categorias = [
    { name: 'Vestidos', href: '/vestidos' },
    { name: 'Blusas', href: '/blusas' },
    { name: 'Pantalones', href: '/pantalones' },
  ]

  return (
    <Layout>
      <div className="bg-cream">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center lg:px-8">
          <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">
            Próximamente
          </p>
          <h1 className="mb-5 font-serif text-4xl font-light leading-tight text-ink md:text-5xl">
            Abrigos y chaquetas,
            <span className="block italic text-clay">muy pronto</span>
          </h1>
          <p className="mb-10 max-w-md font-light leading-relaxed text-ink-soft">
            Estamos preparando una selección de abrigos y chaquetas a la altura
            de la colección. Mientras tanto, descubre lo que ya tenemos para ti.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {categorias.map((cat) => (
              <Link
                key={cat.href}
                to={cat.href}
                className="inline-flex items-center justify-center rounded-full border border-ink/20 px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:border-ink hover:bg-ink/[0.03]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
