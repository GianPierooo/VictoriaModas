// Notificación al añadir al carrito — mismo lenguaje boutique del sitio
// (cream/ink/clay, serif, hairlines). Entra con un fade+slide discreto que
// respeta prefers-reduced-motion (las animaciones se neutralizan en CSS).
import { Link } from 'react-router-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import ResponsiveImage from './ResponsiveImage.jsx'
import { COLOR_HEX } from '../utils/colorMap.js'

export default function CartNotification({ isOpen, onClose, cartItems }) {
  if (!isOpen) return null

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div
      className="animate-fadeInRight fixed right-4 top-24 z-50 w-full max-w-sm overflow-hidden rounded-2xl bg-cream shadow-soft ring-1 ring-ink/10"
      role="status"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-clay" />
          <div>
            <p className="font-serif text-base font-light text-ink">Añadido al carrito</p>
            <p className="text-[10px] uppercase tracking-luxe text-ink-muted">
              {totalItems} pieza{totalItems !== 1 ? 's' : ''} en total
            </p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-md p-1.5 text-ink-muted transition-colors hover:text-ink"
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Items */}
      <div className="max-h-72 overflow-y-auto px-5 py-4">
        <ul className="divide-y divide-ink/5">
          {cartItems.map((item, index) => (
            <li key={`${item.id}-${index}`} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <div className="aspect-[3/4] w-12 flex-shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                <ResponsiveImage
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover object-top"
                  loading="lazy"
                  width={96}
                  height={128}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-serif text-sm font-light text-ink">{item.name}</h4>
                <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                  {item.selectedColor && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full border border-ink/15"
                        style={{ backgroundColor: COLOR_HEX[item.selectedColor] || '#CCCCCC' }}
                        aria-hidden="true"
                      />
                      {item.selectedColor}
                    </span>
                  )}
                  {item.selectedSize && <span>· {item.selectedSize}</span>}
                  <span>· ×{item.quantity}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-ink/10 px-5 py-4">
        <Link
          to="/carrito"
          onClick={onClose}
          className="block w-full rounded-full bg-ink py-3 text-center text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
        >
          Ver carrito
        </Link>
      </div>
    </div>
  )
}
