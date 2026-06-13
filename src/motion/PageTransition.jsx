import { useState } from 'react'
import { useLocation } from 'react-router-dom'

// Transición de entrada del contenido principal al navegar (fade + leve slide).
// Implementada en CSS (clase `page-enter`) por fiabilidad: no depende de las
// features async de framer y el reduced-motion global la desactiva sola.
// - Keyed por pathname → reanima incluso entre rutas del mismo tipo
//   (p. ej. producto → producto relacionado).
// - La PRIMERA carga no se anima (el hero hace su propia entrada) → sin flash.
let appHasMounted = false

export default function PageTransition({ children, className = '', as = 'main', ...rest }) {
  const { pathname } = useLocation()
  const [isFirstLoad] = useState(() => {
    const first = !appHasMounted
    appHasMounted = true
    return first
  })

  const Tag = as
  return (
    <Tag key={pathname} className={`${className} ${isFirstLoad ? '' : 'page-enter'}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}
