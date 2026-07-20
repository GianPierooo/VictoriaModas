import { useEffect, useState } from 'react'

// ¿La clienta pidió menos movimiento en su sistema? Se respeta en videos de
// fondo y animaciones (con reduced-motion se muestran las imágenes fijas).
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])
  return reduced
}
