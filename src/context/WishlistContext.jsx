import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useToast } from './ToastContext.jsx'

const WishlistContext = createContext(null)

const STORAGE_KEY = 'vm_wishlist'

// Carga defensiva: tolera datos viejos o corruptos sin crashear.
function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Solo ids string, sin duplicados
    return [...new Set(parsed.filter(id => typeof id === 'string'))]
  } catch {
    return []
  }
}

export function WishlistProvider({ children }) {
  const [favorites, setFavorites] = useState(loadStored)
  const toast = useToast()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      /* almacenamiento no disponible: los favoritos siguen en memoria */
    }
  }, [favorites])

  const toggleFavorite = useCallback((productId) => {
    // El toast va FUERA del updater (los updaters deben ser puros; StrictMode
    // los invoca dos veces y duplicaría la notificación).
    const has = favorites.includes(productId)
    toast.success(has ? 'Quitado de favoritos' : 'Guardado en favoritos')
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }, [favorites, toast])

  const isFavorite = useCallback(
    (productId) => favorites.includes(productId),
    [favorites]
  )

  const value = useMemo(
    () => ({ favorites, toggleFavorite, isFavorite, count: favorites.length }),
    [favorites, toggleFavorite, isFavorite]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
