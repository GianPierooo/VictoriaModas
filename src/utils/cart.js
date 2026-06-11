// Identificador estable de una línea del carrito (no depende del índice del array).
// Una "línea" es única por producto + color + talla.
export function cartItemKey(item) {
  return `${item.id ?? ''}__${item.selectedColor ?? ''}__${item.selectedSize ?? ''}`
}
