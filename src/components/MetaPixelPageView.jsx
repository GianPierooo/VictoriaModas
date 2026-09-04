// ============================================================
// MetaPixelPageView — dispara PageView del píxel en cada navegación.
// ------------------------------------------------------------
// El script del píxel solo manda el primer PageView solo al cargar; en una
// SPA (react-router, sin recarga completa) hay que reforzarlo en cada
// cambio de ruta. Se monta igual que WelcomePopup: dentro de Layout.jsx
// (cubre casi todas las páginas) y en HomePage.jsx (la única que no usa
// Layout). No renderiza nada.
// ============================================================
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../lib/metaPixel.js'

export default function MetaPixelPageView() {
  const location = useLocation()
  useEffect(() => {
    trackPageView()
  }, [location.pathname])
  return null
}
