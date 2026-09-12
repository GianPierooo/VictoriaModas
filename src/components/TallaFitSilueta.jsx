// ============================================================
// TallaFitSilueta — maniquí ilustrado que MORFEA en vivo según las
// medidas que la clienta va escribiendo (cintura/cadera), en vez de un
// diagrama estático. Técnica: dos perfiles de referencia (angosto/ancho)
// con los MISMOS puntos de control, interpolados con el valor ingresado
// — sin librerías de morphing ni motor 3D, ver src/lib/tallas.js para el
// contexto de por qué se descartó un avatar 3D real (Shavatar/TrueToForm
// son productos pagos dedicados a eso).
//
// El torso se ensancha en la cintura según `cintura` y en la cadera según
// `cadera`, de forma independiente — así se siente reactiva a cada dato,
// no solo una escala genérica. Cuando aún no hay estado de ajuste
// calculado (la clienta sigue escribiendo), las bandas se ven neutras;
// una vez hay recomendación, se colorean ideal/holgado/ajustado.
// ============================================================
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'

// Puntos de control (mitad del ancho del cuerpo desde el eje central, y
// posición vertical) en un lienzo fijo de 160×240. Dos perfiles de
// referencia — el rango de cm que cubren es amplio a propósito (incluye
// tallas grandes) para que el morph nunca se vea "topado" en los extremos.
const PERFIL_ANGOSTO = {
  hombro: { y: 30, hw: 20 },
  busto: { y: 55, hw: 19 },
  cintura: { y: 100, hw: 14 },
  cadera: { y: 142, hw: 20 },
  muslo: { y: 205, hw: 15 },
}
const PERFIL_ANCHO = {
  hombro: { y: 30, hw: 24 },
  busto: { y: 55, hw: 26 },
  cintura: { y: 100, hw: 26 },
  cadera: { y: 142, hw: 34 },
  muslo: { y: 205, hw: 21 },
}

const CX = 80 // eje central del lienzo (viewBox 160 de ancho)

