import { useState, useEffect, useRef, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { searchProducts } from '../data/products.js'

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      Buscar productos
                    </Dialog.Title>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">
                        Esc
                      </kbd>
                      <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Buscar blusas, pantalones, vestidos..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose focus:border-transparent"
                    />
                    {searchTerm && (
                      <button 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" 
                        onClick={() => handleSearch('')}
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto p-6">
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-rose border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-3 text-sm text-gray-600">Buscando productos...</p>
                    </div>
                  )}

                  {!isLoading && searchTerm && searchResults.length === 0 && (
                    <div className="text-center py-12">
                      <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron productos</h3>
                      <p className="text-sm text-gray-500">Intenta con otros términos de búsqueda</p>
                    </div>
                  )}

                  {!isLoading && searchTerm && searchResults.length > 0 && (
                    <>
                      <p className="text-sm text-gray-600 mb-4">
                        {searchResults.length} producto{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            to={`/${product.category}`}
                            className="flex gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={onClose}
                          >
                            <div className="w-16 h-16 flex-shrink-0 bg-white rounded-md overflow-hidden">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                              <p className="text-xs text-gray-500 capitalize mt-1">{product.category}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}

                  {!searchTerm && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Búsquedas populares</h3>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((tag) => (
                          <button
                            key={tag}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 rounded-full transition-colors"
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
