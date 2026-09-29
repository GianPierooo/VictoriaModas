// ============================================================
// TallaFitSilueta — el "escenario" del probador: maniquí de cuerpo completo
// que MORFEA en vivo con la cintura y la cadera, anillos de medición que se
// colorean según cómo calza la talla, etiqueta por zona y selector de tono
// de piel. Diseñado en Figma ("Probador de tallas") y llevado a código: la
// geometría vive en src/lib/probadorCuerpo.js.
//
// Es la versión 2D/SVG de los probadores virtuales de las tiendas grandes
// (que usan un avatar 3D de pago): el cuerpo se arma con puntos de control
// que dependen de las medidas, así que reacciona a cada dato sin motor 3D.
//
// Trazo unificado: todas las partes (torso, piernas, brazos, cabeza) se
// dibujan primero con contorno y luego solo con relleno encima — así el
// borde rodea la silueta completa sin líneas internas donde se solapan.
// ============================================================
import { useId } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'
import {
  VB_W,
  VB_H,
  CX,
  Y,
  TONOS_PIEL,
  TONOS_DEGRADADO,
  NOMBRES_TONO,
  COLOR_NIVEL,
  construirCuerpo,
} from '../lib/probadorCuerpo.js'

const COLOR_NEUTRO = '#2B2424'
const f = (n) => Math.round(n * 10) / 10

// Anillo de medición: mitad trasera tenue + mitad delantera marcada, como
// una cinta métrica rodeando el cuerpo.
function Anillo({ y, rx, nivel, reducedMotion }) {
  const color = nivel ? COLOR_NIVEL[nivel] : COLOR_NEUTRO
  const fuerte = nivel ? 1 : 0.4
  const ry = 6.5
  const trans = reducedMotion ? 'none' : 'stroke 300ms ease-out'
  return (
    <g style={{ transition: trans }}>
      <path d={`M ${f(CX - rx)} ${y} A ${f(rx)} ${ry} 0 0 1 ${f(CX + rx)} ${y}`} fill="none" stroke={color} strokeOpacity={fuerte * 0.35} strokeWidth="3" strokeLinecap="round" />
      <path d={`M ${f(CX - rx)} ${y} A ${f(rx)} ${ry} 0 0 0 ${f(CX + rx)} ${y}`} fill="none" stroke={color} strokeOpacity={fuerte} strokeWidth="3.6" strokeLinecap="round" />
    </g>
  )
}

const ICONO_NIVEL = {
  ok: <path d="M4.2 8.6l2.8 2.8 5-5.6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  aviso: <path d="M8 4.4v4.8M8 11.7v.1" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />,
  mal: <path d="M5.2 5.2l5.6 5.6M10.8 5.2l-5.6 5.6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />,
}

// Insignia redonda con el ícono del nivel (✓ / ! / ✕) — sirve además a quien
// no distingue bien los colores.
export function InsigniaNivel({ nivel, tam = 16 }) {
  if (!nivel) return null
  return (
    <svg width={tam} height={tam} viewBox="0 0 16 16" aria-hidden="true" className="vm-pop flex-shrink-0">
      <circle cx="8" cy="8" r="8" fill={COLOR_NIVEL[nivel]} />
      {ICONO_NIVEL[nivel]}
    </svg>
  )
}

// Ancho reservado a la derecha del maniquí para las etiquetas, según el escenario.
const ETIQUETA_ANCHO = { normal: 116, compacto: 100 }
const ETIQUETA_SEPARACION = { normal: 34, compacto: 22 }

// En escenarios chicos (móvil) la etiqueta va compacta: solo ícono + estado,
// sin el nombre de la zona (el conector ya la señala) — así caben las dos
// etiquetas una sobre otra sin pisarse.
function Etiqueta({ top, left, zona, texto, nivel, compacto }) {
  return (
    <div
      className="pointer-events-none absolute flex -translate-y-1/2 items-center gap-2 transition-opacity duration-300"
      style={{ top, left, opacity: nivel ? 1 : 0, width: compacto ? ETIQUETA_ANCHO.compacto : ETIQUETA_ANCHO.normal }}
    >
      <InsigniaNivel nivel={nivel} tam={compacto ? 16 : 18} />
      <p className="leading-tight">
        {!compacto && <span className="block text-[9px] font-medium uppercase tracking-[0.16em] text-ink-muted">{zona}</span>}
        <span style={{ color: nivel ? COLOR_NIVEL[nivel] : undefined }} className={compacto ? 'text-[11px]' : 'text-[13px]'}>
          {texto}
        </span>
      </p>
    </div>
  )
}

