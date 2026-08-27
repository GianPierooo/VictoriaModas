import ProductsPage from '../components/ProductsPage'
import { useProducts } from '../hooks/useProducts.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

export default function VestidosPage() {
  const { getProductsByCategory } = useProducts()
  useDocumentMeta({
    title: 'Vestidos elegantes para mujer | Victoria Modas',
    description: 'Vestidos elegantes en telas premium —lamé, suplex y rit— para cada ocasión. Moda femenina hecha en Perú.',
  })

  return (
    <ProductsPage
      products={getProductsByCategory('vestidos')}
      title="VESTIDOS ELEGANTES"
    />
  )
}
