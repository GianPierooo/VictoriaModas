import ProductsPage from '../components/ProductsPage'
import { getProductsByCategory } from '../data/products.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

export default function VestidosPage() {
  useDocumentMeta({
    title: 'Vestidos elegantes para mujer | Victoria Modas',
    description: 'Vestidos elegantes en telas premium —lamé, suplex y rit— para cada ocasión. Moda femenina desde Gamarra, Lima. Pide por WhatsApp.',
  })

  return (
    <ProductsPage
      products={getProductsByCategory('vestidos')}
      title="VESTIDOS ELEGANTES"
    />
  )
}