// Fila de tonos de piel (círculos) para personalizar el maniquí.
function SelectorTono({ valor, onChange }) {
  return (
    <div className="flex flex-col items-center gap-2.5" role="radiogroup" aria-label="Tono de piel del maniquí">
      {TONOS_PIEL.map((color, i) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={valor === i}
          aria-label={NOMBRES_TONO[i]}
          title={NOMBRES_TONO[i]}
          onClick={() => onChange(i)}
          className={`h-5 w-5 rounded-full transition-transform duration-200 cursor-pointer ${
            valor === i ? 'scale-110 border-[2.5px] border-clay' : 'border border-ink/25 hover:scale-110'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}

// `cintura`/`cadera`: cm que la clienta va eligiendo (o null si aún no) — el
// cuerpo reacciona EN VIVO. `cinturaNivel`/`caderaNivel` ('ok'|'aviso'|'mal')
// y sus textos: solo cuando ya hay una talla que evaluar; colorean los
// anillos y muestran la etiqueta junto a cada zona (`conEtiquetas`).
// `alto`: alto del escenario en px (340 escritorio · 300 móvil).
export default function TallaFitSilueta({
  cintura,
  cadera,
  cinturaNivel = null,
  caderaNivel = null,
  cinturaTexto = '',
  caderaTexto = '',
  tono = 1,
  onTono,
  alto = 340,
  conEtiquetas = false,
}) {
  const reducedMotion = usePrefersReducedMotion()
  const uid = useId().replace(/:/g, '')
  const b = construirCuerpo(cintura, cadera)
  const [pielArriba, pielAbajo] = TONOS_DEGRADADO[tono] || TONOS_DEGRADADO[1]
  const altoManiqui = alto - 34
  const ancho = Math.round((altoManiqui * VB_W) / VB_H)
  const esc = altoManiqui / VB_H
  const compacto = alto < 320

  const partes = (relleno) => (
    <>
      <path d={b.brazoD} fill={relleno} />
      <path d={b.brazoI} fill={relleno} />
      <path d={b.piernaD} fill={relleno} />
      <path d={b.piernaI} fill={relleno} />
      <ellipse cx={CX + b.pieX} cy={421} rx={9.5} ry={4.6} fill={relleno} />
      <ellipse cx={CX - b.pieX} cy={421} rx={9.5} ry={4.6} fill={relleno} />
      <path d={b.torso} fill={relleno} />
      <rect x={CX - 6.8} y={50} width={13.6} height={30} rx={5} fill={relleno} />
      <ellipse cx={CX} cy={36} rx={17} ry={21} fill={relleno} />
    </>
  )

  // Conector punteado desde el borde del anillo hasta la etiqueta.
  const conector = (yRing, rx, nivel) => {
    if (!nivel) return null
    const x0 = ((CX + rx + 3) / VB_W) * ancho
    return (
      <span
        aria-hidden="true"
        className="pointer-events-none absolute border-t-[1.5px] border-dotted"
        style={{ top: yRing * esc, left: x0, width: Math.max(8, ancho - x0 + separacion - 4), borderColor: COLOR_NIVEL[nivel] }}
      />
    )
  }
  const separacion = compacto ? ETIQUETA_SEPARACION.compacto : ETIQUETA_SEPARACION.normal
  const xEtiqueta = ancho + separacion
  const reservaDerecha = separacion + (compacto ? ETIQUETA_ANCHO.compacto : ETIQUETA_ANCHO.normal)

  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden rounded-[22px] border border-ink/[0.14]"
      style={{ height: alto, background: 'linear-gradient(to bottom, #FBF7F4, #F0E6DD)' }}
    >
      {onTono && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 sm:left-5">
          <SelectorTono valor={tono} onChange={onTono} />
        </div>
      )}

      <div className="flex items-center" style={{ paddingLeft: onTono ? (conEtiquetas ? 34 : 18) : 0, paddingRight: conEtiquetas ? reservaDerecha : 0 }}>
        <div className="relative" style={{ width: ancho, height: altoManiqui }}>
          {/* sombra en el suelo */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{ bottom: -4, width: ancho * 1.08, height: 18, background: 'radial-gradient(ellipse at center, rgba(43,36,36,0.22), rgba(43,36,36,0) 70%)' }}
          />
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="relative h-full w-full overflow-visible" role="img" aria-label="Maniquí que se ajusta a tus medidas">
            <defs>
              <linearGradient id={`${uid}-piel`} gradientUnits="userSpaceOnUse" x1="0" y1="16" x2="0" y2="430">
                <stop offset="0" stopColor={pielArriba} />
                <stop offset="1" stopColor={pielAbajo} />
              </linearGradient>
              <linearGradient id={`${uid}-vol`} gradientUnits="userSpaceOnUse" x1={CX - 72} y1="0" x2={CX + 72} y2="0">
                <stop offset="0" stopColor="#6B3F24" stopOpacity="0.2" />
                <stop offset="0.28" stopColor="#6B3F24" stopOpacity="0" />
                <stop offset="0.72" stopColor="#6B3F24" stopOpacity="0" />
                <stop offset="1" stopColor="#6B3F24" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {/* contorno (capa de abajo) */}
            <g stroke={COLOR_NEUTRO} strokeOpacity="0.22" strokeWidth="3" strokeLinejoin="round">
              {partes(COLOR_NEUTRO)}
            </g>
            {/* piel con degradado + volumen lateral (capas de arriba, sin borde) */}
            {partes(`url(#${uid}-piel)`)}
            {partes(`url(#${uid}-vol)`)}
            {/* pelo recogido — neutro, no representa a nadie en particular */}
            <path d={`M ${CX - 17.5} 33 C ${CX - 18} 12, ${CX + 18} 12, ${CX + 17.5} 33 C ${CX + 13} 22, ${CX - 13} 22, ${CX - 17.5} 33 Z`} fill="#3A2B27" />
            <ellipse cx={CX} cy={13} rx={8.5} ry={7} fill="#3A2B27" />
            <Anillo y={Y.cintura} rx={b.W + 6} nivel={cinturaNivel} reducedMotion={reducedMotion} />
            <Anillo y={Y.cadera} rx={b.H + 6} nivel={caderaNivel} reducedMotion={reducedMotion} />
          </svg>

          {conEtiquetas && (
            <>
              {conector(Y.cintura, b.W + 6, cinturaNivel)}
              {conector(Y.cadera, b.H + 6, caderaNivel)}
              <Etiqueta top={Y.cintura * esc} left={xEtiqueta} zona="Cintura" texto={cinturaTexto} nivel={cinturaNivel} compacto={compacto} />
              <Etiqueta top={Y.cadera * esc} left={xEtiqueta} zona="Cadera" texto={caderaTexto} nivel={caderaNivel} compacto={compacto} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
