// ============================================================
// probadorCuerpo — geometría del maniquí del probador de tallas
// ------------------------------------------------------------
// Lógica pura (sin React): a partir de la cintura y la cadera en cm devuelve
// las curvas SVG de cada parte del cuerpo. Los puntos de control dependen de
// las medidas y se suavizan con curvas (Catmull-Rom → Bézier), así el dibujo
// nunca queda mal formado y reacciona a cada dato sin motor 3D (ver
// src/lib/tallas.js sobre por qué no se usa un avatar 3D de pago).
//
// El diseño de referencia (Figma "Victoria Modas — Probador de tallas") usa
// exactamente estos puntos, para que lo que se diseñó sea lo que se ve.
// ============================================================

export const VB_W = 240
export const VB_H = 440
export const CX = 120

// Alturas (y) de cada zona en el lienzo de 240×440.
export const Y = { hombro: 86, busto: 116, cintura: 160, cadera: 210 }

// Tonos de piel: color del círculo selector + par (arriba/abajo) del degradado.
export const TONOS_PIEL = ['#F6E3D4', '#EBC9A9', '#D9A882', '#BC8358', '#8F5B3A', '#5E3B27']
export const TONOS_DEGRADADO = [
  ['#F9E8DA', '#EFD3BC'],
  ['#F0D2B5', '#E1B892'],
  ['#E2B78F', '#CD9968'],
  ['#C99068', '#B0724A'],
  ['#A26F4B', '#875636'],
  ['#6E4A33', '#573823'],
]
export const NOMBRES_TONO = ['Muy claro', 'Claro', 'Trigueño claro', 'Trigueño', 'Moreno', 'Oscuro']

// Colores del ajuste — apagados a propósito (nada de semáforo chillón, ver
// paleta en CLAUDE.md) pero inconfundibles; además siempre llevan ícono + texto.
export const COLOR_NIVEL = {
  ok: '#5E8C61', // ajuste ideal
  aviso: '#D39A2F', // ligeramente justa / suelta
  mal: '#B94A48', // no recomendada
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const f = (n) => Math.round(n * 10) / 10

// Curva cerrada suave por todos los puntos (Catmull-Rom uniforme → Bézier).
function pathCerrado(pts) {
  const n = pts.length
  const k = 1 / 6
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    d += ` C ${f(p1[0] + (p2[0] - p0[0]) * k)} ${f(p1[1] + (p2[1] - p0[1]) * k)}, ${f(p2[0] - (p3[0] - p1[0]) * k)} ${f(p2[1] - (p3[1] - p1[1]) * k)}, ${f(p2[0])} ${f(p2[1])}`
  }
  return `${d} Z`
}

const der = (dx, y) => [CX + dx, y]
const izq = (dx, y) => [CX - dx, y]

// Todas las partes del cuerpo a partir de la cintura y la cadera (cm).
// Sin medida (null) se usa una silueta neutra de reposo.
export function construirCuerpo(cintura, cadera) {
  const c = clamp(cintura ?? 70, 50, 130)
  const h = clamp(cadera ?? 95, 70, 150)
  const W = 0.31 * c // media anchura de la cintura (unidades del lienzo)
  const H = 0.345 * h // media anchura de la cadera
  const prom = (W + H) / 2
  const B = prom * 0.98 // busto (referencial: no se mide)
  const S = Math.max(27 + prom * 0.16, B + 3) // hombro

  const torsoDer = [
    [6.5, 74], [S * 0.62, 80], [S, Y.hombro], [S - 1, 100], [B, Y.busto], [(B + W) / 2 + 0.5, 138],
    [W, Y.cintura], [(W + H) / 2 + 3, 186], [H, Y.cadera], [H * 0.93, 236], [H * 0.62, 258],
  ]
  const torso = pathCerrado([
    [CX, 72],
    ...torsoDer.map(([dx, y]) => der(dx, y)),
    [CX, 268],
    ...[...torsoDer].reverse().map(([dx, y]) => izq(dx, y)),
  ])

  const kx = 0.4 * H + 5.4 // rodilla (exterior)
  const ax = 0.13 * H + 4.2 // tobillo (exterior)
  const ai = 2.6 // tobillo (interior)
  const ki = 3.2 // rodilla (interior)
  const piernaDer = [
    [H * 0.5, 218], [H * 0.9, 224], [H * 0.94, 244], [H * 0.86, 272], [(H * 0.86 + kx) / 2 + 1.5, 302], [kx, 332], [kx * 0.98, 366],
    [ax, 408], [ax - 1.5, 416], [ai + 1, 416], [ai, 408], [ki, 332], [2, 292], [0.6, 252],
  ]

  const eO = Math.max(S + 8, W + 12) // codo (exterior)
  const wO = Math.max(S + 9.5, H + 9.5) // muñeca (exterior)
  const brazoDer = [
    [S - 1, 84], [S + 5, 96], [S + 7.5, 128], [eO, 166], [wO, 208], [wO + 0.5, 236], [wO - 3, 247],
    [wO - 6.5, 236], [wO - 5.5, 208], [eO - 8, 166], [S - 1, 128], [S - 6, 100],
  ]

  return {
    W,
    H,
    torso,
    piernaD: pathCerrado(piernaDer.map(([dx, y]) => der(dx, y))),
    piernaI: pathCerrado(piernaDer.map(([dx, y]) => izq(dx, y))),
    brazoD: pathCerrado(brazoDer.map(([dx, y]) => der(dx, y))),
    brazoI: pathCerrado(brazoDer.map(([dx, y]) => izq(dx, y))),
    pieX: (ax + ai) / 2 + 3,
  }
}
