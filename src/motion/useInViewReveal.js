import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Reveal robusto basado en IntersectionObserver, pensado para impulsar
// animaciones de framer (`animate={inView ? 'visible' : 'hidden'}`).
//
// Robustez clave: si IO no está disponible (navegadores muy viejos) se revela
// de inmediato; y SOLO en desarrollo, si IO no dispara en ~1.2s (p. ej. el
// navegador del preview, cuyo IO no funciona), se revela igual para poder
// verificar. En producción nunca se revela prematuramente: manda el scroll.
export function useInViewReveal({ amount = 0.15, once = true } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  // Lo que ya está en pantalla al cargar se muestra sin animación y antes del
  // primer pintado: esconderlo para luego hacerle fade retrasaba el contenido
  // principal (LCP) de páginas como /nosotros. El fade queda para lo que entra
  // con el scroll.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { top, bottom } = el.getBoundingClientRect()
    if (top < window.innerHeight && bottom > 0) {
      el.style.transition = 'none'
      setInView(true)
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold: amount, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)

    // Red de seguridad solo en dev (el IO del preview no dispara).
    let fallback
    if (import.meta.env.DEV) {
      fallback = setTimeout(() => setInView(true), 1200)
    }

    return () => {
      io.disconnect()
      if (fallback) clearTimeout(fallback)
    }
  }, [amount, once])

  return [ref, inView]
}
