// ============================================================
// FreeShippingBar — barra de progreso hacia el envío gratis
// ------------------------------------------------------------
// Reactiva al total real del carrito (no un texto fijo). Se usa en
// CartDrawer y CartPage. Estética propia (clay/cream/ink) — sin colores
// saturados, glow ni rebotes, ver CLAUDE.md. Microinteracciones:
//  - El monto restante se anima al cambiar (useAnimatedNumber), en vez de
//    saltar de golpe.
//  - Un brillo sutil ("sheen") recorre el relleno mientras no se
//    desbloquea, para que se sienta viva sin ser ruidosa.
//  - Al desbloquear, el ícono cambia de camión a check con una aparición
//    suave (escala controlada, sin rebote).
// Respeta prefers-reduced-motion: sin el sheen ni el conteo animado.
// ============================================================
import { TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { formatPEN, FREE_SHIPPING_THRESHOLD } from '../utils/price.js'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber.js'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'

export default function FreeShippingBar({ total, allPriced }) {
  const reducedMotion = usePrefersReducedMotion()

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total)
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)
  const unlocked = remaining === 0

  // Los hooks deben llamarse siempre en el mismo orden — el `return null`
  // por !allPriced va DESPUÉS de declararlos, nunca antes.
  const remainingAnimado = useAnimatedNumber(remaining, { duration: reducedMotion ? 0 : 450 })
  const progressAnimado = useAnimatedNumber(progress, { duration: reducedMotion ? 0 : 450 })

  // Con líneas "a consultar" el total no es confiable — no mostrar la barra.
  if (!allPriced) return null

  return (
    <div className="rounded-lg bg-cream px-4 py-3.5">
      <p className="mb-2 flex items-center justify-center gap-1.5 text-center text-[11px] font-light leading-relaxed text-ink-soft">
        <span className="relative inline-block h-3.5 w-3.5 flex-shrink-0">
          <TruckIcon
            className={`absolute inset-0 h-3.5 w-3.5 text-clay transition-opacity duration-300 ${unlocked ? 'opacity-0' : 'opacity-100'}`}
          />
          <CheckCircleIcon
            className={`absolute inset-0 h-3.5 w-3.5 text-clay ${unlocked ? 'opacity-100' : 'opacity-0'} ${unlocked && !reducedMotion ? 'animate-check-in' : ''}`}
          />
        </span>
        {unlocked ? (
          <span className="text-clay">¡Envío gratis desbloqueado!</span>
        ) : (
          <span>
            Te faltan <span className="font-normal text-clay">{formatPEN(remainingAnimado)}</span> para envío gratis
          </span>
        )}
      </p>
      <div className="h-1 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="relative h-full overflow-hidden rounded-full bg-clay transition-[width] duration-500 ease-out"
          style={{ width: `${progressAnimado}%` }}
        >
          {!unlocked && !reducedMotion && (
            <span
              className="animate-progress-sheen absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </div>
  )
}
