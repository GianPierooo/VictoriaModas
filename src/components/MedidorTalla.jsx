// ============================================================
// MedidorTalla — en qué parte del rango de cada talla cae una medida.
// ------------------------------------------------------------
// Diseñado en Figma ("Probador de tallas"): una barra con un tramo por talla
// (S | M | L), el tramo de la talla que se está probando resaltado en clay, y
// un marcador donde cae la medida de la clienta. Muestra de un vistazo si
// está "en el centro de M", "rozando el límite con L" o fuera de todo rango
// (marcador rojo pegado al borde). Datos reales: los rangos que cargó el
// dueño en `tallas_medidas`, nunca inventados.
// ============================================================
import { posicionEnTallas } from '../lib/tallas.js'

export default function MedidorTalla({ zona, valor, tallas, seleccionada, texto }) {
  const rangos = tallas.map((t) => t.rango)
  const { pos, fuera } = posicionEnTallas(valor, rangos)
  const n = tallas.length
  const pct = (pos / n) * 100
  const colorMarcador = fuera ? 'bg-[#B94A48]' : 'bg-ink'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-[11px]">
        <p className="whitespace-nowrap font-medium text-ink">
          {zona} · {valor} cm
        </p>
        <p className="font-light text-ink-muted">{texto}</p>
      </div>
      <div
        className="relative h-[26px] rounded-full border border-ink/[0.14] bg-cream-dark"
        role="img"
        aria-label={`${zona}: ${texto}`}
      >
        <div className="absolute inset-0 flex overflow-hidden rounded-full">
          {tallas.map((t, i) => (
            <div
              key={t.nombre}
              className={`relative flex-1 pl-2.5 pt-[6px] text-[10px] font-medium tracking-[0.14em] ${
                i > 0 ? 'border-l border-ink/[0.28]' : ''
              } ${t.nombre === seleccionada ? 'bg-clay-light text-clay-dark' : 'text-ink-muted'}`}
            >
              {t.nombre}
            </div>
          ))}
        </div>
        <span
          aria-hidden="true"
          className={`vm-marcador absolute inset-y-0 w-0.5 -translate-x-1/2 ${colorMarcador}`}
          style={{ left: `${Math.min(99.2, pct)}%`, '--x': `${Math.min(99.2, pct)}%` }}
        />
        <span
          aria-hidden="true"
          className={`vm-marcador absolute -top-[3px] h-[9px] w-[9px] -translate-x-1/2 rounded-full border-2 border-cream ${colorMarcador}`}
          style={{ left: `${Math.min(99.2, pct)}%`, '--x': `${Math.min(99.2, pct)}%` }}
        />
      </div>
    </div>
  )
}
