// ============================================================
// TallaFitSilueta — silueta estilizada (no 3D) con dos bandas horizontales
// (cintura/cadera) coloreadas según qué tan bien le queda cada talla
// candidata. Inspirado en el "bullet chart" (medidor de rango vs. valor
// real) pero dibujado a mano en SVG, en la paleta de la marca — nunca el
// rojo/verde semáforo genérico de los widgets de terceros.
// ============================================================
const COLOR_ESTADO = {
  ideal: '#9C5F4E', // clay
  holgado: '#D7B3A8', // clay-light
  ajustado: '#8A5340', // clay-dark
}

const ETIQUETA_ESTADO = {
  ideal: 'Ideal',
  holgado: 'Holgado',
  ajustado: 'Ajustado',
}

function Banda({ y, ancho, estado, etiqueta }) {
  const color = estado ? COLOR_ESTADO[estado] : '#E7DCD5'
  const cx = 80
  return (
    <g>
      <line x1={cx - ancho / 2} y1={y} x2={cx + ancho / 2} y2={y} stroke={color} strokeWidth={5} strokeLinecap="round" />
      <circle cx={cx - ancho / 2} cy={y} r={4} fill={color} />
      <circle cx={cx + ancho / 2} cy={y} r={4} fill={color} />
      <text x={cx + ancho / 2 + 12} y={y + 4} fontSize="11" fill="#5B5150" fontFamily="Roboto, sans-serif">
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

export default function TallaFitSilueta({ cinturaEstado, caderaEstado }) {
  return (
    <svg viewBox="0 0 260 230" className="mx-auto h-52 w-auto" role="img" aria-label="Diagrama de ajuste por zona">
      {/* Silueta estilizada (torso a muslo), solo trazo, sin relleno saturado */}
      <path
        d="M 100 8
           C 78 8 68 20 68 34
           C 68 54 84 66 90 90
           C 95 108 74 118 70 142
           C 66 168 82 190 92 208
           L 128 208
           C 138 190 154 168 150 142
           C 146 118 125 108 130 90
           C 136 66 152 54 152 34
           C 152 20 142 8 120 8
           Z"
        fill="#FBF7F4"
        stroke="#2B2424"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      <Banda y={99} ancho={130} estado={cinturaEstado} etiqueta="Cintura" />
      <Banda y={152} ancho={158} estado={caderaEstado} etiqueta="Cadera" />
    </svg>
  )
}
