// ============================================================
// CouponField — input para aplicar un cupón (carrito/checkout)
// ------------------------------------------------------------
// Reutilizable: usa el cupón guardado en CartContext (persiste entre
// CartDrawer, /carrito y /checkout). Muestra el código aplicado con su
// descuento, o el formulario para ingresar uno.
// ============================================================
import { useState } from 'react'
import { TagIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext.jsx'
import { calcularDescuento } from '../lib/cupones.js'
import { formatPEN } from '../utils/price.js'

export default function CouponField({ subtotal }) {
  const { coupon, couponLoading, applyCoupon, removeCoupon } = useCart()
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!codigo.trim()) return
    setError('')
    const result = await applyCoupon(codigo, subtotal)
    if (!result.ok) setError(result.motivo)
    else setCodigo('')
  }

  if (coupon) {
    const descuento = calcularDescuento(coupon, subtotal)
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-clay/10 px-4 py-3">
        <span className="flex items-center gap-2 text-sm text-clay">
          <TagIcon className="h-4 w-4 flex-shrink-0" />
          <span className="font-normal tracking-[0.04em]">{coupon.codigo}</span>
          <span className="text-ink-muted">
            — {coupon.tipo === 'envio_gratis' ? 'envío gratis' : `-${formatPEN(descuento)}`}
          </span>
        </span>
        <button
          type="button"
          onClick={removeCoupon}
          aria-label="Quitar cupón"
          className="flex-shrink-0 text-ink-muted transition-colors hover:text-ink"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value)
            if (error) setError('')
          }}
          placeholder="Código de cupón"
          className="min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm uppercase tracking-[0.04em] placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-muted/60 focus:border-clay focus:outline-none"
        />
        <button
          type="submit"
          disabled={couponLoading || !codigo.trim()}
          className="flex-shrink-0 rounded-full border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink disabled:opacity-40"
        >
          {couponLoading ? '...' : 'Aplicar'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  )
}
