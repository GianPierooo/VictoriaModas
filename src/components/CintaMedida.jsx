// ============================================================
// CintaMedida — la medida (cintura / cadera) como una cinta métrica.
// ------------------------------------------------------------
// Diseñada en Figma ("Probador de tallas"): número grande en Bodoni que se
// puede escribir, botones −/+ (mantener presionado repite) y una cinta con
// marcas cada cm, cada 5 y cada 10 cm. Se arrastra con un <input range>
// invisible encima, así funciona con mouse, dedo y teclado (flechas) sin
// código de arrastre propio.
//
// Vacío (`valor === ''`) = aún sin tocar: marcador apagado y número en "—",
// para que no parezca una medida ya elegida (el botón "Ver mi talla" espera a
// que la clienta la fije).
// ============================================================
import { useEffect, useMemo, useRef, useState } from 'react'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

function BotonPaso({ etiqueta, glifo, onPaso }) {
  const timer = useRef(null)
  const intervalo = useRef(null)
  const parar = () => {
    clearTimeout(timer.current)
    clearInterval(intervalo.current)
  }
  useEffect(() => parar, [])
  const empezar = (e) => {
    if (e.button != null && e.button !== 0) return
    onPaso()
    timer.current = setTimeout(() => {
      intervalo.current = setInterval(onPaso, 70)
    }, 380)
  }
  return (
    <button
      type="button"
      aria-label={etiqueta}
      onPointerDown={empezar}
      onPointerUp={parar}
      onPointerLeave={parar}
      onPointerCancel={parar}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPaso()
        }
      }}
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-ink/[0.28] text-xl leading-none text-ink-soft transition-colors hover:border-clay hover:text-clay cursor-pointer select-none touch-manipulation"
    >
      {glifo}
    </button>
  )
}

export default function CintaMedida({ id, etiqueta, valor, onChange, min, max, defecto }) {
  const vacio = valor === ''
  const [arrastrando, setArrastrando] = useState(false)
  const numero = vacio ? defecto : clamp(Number(valor) || defecto, min, max)
  const pct = ((numero - min) / (max - min)) * 100
  const marcas = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max])

  // Los pasos leen el valor más reciente vía ref: al mantener presionado el
  // botón, el intervalo sigue corriendo con un cierre viejo de `valor`.
  const ultimo = useRef(numero)
  useEffect(() => {
    ultimo.current = numero
  }, [numero])
  const mover = (d) => {
    const siguiente = clamp(ultimo.current + d, min, max)
    ultimo.current = siguiente
    onChange(String(siguiente))
  }

  return (
    <div>
      <div className="mb-2.5 flex items-end justify-between gap-3">
        <label htmlFor={`${id}-num`} className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">
          {etiqueta}
        </label>
        <div className="flex items-baseline gap-1.5">
          <input
            id={`${id}-num`}
            type="number"
            inputMode="decimal"
            value={valor}
            placeholder="—"
            onChange={(e) => onChange(e.target.value)}
            className="w-[4.25rem] border-b border-transparent bg-transparent text-right font-serif text-[30px] font-light leading-[34px] text-ink [appearance:textfield] placeholder:text-ink-muted/40 hover:border-ink/20 focus:border-clay focus:outline-none sm:text-[34px] sm:leading-[38px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-xs text-ink-muted">cm</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <BotonPaso etiqueta={`Disminuir ${etiqueta.toLowerCase()}`} glifo="−" onPaso={() => mover(-1)} />

        <div className="relative h-[46px] min-w-0 flex-1 overflow-hidden rounded-[10px] border border-ink/[0.14] bg-cream-dark select-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-clay-light">
          {marcas.map((cm) => {
            const mayor = cm % 10 === 0
            const medio = cm % 5 === 0
            return (
              <span
                key={cm}
                aria-hidden="true"
                className={`absolute top-0 w-px ${mayor ? 'h-4 bg-ink-soft' : medio ? 'h-[11px] bg-ink-muted' : 'h-1.5 bg-ink-muted'}`}
                style={{ left: `${((cm - min) / (max - min)) * 100}%` }}
              />
            )
          })}
          {marcas
            .filter((cm) => cm % 10 === 0 && ((cm - min) / (max - min)) * 100 < 92)
            .map((cm) => (
              <span
                key={`l${cm}`}
                aria-hidden="true"
                className="absolute top-5 -translate-x-1/2 text-[9px] tracking-[0.04em] text-ink-muted"
                style={{ left: `${((cm - min) / (max - min)) * 100}%` }}
              >
                {cm}
              </span>
            ))}

          {/* marcador */}
          <span
            aria-hidden="true"
            className={`absolute inset-y-0 w-0.5 -translate-x-1/2 ${vacio ? 'bg-ink-muted/40' : 'bg-clay'}`}
            style={{ left: `${pct}%` }}
          />
          <span
            aria-hidden="true"
            className={`absolute bottom-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-[3px] border-cream transition-transform duration-150 ${
              vacio ? 'bg-ink-muted/50' : 'bg-clay'
            } ${arrastrando ? 'scale-[1.15]' : ''}`}
            style={{ left: `${pct}%` }}
          />

          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={numero}
            onChange={(e) => onChange(e.target.value)}
            onPointerDown={() => setArrastrando(true)}
            onPointerUp={() => setArrastrando(false)}
            onPointerCancel={() => setArrastrando(false)}
            onBlur={() => setArrastrando(false)}
            aria-label={`${etiqueta} en centímetros`}
            className="vm-cinta absolute inset-0 h-full w-full cursor-pointer opacity-0 touch-pan-y"
          />
        </div>

        <BotonPaso etiqueta={`Aumentar ${etiqueta.toLowerCase()}`} glifo="+" onPaso={() => mover(1)} />
      </div>
    </div>
  )
}
