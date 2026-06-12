import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import './index.css' // ← Solo Tailwind CSS
import HomePage from './pages/HomePage.jsx'
import VestidosPage from './pages/VestidosPage.jsx'
import BlusasPage from './pages/BlusasPage.jsx'
import PantalonesPage from './pages/PantalonesPage.jsx'
import AbrigosPage from './pages/AbrigosPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import FAQPage from './pages/FAQPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import CartPage from './pages/CartPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/vestidos', element: <VestidosPage /> },
  { path: '/blusas', element: <BlusasPage /> },
  { path: '/pantalones', element: <PantalonesPage /> },
  { path: '/abrigos', element: <AbrigosPage /> },
  { path: '/nosotros', element: <AboutPage /> },
  { path: '/contacto', element: <ContactPage /> },
  { path: '/preguntas-frecuentes', element: <FAQPage /> },
  { path: '/producto/:id', element: <ProductPage /> },
  { path: '/carrito', element: <CartPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
  { path: '/favoritos', element: <FavoritesPage /> },
  { path: '/mi-cuenta', element: <AccountPage /> },
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
