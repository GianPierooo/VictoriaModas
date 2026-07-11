import ProductsPage from '../components/ProductsPage'
import { getProductsByCategory } from '../data/products.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

export default function PantalonesPage() {
  useDocumentMeta({
    title: 'Pantalones para mujer | Victoria Modas',
    description: 'Pantalones para mujer en tela scuba con caída y comodidad. Diseños modernos, moda femenina hecha en Perú.',
  })

  return (
    <ProductsPage
      products={getProductsByCategory('pantalones')}
      title="PANTALONES MODERNOS"
    />
  )
}
