import ProductsPage from '../components/ProductsPage'
import { getProductsByCategory } from '../data/products.js'

export default function PantalonesPage() {
  return (
    <ProductsPage
      products={getProductsByCategory('pantalones')}
      title="PANTALONES MODERNOS"
    />
  )
}
