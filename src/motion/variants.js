// Variants compartidas para reveals al scroll y entradas escalonadas.
import { EASE, DURATION } from './tokens.js'

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
}

export const fadeUpSmall = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.slow, ease: EASE } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: DURATION.slow, ease: EASE } },
}

// Contenedor que escalona la entrada de sus hijos (grids, listas).
export const staggerContainer = (stagger = 0.08, delayChildren = 0.04) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
})
