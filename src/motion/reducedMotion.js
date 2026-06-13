import { useReducedMotion } from 'framer-motion'

// Override SOLO en desarrollo: con ?motion=on en la URL se ignora la
// preferencia del sistema para poder verificar las animaciones (el preview
// fuerza reduced-motion). En el build de producción `import.meta.env.DEV` es
// false, así que esta rama es código muerto y se elimina — la accesibilidad
// real (respetar prefers-reduced-motion) queda intacta.
export function devMotionForced() {
  return (
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('motion')
  )
}

// useReducedMotion respetando el override dev.
export function useReducedMotionPref() {
  const reduce = useReducedMotion()
  if (devMotionForced()) return false
  return reduce
}
