// Registro de pedidos en la hoja (vía /api/pedido), en segundo plano.
// ------------------------------------------------------------------
// Regla de oro: registrar el pedido NUNCA puede frenar la venta. Estas
// funciones no lanzan ni bloquean; si algo falla, el flujo de WhatsApp sigue
// igual y el error queda en consola.
//
// Web pública = SOLO canal "menor". Nunca se envían precios de mayoreo.

// Arma el payload que espera /api/pedido a partir del formulario y el carrito.
export function buildOrderPayload(formData, items) {
  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0)

  const detalle = items
    .map((it) => {
      const variante = [it.selectedColor, it.selectedSize].filter(Boolean).join('/')
      return `${it.quantity}× ${it.name}${variante ? ` (${variante})` : ''}`
    })
    .join('; ')

  // Ciudad y notas no tienen columna propia en "Pedidos": van dentro de items
  // para que el dueño no pierda la info de entrega.
  const extras = [
    formData.ciudad?.trim() ? `Ciudad: ${formData.ciudad.trim()}` : '',
    formData.notas?.trim() ? `Notas: ${formData.notas.trim()}` : '',
  ]
    .filter(Boolean)
    .join(' — ')

  return {
    canal: 'menor',
    cliente: formData.nombre?.trim() || '',
    telefono: formData.telefono?.trim() || '',
    items: extras ? `${detalle} — ${extras}` : detalle,
    total: totalItems,
  }
}

// Envía el pedido en segundo plano. Devuelve una promesa que SIEMPRE resuelve
// (nunca rechaza) para no romper el flujo si se encadena.
export function registerOrder(payload) {
  try {
    return fetch('/api/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // que el POST sobreviva aunque cambie el foco de pestaña
    })
      .then((res) => res.json().catch(() => ({ ok: false })))
      .catch((err) => {
        console.error('[pedido] no se pudo registrar (el pedido sigue por WhatsApp):', err)
        return { ok: false }
      })
  } catch (err) {
    console.error('[pedido] error al registrar (ignorado):', err)
    return Promise.resolve({ ok: false })
  }
}
