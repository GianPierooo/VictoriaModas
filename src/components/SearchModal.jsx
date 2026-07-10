import { useState, useEffect, useRef, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { searchProducts } from '../data/products.js'
import ResponsiveImage from './ResponsiveImage.jsx'

export default function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)

  // Focus en el input cuando se abre el modal
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Función de búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term)
    
    if (term.length < 2) {
      setSearchResults([])
      return
    }

    setIsLoading(true)

    // Simular delay de búsqueda
    setTimeout(() => {
      setSearchResults(searchProducts(term))
      setIsLoading(false)
    }, 300)
  }

  // Limpiar búsqueda al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      setSearchResults([])
    }
  }, [isOpen])

  const popularSearches = ['Blusas', 'Pantalones', 'Vestidos', 'Scuba', 'Seda', 'Lame', 'Suplex']

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-20">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-cream shadow-soft ring-1 ring-ink/10 transition-all">
                {/* Header */}
                <div className="border-b border-ink/10 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title className="font-serif text-2xl font-light text-ink">
                      Buscar
                    </Dialog.Title>
                    <div className="flex items-center gap-2">
                      <kbd className="rounded border border-ink/15 bg-cream-dark px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                        Esc
                      </kbd>
                      <button
                        onClick={onClose}
                        className="rounded-md p-1.5 text-ink-muted transition-colors hover:text-ink"
                        aria-label="Cerrar búsqueda"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Input hairline */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Vestidos, blusas, scuba, seda…"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full border-b border-ink/20 bg-transparent py-3 pl-9 pr-10 font-light text-ink placeholder:text-ink-muted/50 transition-colors focus:border-clay focus:outline-none"
                    />
                    {searchTerm && (
                      <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-ink-muted transition-colors hover:text-ink"
                        onClick={() => handleSearch('')}
                        aria-label="Limpiar búsqueda"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto p-6">
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="motion-safe:animate-pulse-soft text-sm font-light text-ink-muted">Buscando…</p>
                    </div>
                  )}

                  {!isLoading && searchTerm && searchResults.length === 0 && (
                    <div className="py-12 text-center">
                      <h3 className="mb-2 font-serif text-xl font-light text-ink">Nada por aquí</h3>
                      <p className="text-sm font-light text-ink-muted">Prueba con otra palabra: una tela, una prenda o una categoría.</p>
                    </div>
                  )}

                  {!isLoading && searchTerm && searchResults.length > 0 && (
                    <>
                      <p className="mb-4 text-[10px] uppercase tracking-luxe text-ink-muted">
                        {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                      </p>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            to={`/producto/${product.id}`}
                            className="group flex items-center gap-4 rounded-xl p-2.5 transition-colors hover:bg-cream-dark"
                            onClick={onClose}
                          >
                            <div className="aspect-[3/4] w-14 flex-shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                              <ResponsiveImage
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover object-top"
                                loading="lazy"
                                width={112}
                                height={149}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate font-serif text-base font-light text-ink transition-colors group-hover:text-clay">{product.name}</h3>
                              <p className="mt-0.5 text-[10px] uppercase tracking-luxe text-ink-muted">{product.category}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}

                  {!searchTerm && (
                    <div>
                      <h3 className="mb-4 text-[10px] uppercase tracking-luxe text-ink-muted">Búsquedas populares</h3>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((tag) => (
                          <button
                            key={tag}
                            className="rounded-full border border-ink/20 px-4 py-2 text-xs uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                            onClick={() => handleSearch(tag)}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
