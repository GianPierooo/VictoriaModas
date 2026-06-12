import ProductsPage from '../components/ProductsPage'
import { getProductsByCategory } from '../data/products.js'

export default function BlusasPage() {
  return (
    <ProductsPage
      products={getProductsByCategory('blusas')}
      title="BLUSAS VERSÁTILES"
    />
  )
}
