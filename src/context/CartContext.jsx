import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { cartItemKey } from '../utils/cart.js'
import { useToast } from './ToastContext.jsx'

const CartContext = createContext(null)

// Carga defensiva del carrito guardado: tolera datos viejos o corruptos.
function loadStoredCart() {
  try {
    const raw = localStorage.getItem('vm_cart_items')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Conserva solo entradas válidas (deben tener id y una cantidad numérica > 0)
    return parsed
      .filter(it => it && it.id)
      .map(it => ({ ...it, quantity: Math.max(1, Number(it.quantity) || 1) }))
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadStoredCart)
  // Mini-carrito lateral (drawer): ver/editar sin salir de la página.
  const [drawerOpen, setDrawerOpen] = useState(false)
  const toast = useToast()

  // Persistencia endurecida: no rompe si el almacenamiento no está disponible
  // (navegación privada, cuota llena, etc.); el carrito sigue en memoria.
  useEffect(() => {
    try {
      localStorage.setItem('vm_cart_items', JSON.stringify(items))
    } catch {
      /* almacenamiento no disponible */
    }
  }, [items])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const addItem = useCallback((product, quantity = 1) => {
    setItems(prev => {
      // Misma línea = mismo id + color + talla.
      const idx = prev.findIndex(p =>
        p.id === product.id &&
        p.selectedColor === product.selectedColor &&
        p.selectedSize === product.selectedSize
      )
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
        return next
      }
      return [...prev, { ...product, quantity }]
    })

    // Feedback unificado: toast con acción para abrir el mini-carrito.
    toast.success('Añadido al carrito', {
      action: { label: 'Ver carrito', onClick: () => setDrawerOpen(true) },
    })
  }, [toast])

  const removeItem = useCallback((key) => {
    setItems(prev => prev.filter(p => cartItemKey(p) !== key))
  }, [])

  const updateQuantity = useCallback((key, quantity) => {
    setItems(prev => prev.map(p =>
      cartItemKey(p) === key ? { ...p, quantity: Math.max(1, quantity) } : p
    ))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totals = useMemo(() => {
    const itemCount = items.reduce((sum, it) => sum + it.quantity, 0)
    return { itemCount }
  }, [items])

  const value = useMemo(
    () => ({
      items, addItem, removeItem, updateQuantity, clearCart, totals,
      drawerOpen, openDrawer, closeDrawer,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, totals, drawerOpen, openDrawer, closeDrawer]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


