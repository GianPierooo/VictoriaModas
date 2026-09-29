// ============================================================
// HeroCarrusel — carrusel de banners a pantalla completa (portada)
// ------------------------------------------------------------
// Banners 16:9 que ya traen su título (ver src/data/bannersHome.js), sin
// texto encima. Cada uno es un enlace a la prenda o a la categoría.
//  - Fundido entre slides (700 ms) — sin deslizamientos bruscos.
//  - Avanza solo cada 6 s; la barra de progreso de la barra inferior ES el
//    temporizador (si se pausa, se detiene también el avance).
//  - Se pausa con el mouse encima, con el foco dentro, con el botón de pausa
//    y siempre con "reducir movimiento" (nunca avanza solo).
//  - Flechas, puntos, flechas del teclado y deslizar con el dedo.
//  - Solo monta el slide actual y sus vecinos (no baja 8 imágenes de golpe);
//    el primero va con prioridad alta porque es el LCP de la portada.
// ============================================================
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline'
import { BANNERS_HOME, rutaBanner } from '../data/bannersHome.js'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'

const DURACION_MS = 6000
const UMBRAL_DESLIZAR_PX = 50

export default function HeroCarrusel() {
  const reducido = usePrefersReducedMotion()
  const n = BANNERS_HOME.length
  const [actual, setActual] = useState(0)
  const [pausadoPorClienta, setPausadoPorClienta] = useState(false)
  const [encima, setEncima] = useState(false) // mouse o foco dentro
  const [montados, setMontados] = useState([0, 1])
  const inicioX = useRef(null)
  const deslizo = useRef(false)

  const pausa = pausadoPorClienta || encima || reducido

  // Monta el slide actual y el siguiente (precarga sin bajar todo de golpe).
  useEffect(() => {
    const siguiente = (actual + 1) % n
    setMontados((prev) => [...new Set([...prev, actual, siguiente])])
  }, [actual, n])

  const ir = (i) => setActual(((i % n) + n) % n)
  const anterior = () => ir(actual - 1)
  const siguiente = () => ir(actual + 1)

  const alSoltar = (e) => {
    if (inicioX.current == null) return
    const dx = e.clientX - inicioX.current
    inicioX.current = null
    if (Math.abs(dx) >= UMBRAL_DESLIZAR_PX) {
      deslizo.current = true
      ir(actual + (dx < 0 ? 1 : -1))
    }
  }

  return (
    <section
      className="bg-cream pt-24 lg:pt-[6.5rem]"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Novedades de Victoria Modas"
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={() => setEncima(true)}
      onBlur={() => setEncima(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') anterior()
        if (e.key === 'ArrowRight') siguiente()
      }}
    >
      <h1 className="sr-only">Victoria Modas — Moda femenina, hecha en Perú</h1>

      <div
        className="relative aspect-[16/9] max-h-[calc(100vh-6.5rem)] w-full touch-pan-y overflow-hidden bg-cream-dark"
        onPointerDown={(e) => {
          inicioX.current = e.clientX
          deslizo.current = false
        }}
        onPointerUp={alSoltar}
        onPointerCancel={() => {
          inicioX.current = null
        }}
      >
        {BANNERS_HOME.map((b, i) => {
          const activo = i === actual
          return (
            <div
              key={b.archivo}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${n}`}
              aria-hidden={!activo}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${activo ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {montados.includes(i) && (
                <Link
                  to={b.to}
                  tabIndex={activo ? 0 : -1}
                  draggable={false}
                  onClickCapture={(e) => {
                    // Un deslizamiento con el dedo/mouse no cuenta como clic.
                    if (deslizo.current) {
                      e.preventDefault()
                      deslizo.current = false
                    }
                  }}
                  className="block h-full w-full"
                >
                  <img
                    src={rutaBanner(b.archivo)}
                    srcSet={`${rutaBanner(b.archivo, 900)} 900w, ${rutaBanner(b.archivo)} 1672w`}
                    sizes="100vw"
                    alt={b.alt}
                    width={1672}
                    height={941}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : undefined}
                    decoding="async"
                    draggable={false}
                    className="h-full w-full select-none object-cover"
                  />
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Barra de control debajo del banner (así no tapa el texto de la imagen) */}
      <div className="flex items-center justify-center gap-4 bg-cream px-4 py-4 sm:gap-6">
        <button
          type="button"
          onClick={anterior}
          aria-label="Banner anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/[0.28] text-ink-soft transition-colors hover:border-clay hover:text-clay cursor-pointer"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Elegir banner">
          {BANNERS_HOME.map((b, i) => {
            const activo = i === actual
            return (
              <button
                key={b.archivo}
                type="button"
                role="tab"
                aria-selected={activo}
                aria-label={`Ir al banner ${i + 1}`}
                onClick={() => ir(i)}
                className={`relative h-2 overflow-hidden rounded-full bg-ink/15 transition-[width] duration-300 cursor-pointer ${activo ? 'w-10' : 'w-2 hover:bg-ink/30'}`}
              >
                {activo && (
                  <span
                    key={actual}
                    className={`absolute inset-y-0 left-0 bg-ink ${reducido ? 'w-full' : 'vm-progreso'}`}
                    style={{ animationDuration: `${DURACION_MS}ms`, animationPlayState: pausa ? 'paused' : 'running' }}
                    onAnimationEnd={siguiente}
                  />
                )}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={siguiente}
          aria-label="Banner siguiente"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/[0.28] text-ink-soft transition-colors hover:border-clay hover:text-clay cursor-pointer"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>

        {!reducido && (
          <button
            type="button"
            onClick={() => setPausadoPorClienta((v) => !v)}
            aria-label={pausadoPorClienta ? 'Reanudar el carrusel' : 'Pausar el carrusel'}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-clay cursor-pointer"
          >
            {pausadoPorClienta ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
          </button>
        )}
      </div>
    </section>
  )
}
