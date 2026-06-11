// Utilidades para WhatsApp
// Los títulos van entre *asteriscos* para que WhatsApp los muestre en negrita.

const PHONE_NUMBER = '51993357672'

// Detalle de las prendas del carrito (numerado, sin emojis)
function buildItemsBlock(items) {
  let block = ''
  items.forEach((item, index) => {
    block += `${index + 1}. *${item.name}*\n`
    if (item.selectedColor) block += `   Color: ${item.selectedColor}\n`
    if (item.selectedSize) block += `   Talla: ${item.selectedSize}\n`
    block += `   Cantidad: ${item.quantity}\n\n`
  })
  return block
}

// Mensaje simple desde el carrito (sin datos de cliente)
export const generateWhatsAppMessage = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return 'Hola, me gustaría hacer un pedido en Victoria Modas.'
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  let message = 'Hola, me gustaría hacer un pedido en Victoria Modas.\n\n'
  message += '*Detalle del pedido*\n'
  message += buildItemsBlock(cartItems)
  message += `*Total de artículos: ${totalItems}*\n\n`
  message += 'Quedo atenta para confirmar disponibilidad, pago y envío.'

  return message
}

// Mensaje completo del checkout: datos del cliente + detalle del pedido
export const generateOrderMessage = (formData, items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  let message = 'Hola, me gustaría hacer un pedido en Victoria Modas.\n\n'

  message += '*Datos del cliente*\n'
  message += `Nombre: ${formData.nombre}\n`
  message += `Teléfono: ${formData.telefono}\n`
  message += `Ciudad / distrito: ${formData.ciudad}\n`
  if (formData.notas?.trim()) {
    message += `Notas: ${formData.notas.trim()}\n`
  }
  message += '\n'

  message += '*Detalle del pedido*\n'
  message += buildItemsBlock(items)
  message += `*Total de artículos: ${totalItems}*\n\n`
  message += 'Quedo atenta para coordinar pago y envío.'

  return message
}

export const openWhatsApp = (message) => {
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`
  window.open(whatsappUrl, '_blank')
}
