import { useInViewReveal } from './useInViewReveal.js'

// Reveal al entrar en viewport (fade + slide-up). Basado en CSS para máxima
// fiabilidad: el hook (IO + fallback) alterna la clase `.reveal-in`. Las clases
// `.reveal` / `.reveal-in` viven en index.css y respetan prefers-reduced-motion.
//
// Para escalonar varios (grids/listas), pasa `delay` incremental a cada item.
export function Reveal({ children, className = '', as: Tag = 'div', amount = 0.2, delay = 0, style, ...rest }) {
  const [ref, inView] = useInViewReveal({ amount })
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'reveal-in' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}s`, ...style } : style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
