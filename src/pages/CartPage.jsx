import { Link } from 'react-router-dom'
import { XMarkIcon, ChevronLeftIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import QuantitySelector from '../components/QuantitySelector'
import ResponsiveImage from '../components/ResponsiveImage.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useStock } from '../hooks/useStock.js'
import { formatPEN, cartTotal } from '../utils/price.js'
import { cartItemKey } from '../utils/cart.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const { getPrecio } = useStock()
  const priceOf = (it) => getPrecio(it.id, it.selectedColor, it.selectedSize)
  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0)
  const { total, allPriced } = cartTotal(items, priceOf)
  useDocumentMeta({ title: 'Tu carrito | Victoria Modas' })

  return (
    <Layout>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
          {/* Encabezado — entrada secuenciada */}
          <div className="mb-12">
            <Link
              to="/vestidos"
              className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-clay"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Seguir comprando
            </Link>
            <p className="hero-line mb-3 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
              Tu selección
            </p>
            <h1 className="hero-line font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl" style={{ animationDelay: '0.14s' }}>
              Carrito
            </h1>
          </div>

          {items.length === 0 ? (
            /* Carrito vacío — invitación a comprar */
            <div className="mx-auto max-w-md py-24 text-center">
              <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Aún sin piezas</p>
              <h2 className="mb-4 font-serif text-3xl font-light leading-[1.1] text-ink md:text-4xl">
                Tu carrito está esperando
              </h2>
              <p className="mb-10 font-light leading-relaxed text-ink-soft">
                Descubre la colección y encuentra tu próxima favorita.
              </p>
              <Link
                to="/vestidos"
                className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
              >
                Explorar la colección
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
              {/* Lista de items */}
              <div className="lg:col-span-2">
                <ul className="border-t border-ink/10">
                  {items.map((item) => {
                    const key = cartItemKey(item)
                    const unit = priceOf(item)
                    return (
                      <li key={key} className="flex gap-5 border-b border-ink/10 py-7 md:gap-7 md:py-8">
                        {/* Foto editorial (3:4) */}
                        <Link
                          to={`/producto/${item.id}`}
                          className="group block aspect-[3/4] w-28 flex-shrink-0 overflow-hidden rounded-lg bg-cream-dark md:w-36"
                        >
                          <ResponsiveImage
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                            width={160}
                            height={213}
                          />
                        </Link>

                        {/* Info */}
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-serif text-lg font-light text-ink">
                                <Link to={`/producto/${item.id}`} className="transition-colors hover:text-clay">
                                  {item.name}
                                </Link>
                              </h3>
                              {(item.selectedColor || item.selectedSize) && (
                                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-muted">
                                  {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                            {/* Quitar */}
                            <button
                              type="button"
                              onClick={() => removeItem(key)}
                              className="-mr-2 -mt-2 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink"
                              aria-label={`Quitar ${item.name}`}
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Cantidad + precio de línea */}
                          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                            <QuantitySelector
                              quantity={item.quantity}
                              onQuantityChange={(q) => updateQuantity(key, q)}
                              min={1}
                              max={10}
                              showLabel={false}
                            />
                            <div className="text-right">
                              {unit != null ? (
                                <>
                                  <span className="text-base font-light text-ink">{formatPEN(unit * item.quantity)}</span>
                                  {item.quantity > 1 && (
                                    <span className="mt-0.5 block text-[11px] text-ink-muted">{formatPEN(unit)} c/u</span>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm text-ink-muted">Precio a consultar</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                {/* Vaciar carrito */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="inline-block py-2 text-xs uppercase tracking-[0.15em] text-ink-muted transition-colors hover:text-clay"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>

              {/* Resumen sticky */}
              <div className="lg:col-span-1">
                <div className="rounded-xl bg-cream p-7 lg:sticky lg:top-28 lg:p-8">
                  <h2 className="mb-6 font-serif text-2xl font-light text-ink">Resumen</h2>

                  <div className="space-y-3 border-b border-ink/10 pb-6 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-light text-ink-soft">Artículos</span>
                      <span className="text-ink">{totalItems}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="font-light text-ink-soft">Total</span>
                      <span className="font-serif text-2xl font-light text-ink">
                        {allPriced ? formatPEN(total) : <span className="text-lg text-ink-muted">A consultar</span>}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    className="mt-7 block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-all duration-500 hover:bg-clay active:scale-[0.99]"
                  >
                    Finalizar pedido
                  </Link>

                  <p className="mt-5 text-center text-xs font-light leading-relaxed text-ink-muted">
                    Coordinamos el pago y el envío por WhatsApp.
                  </p>

                  {/* Línea de confianza */}
                  <div className="mt-7 space-y-2.5 border-t border-ink/10 pt-6 text-[11px] font-light text-ink-muted">
                    <p className="flex items-center gap-2">
                      <TruckIcon className="h-4 w-4 flex-shrink-0 text-clay" />
                      Envío gratis desde S/ 200
                    </p>
                    <p className="flex items-center gap-2">
                      <ArrowPathIcon className="h-4 w-4 flex-shrink-0 text-clay" />
                      Cambios dentro de 7 días
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
