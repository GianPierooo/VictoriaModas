import { useEffect, useState } from 'react'

// ¿Coincide la ventana con la media query? (se actualiza al cambiar de tamaño)
export function useMediaQuery(query) {
  const [coincide, setCoincide] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const actualizar = () => setCoincide(mq.matches)
    actualizar()
    mq.addEventListener?.('change', actualizar)
    return () => mq.removeEventListener?.('change', actualizar)
  }, [query])
  return coincide
}
