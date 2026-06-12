import ProductsPage from '../components/ProductsPage'
import { getProductsByCategory } from '../data/products.js'

export default function AbrigosPage() {
  return (
    <ProductsPage
      products={getProductsByCategory('abrigos')}
      title="ABRIGOS Y CHAQUETAS"
    />
  )
}
