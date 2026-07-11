import ProductsPage from '../components/ProductsPage'
import { getProductsByCategory } from '../data/products.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

export default function BlusasPage() {
  useDocumentMeta({
    title: 'Blusas femeninas | Victoria Modas',
    description: 'Blusas femeninas versátiles en seda francesa y telas premium. Elegancia para el día a día. Moda femenina hecha en Perú.',
  })

  return (
    <ProductsPage
      products={getProductsByCategory('blusas')}
      title="BLUSAS VERSÁTILES"
    />
  )
}
