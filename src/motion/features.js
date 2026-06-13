// Features de framer-motion cargadas de forma diferida por LazyMotion.
// domMax incluye gestos (drag para el swipe de la galería) + layout.
// Va en un chunk async aparte para no inflar el bundle inicial.
import { domMax } from 'framer-motion'
export default domMax
