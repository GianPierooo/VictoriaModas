import { useEffect, useRef, useState } from 'react'

// Anima un número hacia su nuevo valor (ease-out, sin rebote) en vez de
// saltar de golpe — usado en FreeShippingBar para que "Te faltan S/X" se
// sienta vivo cuando cambia el carrito. Respeta prefers-reduced-motion
// (el llamador decide: si reduced=true, pásale duration=0).
export function useAnimatedNumber(target, { duration = 450 } = {}) {
  const [value, setValue] = useState(target)
  const frameRef = useRef(null)
  const fromRef = useRef(target)

  useEffect(() => {
    if (duration <= 0) {
      setValue(target)
      return
    }
    const from = fromRef.current
    const to = target
    if (from === to) return

    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      // ease-out cubic: rápido al inicio, se asienta suave (sin overshoot).
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(from + (to - from) * eased)
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      fromRef.current = to
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  return value
}
