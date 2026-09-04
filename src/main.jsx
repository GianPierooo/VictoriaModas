import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import PageLoader from './components/PageLoader.jsx'
import RequireRole from './components/RequireRole.jsx'
import { initMetaPixel } from './lib/metaPixel.js'
import './index.css' // ← Solo Tailwind CSS

initMetaPixel()

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
// Ruta privada de mayoreo (no enlazada en Header/Footer/sitemap).
const MayoristasPage = lazy(() => import('./pages/MayoristasPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

// Panel admin — un solo panel para todo (productos, stock, catálogo base,
// cupones = admin únicamente; ventas/clientes = admin o vendedor). Ver
// AdminLayout.jsx para el filtro de nav por rol.
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'))
const AdminProductsListPage = lazy(() => import('./pages/admin/AdminProductsListPage.jsx'))
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage.jsx'))
const AdminCatalogBasePage = lazy(() => import('./pages/admin/AdminCatalogBasePage.jsx'))
const AdminCuponesPage = lazy(() => import('./pages/admin/AdminCuponesPage.jsx'))
const AdminStockPage = lazy(() => import('./pages/admin/AdminStockPage.jsx'))
const AdminVentasListPage = lazy(() => import('./pages/admin/AdminVentasListPage.jsx'))
const AdminVentaFormPage = lazy(() => import('./pages/admin/AdminVentaFormPage.jsx'))
const AdminClientesPage = lazy(() => import('./pages/admin/AdminClientesPage.jsx'))

// Envuelve un elemento de página en Suspense para mostrar el loader durante la descarga.
const withSuspense = (element) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
)

// Índice de /admin: a dónde aterriza cada rol al entrar sin sub-ruta.
// Admin ve "Productos" primero; vendedor (sin acceso a productos) va
// directo a "Ventas". Se ejecuta ya dentro de RequireRole, así que el
// perfil ya está cargado.
// eslint-disable-next-line react-refresh/only-export-components
function AdminIndexRedirect() {
  const { profile } = useAuth()
  return <Navigate to={profile?.rol === 'vendedor' ? 'ventas' : 'productos'} replace />
}

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
  { path: '/mayoristas', element: withSuspense(<MayoristasPage />) },
  {
    // Un solo panel para admin y vendedor (antes /panel-ventas era aparte —
    // fusionado por feedback: "el admin debe tener todo"). Cada ruta hija
    // que es exclusiva de admin se re-envuelve en su propio RequireRole;
    // las compartidas (ventas/clientes) quedan cubiertas por el de aquí.
    path: '/admin',
    element: withSuspense(
      <RequireRole allow={['admin', 'vendedor']}>
        <AdminLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <AdminIndexRedirect /> },
      {
        path: 'productos',
        element: withSuspense(<RequireRole allow={['admin']}><AdminProductsListPage /></RequireRole>),
      },
      {
        path: 'productos/nuevo',
        element: withSuspense(<RequireRole allow={['admin']}><AdminProductFormPage /></RequireRole>),
      },
      {
        path: 'productos/:id',
        element: withSuspense(<RequireRole allow={['admin']}><AdminProductFormPage /></RequireRole>),
      },
      {
        path: 'stock',
        element: withSuspense(<RequireRole allow={['admin']}><AdminStockPage /></RequireRole>),
      },
      {
        path: 'catalogo-base',
        element: withSuspense(<RequireRole allow={['admin']}><AdminCatalogBasePage /></RequireRole>),
      },
      {
        path: 'cupones',
        element: withSuspense(<RequireRole allow={['admin']}><AdminCuponesPage /></RequireRole>),
      },
      { path: 'ventas', element: withSuspense(<AdminVentasListPage />) },
      { path: 'ventas/nueva', element: withSuspense(<AdminVentaFormPage />) },
      { path: 'clientes', element: withSuspense(<AdminClientesPage />) },
    ],
  },
  // 404 coherente con el sistema (cualquier ruta no registrada)
  { path: '*', element: withSuspense(<NotFoundPage />) },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <RouterProvider router={router} />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)
