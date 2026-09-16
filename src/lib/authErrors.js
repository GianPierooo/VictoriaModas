// ============================================================
// authErrors — traduce los errores de Supabase Auth a mensajes en español,
// claros para la clienta. Antes solo se traducían 2 casos ("credenciales
// inválidas", "ya existe cuenta") y todo lo demás se mostraba en inglés,
// crudo, tal como lo devuelve Supabase — se sentía roto.
// ============================================================

// Coincidencias por substring (no exactas) porque Supabase a veces agrega
// detalles al final del mensaje (ej. el número exacto de segundos a
// esperar), que no vale la pena tratar de calzar exacto.
const REGLAS = [
  [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
  [/user already registered/i, 'Ya existe una cuenta con ese correo — intenta ingresar.'],
  [/unable to validate email address/i, 'Ese correo no tiene un formato válido.'],
  [/email.*invalid/i, 'Ese correo no tiene un formato válido.'],
  [/password should be at least/i, 'La contraseña es muy corta.'],
  [/password.*weak|weak password/i, 'Tu contraseña es muy débil — agrega números y letras.'],
  [/captcha/i, 'No se pudo verificar que eres una persona real. Intenta de nuevo.'],
  [/for security purposes.*after/i, 'Espera un momento antes de intentar de nuevo.'],
  [/email rate limit exceeded|rate limit/i, 'Demasiados intentos seguidos — espera unos minutos e intenta de nuevo.'],
  [/email not confirmed/i, 'Confirma tu correo antes de ingresar (revisa tu bandeja de entrada).'],
  [/user not found/i, 'No encontramos una cuenta con ese correo.'],
  [/same password/i, 'La nueva contraseña debe ser distinta a la anterior.'],
  [/session.*expired|invalid.*token|token.*expired/i, 'El enlace ya venció — pide uno nuevo.'],
]

export function mapAuthError(error) {
  if (!error) return ''
  const msg = String(error.message || error)

  for (const [patron, traduccion] of REGLAS) {
    if (patron.test(msg)) return traduccion
  }

  // Fallo de red (fetch falló antes de llegar a Supabase) — distinto de un
  // error que Supabase sí devolvió.
  if (/failed to fetch|network/i.test(msg)) {
    return 'No se pudo conectar. Revisa tu internet e intenta de nuevo.'
  }

  // Fallback: nunca mostramos el mensaje crudo en inglés sin más contexto.
  return 'Ocurrió un error inesperado. Intenta de nuevo o escríbenos por WhatsApp si sigue pasando.'
}