// cm reales -> t (0..1) dentro de un rango humano amplio. Fuera de rango
// se recorta (clamp) — el morph nunca "revienta" el dibujo.
function tDesdeCm(valor, min, max) {
  if (valor == null || Number.isNaN(valor)) return 0.35 // posición neutra de reposo
  return Math.min(1, Math.max(0, (valor - min) / (max - min)))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

// Punto interpolado para una zona del cuerpo dada, con su propio t.
function puntoZona(zona, t) {
  const a = PERFIL_ANGOSTO[zona]
  const b = PERFIL_ANCHO[zona]
  return { y: lerp(a.y, b.y, t), hw: lerp(a.hw, b.hw, t) }
}

// Arma el path del torso (sin cabeza) a partir de los 5 puntos de control,
// con curvas suaves entre cada zona — mismo "template" siempre, solo
// cambian las coordenadas, así nunca hay un path mal formado.
function construirPathCuerpo({ hombro, busto, cintura, cadera, muslo }) {
  const hy = hombro.y, hx = CX - hombro.hw, hxR = CX + hombro.hw
  const by = busto.y, bx = CX - busto.hw, bxR = CX + busto.hw
  const cy = cintura.y, cx = CX - cintura.hw, cxR = CX + cintura.hw
  const dy = cadera.y, dx = CX - cadera.hw, dxR = CX + cadera.hw
  const my = muslo.y, mx = CX - muslo.hw, mxR = CX + muslo.hw

  return [
    `M ${hx} ${hy}`,
    `C ${hx - 6} ${hy + 14} ${bx - 4} ${by - 10} ${bx} ${by}`,
    `C ${bx + 2} ${by + 20} ${cx - 4} ${cy - 22} ${cx} ${cy}`,
    `C ${cx - 3} ${cy + 18} ${dx - 6} ${dy - 20} ${dx} ${dy}`,
    `C ${dx + 2} ${dy + 24} ${mx - 3} ${my - 26} ${mx} ${my}`,
    `L ${mxR} ${my}`,
    `C ${mxR + 3} ${my - 26} ${dxR - 2} ${dy + 24} ${dxR} ${dy}`,
    `C ${dxR + 6} ${dy - 20} ${cxR + 3} ${cy + 18} ${cxR} ${cy}`,
    `C ${cxR + 4} ${cy - 22} ${bxR - 2} ${by + 20} ${bxR} ${by}`,
    `C ${bxR + 4} ${by - 10} ${hxR + 6} ${hy + 14} ${hxR} ${hy}`,
    'Z',
  ].join(' ')
}

const COLOR_ESTADO = {
  ideal: '#9C5F4E', // clay
  holgado: '#D7B3A8', // clay-light
  ajustado: '#8A5340', // clay-dark
}
const ETIQUETA_ESTADO = { ideal: 'Ideal', holgado: 'Holgado', ajustado: 'Ajustado' }

function Banda({ y, ancho, estado, etiqueta, reducedMotion }) {
  const color = estado ? COLOR_ESTADO[estado] : '#2B2424'
  const opacidad = estado ? 1 : 0.35
  const transicion = reducedMotion ? 'none' : 'transform 350ms ease-out'
  return (
    <g style={{ transition: transicion }} transform={`translate(0 ${y})`}>
      <line x1={CX - ancho / 2} y1={0} x2={CX + ancho / 2} y2={0} stroke={color} strokeOpacity={opacidad} strokeWidth={4} strokeLinecap="round" />
      <circle cx={CX - ancho / 2} cy={0} r={3.5} fill={color} fillOpacity={opacidad} />
      <circle cx={CX + ancho / 2} cy={0} r={3.5} fill={color} fillOpacity={opacidad} />
      <text x={CX + ancho / 2 + 10} y={4} fontSize="11" fill="#5B5150" fontFamily="Roboto, sans-serif">
        {etiqueta}
        {estado && (
          <tspan fill={color} fontWeight="500">
            {' '}· {ETIQUETA_ESTADO[estado]}
          </tspan>
        )}
      </text>
    </g>
  )
}

// `cintura`/`cadera`: valores en cm que la clienta va escribiendo (o null
// si aún no escribió) — el maniquí reacciona a esto EN VIVO, tecla por
// tecla. `cinturaEstado`/`caderaEstado`: solo se pasan una vez hay
// recomendación calculada (colorea las bandas).
export default function TallaFitSilueta({ cintura, cadera, cinturaEstado, caderaEstado }) {
  const reducedMotion = usePrefersReducedMotion()
  const transicion = reducedMotion ? 'none' : 'd 350ms ease-out'
  const tCintura = tDesdeCm(cintura, 55, 100)
  const tCadera = tDesdeCm(cadera, 75, 122)
  const tPromedio = (tCintura + tCadera) / 2

  const puntos = {
    hombro: puntoZona('hombro', tPromedio),
    busto: puntoZona('busto', tPromedio),
    cintura: puntoZona('cintura', tCintura),
    cadera: puntoZona('cadera', tCadera),
    muslo: puntoZona('muslo', tPromedio),
  }
  const pathCuerpo = construirPathCuerpo(puntos)
  const anchoCintura = puntos.cintura.hw * 2 + 45
  const anchoCadera = puntos.cadera.hw * 2 + 45

  return (
    <svg viewBox="0 0 260 240" className="mx-auto h-56 w-auto overflow-visible" role="img" aria-label="Maniquí de ajuste por zona">
      {/* Cabeza — óvalo simple, sin rasgos (neutro, no representa a nadie en particular) */}
      <ellipse cx={CX} cy={12} rx={11} ry={13} fill="#FBF7F4" stroke="#2B2424" strokeOpacity="0.25" strokeWidth="1.5" />
      <path
        d={pathCuerpo}
        fill="#FBF7F4"
        stroke="#2B2424"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        style={{ transition: transicion }}
      />
      <Banda y={puntos.cintura.y} ancho={anchoCintura} estado={cinturaEstado} etiqueta="Cintura" reducedMotion={reducedMotion} />
      <Banda y={puntos.cadera.y} ancho={anchoCadera} estado={caderaEstado} etiqueta="Cadera" reducedMotion={reducedMotion} />
    </svg>
  )
}
