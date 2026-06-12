import ProductsPage from '../components/ProductsPage'
import { getProductsByCategory } from '../data/products.js'

export default function VestidosPage() {
  return (
    <ProductsPage
      products={getProductsByCategory('vestidos')}
      title="VESTIDOS ELEGANTES"
    />
  )
}
