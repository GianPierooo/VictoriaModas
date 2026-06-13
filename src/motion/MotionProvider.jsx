import { LazyMotion, MotionConfig } from 'framer-motion'
import { devMotionForced } from './reducedMotion.js'

// Carga diferida de features (no infla el bundle inicial).
const loadFeatures = () => import('./features.js').then((mod) => mod.default)

/**
 * Provee framer-motion a toda la app:
 * - LazyMotion + `strict`: obliga a usar componentes `m.*` (más livianos que
 *   `motion.*`) y carga las features en un chunk async.
 * - MotionConfig reducedMotion="user": respeta prefers-reduced-motion del
 *   sistema (desactiva animaciones de transform; accesibilidad obligatoria).
 */
export default function MotionProvider({ children }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion={devMotionForced() ? 'never' : 'user'}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
