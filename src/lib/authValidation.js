// ============================================================
// authValidation — validación de correo y contraseña para login/registro.
// ------------------------------------------------------------
// El <form> de AccountPage usa `noValidate` (para controlar los mensajes de
// error a mano, no con el tooltip nativo del navegador) — por eso hace
// falta ESTA validación explícita; sin ella, cualquier texto llega a
// Supabase tal cual (bug real encontrado y corregido).
// ============================================================

// Regex de formato de email razonable (no exhaustiva RFC 5322 — nadie la
// necesita completa; esto ya descarta la enorme mayoría de errores de
// tipeo, que es lo que importa acá).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function esEmailValido(email) {
  return EMAIL_REGEX.test((email || '').trim())
}

// Política de contraseña: 8+ caracteres, con letra Y número. Coincide con
// lo que se le pide al dueño configurar como mínimo real en Supabase
// (Authentication → Policies) — el cliente nunca es la única barrera, pero
// tampoco tiene sentido que sea más floja que el servidor.
export function evaluarContrasena(pw) {
  const valor = pw || ''
  const tieneLongitud = valor.length >= 8
  const tieneLetra = /[a-zA-Z]/.test(valor)
  const tieneNumero = /[0-9]/.test(valor)
  const tieneMayusYMinus = /[a-z]/.test(valor) && /[A-Z]/.test(valor)
  const tieneSimbolo = /[^a-zA-Z0-9]/.test(valor)

  const valida = tieneLongitud && tieneLetra && tieneNumero

  // Puntaje 0-3 solo para el medidor visual (no bloquea el envío por sí
  // solo, salvo el mínimo `valida` de arriba).
  let puntaje = 0
  if (tieneLongitud) puntaje += 1
  if (tieneLetra && tieneNumero) puntaje += 1
  if (tieneMayusYMinus || tieneSimbolo) puntaje += 1

  const etiquetas = ['Muy débil', 'Débil', 'Buena', 'Fuerte']
  return {
    valida,
    puntaje,
    etiqueta: valor ? etiquetas[puntaje] : '',
    tieneLongitud,
    tieneLetra,
    tieneNumero,
  }
}
