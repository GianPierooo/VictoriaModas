import { Link } from 'react-router-dom'
import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import QuantitySelector from '../components/QuantitySelector'
import ResponsiveImage from '../components/ResponsiveImage.jsx'
import { useCart } from '../context/CartContext.jsx'
import { cartItemKey } from '../utils/cart.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0)
  useDocumentMeta({ title: 'Tu carrito | Victoria Modas' })

  return (
    <Layout>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          {/* Encabezado */}
          <div className="mb-10">
            <p className="mb-3 text-[11px] uppercase tracking-luxe text-clay">Tu selección</p>
            <h1 className="font-serif text-4xl font-light text-ink md:text-5xl">Carrito</h1>
          </div>

          {items.length === 0 ? (
            /* Carrito vacío */
            <div className="py-20 text-center">
              <ShoppingBagIcon className="mx-auto mb-6 h-16 w-16 text-ink/20" strokeWidth={1} />
              <h2 className="mb-3 font-serif text-2xl font-light text-ink md:text-3xl">
                Tu carrito está esperando
              </h2>
              <p className="mb-8 font-light text-ink-soft">
                Aún no has añadido piezas. Descubre la colección y encuentra tu próxima favorita.
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
                    return (
                      <li key={key} className="flex gap-4 border-b border-ink/10 py-6 md:gap-6">
                        {/* Foto */}
                        <Link
                          to={`/producto/${item.id}`}
                          className="block h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-cream-dark md:h-40 md:w-32"
                        >
                          <ResponsiveImage
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-top"
                            loading="lazy"
                            width={128}
                            height={160}
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

                          {/* Cantidad */}
                          <div className="mt-auto pt-4">
                            <QuantitySelector
                              quantity={item.quantity}
                              onQuantityChange={(q) => updateQuantity(key, q)}
                              min={1}
                              max={10}
                              showLabel={false}
                            />
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
                <div className="rounded-lg bg-cream p-6 lg:sticky lg:top-28">
                  <h2 className="mb-6 font-serif text-xl font-light text-ink">Resumen</h2>

                  <div className="mb-6 flex items-center justify-between border-b border-ink/10 pb-6 text-sm">
                    <span className="text-ink-soft">Artículos</span>
                    <span className="text-ink">{totalItems}</span>
                  </div>

                  <Link
                    to="/checkout"
                    className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
                  >
                    Finalizar pedido
                  </Link>

                  <p className="mt-5 text-center text-xs font-light leading-relaxed text-ink-muted">
                    Coordinaremos pago y envío contigo por WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
