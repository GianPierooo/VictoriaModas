import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { cartItemKey } from '../utils/cart.js'

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
  
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    localStorage.setItem('vm_cart_items', JSON.stringify(items))
  }, [items])

  function addItem(product, quantity = 1) {
    setItems(prev => {
      // Buscar si ya existe un producto con el mismo ID, color y talla
      const idx = prev.findIndex(p => 
        p.id === product.id && 
        p.selectedColor === product.selectedColor && 
        p.selectedSize === product.selectedSize
      )
      
      if (idx !== -1) {
        // Si existe el mismo producto con mismo color y talla, aumentar cantidad
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
        return next
      }
      
      // Si no existe, agregar como nuevo item
      return [...prev, { ...product, quantity }]
    })
    
    // Mostrar notificación (sin auto-cerrar)
    setShowNotification(true)
  }
  
  function closeNotification() {
    setShowNotification(false)
  }

  function removeItem(key) {
    setItems(prev => prev.filter(p => cartItemKey(p) !== key))
  }

  function updateQuantity(key, quantity) {
    setItems(prev => prev.map(p =>
      cartItemKey(p) === key ? { ...p, quantity: Math.max(1, quantity) } : p
    ))
  }

  function clearCart() {
    setItems([])
  }

  const totals = useMemo(() => {
    const itemCount = items.reduce((sum, it) => sum + it.quantity, 0)
    return { itemCount }
  }, [items])

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, totals, showNotification, closeNotification }),
    [items, totals, showNotification]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


