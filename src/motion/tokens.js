// Tokens de movimiento — sensación boutique: deceleración suave, springs
// contenidos, nada estridente. Reutilizados en toda la capa de animación.

// Ease-out expresivo (suave al final). Para fades, reveals y transiciones.
export const EASE = [0.22, 1, 0.36, 1]
// Ease-out estándar para hovers cortos.
export const EASE_OUT = [0.16, 1, 0.3, 1]

export const DURATION = {
  fast: 0.3,
  base: 0.45,
  slow: 0.6,
}

// Springs naturales (contenidos, sin rebote exagerado).
export const SPRING = {
  // Elevación de cards / quick-add que sube.
  soft: { type: 'spring', stiffness: 240, damping: 26, mass: 0.9 },
  // Movimientos suaves y lentos.
  gentle: { type: 'spring', stiffness: 180, damping: 30 },
  // "Pop" satisfactorio del corazón / badges (snappy pero controlado).
  pop: { type: 'spring', stiffness: 500, damping: 17, mass: 0.6 },
}
