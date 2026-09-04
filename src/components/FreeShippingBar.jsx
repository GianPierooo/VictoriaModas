// ============================================================
// FreeShippingBar — barra de progreso hacia el envío gratis
// ------------------------------------------------------------
// Reactiva al total real del carrito (no un texto fijo). Se usa en
// CartDrawer y CartPage. Estética propia (clay/cream/ink) — sin colores
// saturados ni animaciones tipo Shein/Temu, ver CLAUDE.md.
// ============================================================
import { TruckIcon } from '@heroicons/react/24/outline'
import { formatPEN, FREE_SHIPPING_THRESHOLD } from '../utils/price.js'

export default function FreeShippingBar({ total, allPriced }) {
  // Con líneas "a consultar" el total no es confiable — no mostrar la barra.
  if (!allPriced) return null

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total)
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)
  const unlocked = remaining === 0

  return (
    <div className="rounded-lg bg-cream px-4 py-3.5">
      <p className="mb-2 flex items-center justify-center gap-1.5 text-center text-[11px] font-light leading-relaxed text-ink-soft">
        <TruckIcon className="h-3.5 w-3.5 flex-shrink-0 text-clay" />
        {unlocked ? (
          <span className="text-clay">¡Envío gratis desbloqueado!</span>
        ) : (
          <span>
            Te faltan <span className="font-normal text-clay">{formatPEN(remaining)}</span> para envío gratis
          </span>
        )}
      </p>
      <div className="h-1 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-clay transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
