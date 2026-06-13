import { m } from 'framer-motion'
import { fadeUp, staggerContainer } from './variants.js'
import { useReducedMotionPref } from './reducedMotion.js'

// Reveal al entrar en viewport (una sola vez). Si el usuario prefiere
// movimiento reducido, se renderiza en su estado final sin animar.
export function Reveal({
  children,
  variants = fadeUp,
  className,
  as = 'div',
  amount = 0.2,
  delay,
  ...rest
}) {
  const reduce = useReducedMotionPref()
  const MComp = m[as] || m.div
  return (
    <MComp
      className={className}
      variants={variants}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount }}
      transition={delay != null ? { delay } : undefined}
      {...rest}
    >
      {children}
    </MComp>
  )
}

// Contenedor que escalona la entrada de sus hijos <StaggerItem>.
export function Stagger({
  children,
  className,
  as = 'div',
  stagger = 0.08,
  delayChildren = 0.04,
  amount = 0.15,
  ...rest
}) {
  const reduce = useReducedMotionPref()
  const MComp = m[as] || m.div
  return (
    <MComp
      className={className}
      variants={staggerContainer(stagger, delayChildren)}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount }}
      {...rest}
    >
      {children}
    </MComp>
  )
}

// Item hijo de <Stagger>. Hereda el estado de animación del contenedor.
export function StaggerItem({ children, variants = fadeUp, className, as = 'div', ...rest }) {
  const MComp = m[as] || m.div
  return (
    <MComp className={className} variants={variants} {...rest}>
      {children}
    </MComp>
  )
}
