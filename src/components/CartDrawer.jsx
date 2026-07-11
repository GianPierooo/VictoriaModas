// ============================================================
// CartDrawer — Mini-carrito lateral (drawer)
// ------------------------------------------------------------
// Ver y editar el carrito sin salir de la página. Controlado por CartContext
// (drawerOpen / openDrawer / closeDrawer). Headless UI Dialog aporta trampa de
// foco, Escape y overlay; las transiciones respetan prefers-reduced-motion
// (la capa de animación global neutraliza la duración).
//
// SEGMENTACIÓN: solo precio RETAIL (de /api/stock); nunca el de mayoreo.
// El pago se cierra por WhatsApp.
// ============================================================
import { Link } from 'react-router-dom'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon, ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline'
import ResponsiveImage from './ResponsiveImage.jsx'
import QuantitySelector from './QuantitySelector'
import { useCart } from '../context/CartContext.jsx'
import { useStock } from '../hooks/useStock.js'
import { formatPEN, cartTotal } from '../utils/price.js'
import { cartItemKey } from '../utils/cart.js'

export default function CartDrawer() {
  const { items, drawerOpen, closeDrawer, updateQuantity, removeItem } = useCart()
  const { getPrecio } = useStock()
  const priceOf = (it) => getPrecio(it.id, it.selectedColor, it.selectedSize)
  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0)
  const { total, allPriced } = cartTotal(items, priceOf)

  return (
    <Dialog open={drawerOpen} onClose={closeDrawer} className="relative z-[70]">
      {/* Overlay */}
      <DialogBackdrop className="fixed inset-0 bg-ink/30 backdrop-blur-sm" />

      {/* Panel derecho, anclado a la derecha (posición natural, en pantalla). */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-y-0 right-0 flex max-w-full">
          <DialogPanel className="flex h-full w-screen max-w-md flex-col bg-cream shadow-soft">

            {/* Encabezado */}
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <DialogTitle className="font-serif text-2xl font-light text-ink">
                Tu carrito
                {totalItems > 0 && <span className="ml-2 text-sm font-light text-ink-muted">({totalItems})</span>}
              </DialogTitle>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Cerrar carrito"
                className="rounded-md p-1.5 text-ink-muted transition-colors hover:text-ink"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

                {items.length === 0 ? (
                  /* Vacío — invitación */
                  <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                    <ShoppingBagIcon className="mb-5 h-12 w-12 text-ink/15" strokeWidth={1} />
                    <p className="mb-2 font-serif text-xl font-light text-ink">Tu carrito está vacío</p>
                    <p className="mb-8 text-sm font-light leading-relaxed text-ink-soft">
                      Descubre la colección y encuentra tu próxima favorita.
                    </p>
                    <Link
                      to="/vestidos"
                      onClick={closeDrawer}
                      className="rounded-full bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
                    >
                      Explorar la colección
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Líneas del carrito */}
                    <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
                      {items.map((item) => {
                        const key = cartItemKey(item)
                        const unit = priceOf(item)
                        return (
                          <li key={key} className="flex gap-4 py-5">
                            <Link
                              to={`/producto/${item.id}`}
                              onClick={closeDrawer}
                              className="aspect-[3/4] w-20 flex-shrink-0 overflow-hidden rounded-lg bg-cream-dark"
                            >
                              <ResponsiveImage
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover object-top"
                                loading="lazy"
                                width={120}
                                height={160}
                              />
                            </Link>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <Link
                                    to={`/producto/${item.id}`}
                                    onClick={closeDrawer}
                                    className="font-serif text-base font-light leading-snug text-ink transition-colors hover:text-clay"
                                  >
                                    {item.name}
                                  </Link>
                                  {(item.selectedColor || item.selectedSize) && (
                                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                                      {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeItem(key)}
                                  aria-label={`Quitar ${item.name}`}
                                  className="-mr-1 flex-shrink-0 rounded-md p-1 text-ink-muted transition-colors hover:text-clay"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                                <QuantitySelector
                                  quantity={item.quantity}
                                  onQuantityChange={(q) => updateQuantity(key, q)}
                                  min={1}
                                  max={10}
                                  showLabel={false}
                                />
                                <span className="text-sm font-light text-ink">
                                  {formatPEN(unit != null ? unit * item.quantity : null) || (
                                    <span className="text-ink-muted">A consultar</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>

                    {/* Pie */}
                    <div className="border-t border-ink/10 px-6 py-5">
                      <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
                        <span>Artículos</span>
                        <span>{totalItems}</span>
                      </div>
                      <div className="mb-4 flex items-baseline justify-between">
                        <span className="text-sm font-light text-ink-soft">Subtotal</span>
                        <span className="font-serif text-xl font-light text-ink">
                          {allPriced ? formatPEN(total) : <span className="text-base text-ink-muted">A consultar</span>}
                        </span>
                      </div>

                      {/* ── COSTURA DE PAGO (FUTURO) ──────────────────────────
                          Cuando se habilite un paso de pago (p. ej. Yape o una
                          pasarela), iría AQUÍ, antes de derivar a WhatsApp:
                          un botón/estado de pago que, tras confirmarse, continúe
                          al checkout. Hoy el modelo es 100% por WhatsApp, así que
                          no hay lógica de pago. NO implementar aquí. */}

                      <Link
                        to="/checkout"
                        onClick={closeDrawer}
                        className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-all duration-500 hover:bg-clay active:scale-[0.99]"
                      >
                        Finalizar pedido
                      </Link>
                      <Link
                        to="/carrito"
                        onClick={closeDrawer}
                        className="mt-3 block text-center text-[11px] uppercase tracking-[0.15em] text-ink-muted transition-colors hover:text-clay"
                      >
                        Ver carrito completo
                      </Link>
                      <p className="mt-4 text-center text-[11px] font-light text-ink-muted">
                        Coordinamos el pago y el envío por WhatsApp.
                      </p>
                    </div>
                  </>
                )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
