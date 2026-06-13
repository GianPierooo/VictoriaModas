import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import PageLoader from './components/PageLoader.jsx'
import './index.css' // ← Solo Tailwind CSS

// Code-splitting por ruta: cada página se descarga solo al visitarse.
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const VestidosPage = lazy(() => import('./pages/VestidosPage.jsx'))
const BlusasPage = lazy(() => import('./pages/BlusasPage.jsx'))
const PantalonesPage = lazy(() => import('./pages/PantalonesPage.jsx'))
const AbrigosPage = lazy(() => import('./pages/AbrigosPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const FAQPage = lazy(() => import('./pages/FAQPage.jsx'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'))
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'))
const CartPage = lazy(() => import('./pages/CartPage.jsx'))
const AccountPage = lazy(() => import('./pages/AccountPage.jsx'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'))

// Envuelve un elemento de página en Suspense para mostrar el loader durante la descarga.
const withSuspense = (element) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
)

const router = createBrowserRouter([
  { path: '/', element: withSuspense(<HomePage />) },
  { path: '/vestidos', element: withSuspense(<VestidosPage />) },
  { path: '/blusas', element: withSuspense(<BlusasPage />) },
  { path: '/pantalones', element: withSuspense(<PantalonesPage />) },
  { path: '/abrigos', element: withSuspense(<AbrigosPage />) },
  { path: '/nosotros', element: withSuspense(<AboutPage />) },
  { path: '/contacto', element: withSuspense(<ContactPage />) },
  { path: '/preguntas-frecuentes', element: withSuspense(<FAQPage />) },
  { path: '/producto/:id', element: withSuspense(<ProductPage />) },
  { path: '/carrito', element: withSuspense(<CartPage />) },
  { path: '/checkout', element: withSuspense(<CheckoutPage />) },
  { path: '/favoritos', element: withSuspense(<FavoritesPage />) },
  { path: '/mi-cuenta', element: withSuspense(<AccountPage />) },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <WishlistProvider>
        <RouterProvider router={router} />
      </WishlistProvider>
    </CartProvider>
  </StrictMode>,
)
