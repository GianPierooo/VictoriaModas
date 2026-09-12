// ============================================================
// GuiaTallas — guía de tallas inteligente (modal, multi-paso)
// ------------------------------------------------------------
// Trigger + modal completo, autocontenido: si la prenda no tiene guía de
// tallas cargada en /admin, este componente no renderiza nada (ver
// tieneGuiaDeTallas) — así se puede poner en CUALQUIER producto sin
// romper los que todavía no tienen medidas.
//
// Dos modos (el dueño decide cuáles cargó por prenda):
//  - "medidas": cintura/cadera en cm — resultado con silueta visual
//    (TallaFitSilueta), el modo preciso.
//  - "pesoAltura": altura/peso — resultado simple, siempre marcado como
//    estimado (nunca se presenta como igual de preciso).
// ============================================================
import { useEffect, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'
import TallaFitSilueta from './TallaFitSilueta.jsx'
import {
  fetchMedidasProducto,
  tieneGuiaDeTallas,
  tieneModoMedidas,
  tieneModoPesoAltura,
  recomendarPorMedidas,
  recomendarPorPesoAltura,
} from '../lib/tallas.js'

const inputClass =
  'w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-clay focus:outline-none'
const labelClass = 'mb-1.5 block text-[11px] uppercase tracking-luxe text-ink-muted'

function PasoDots({ total, actual }) {
  return (
    <div className="mb-5 flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${i === actual ? 'w-5 bg-clay' : 'w-1.5 bg-ink/15'}`}
        />
      ))}
    </div>
  )
}

export default function GuiaTallas({ productoId }) {
  const [filas, setFilas] = useState(null) // null = cargando; [] = sin datos
  const [abierto, setAbierto] = useState(false)
  const [paso, setPaso] = useState(0) // índice dentro de `pasos`
  const [modo, setModo] = useState(null) // 'medidas' | 'pesoAltura'
  const [cintura, setCintura] = useState('')
  const [cadera, setCadera] = useState('')
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')

  useEffect(() => {
    let cancelado = false
    fetchMedidasProducto(productoId).then((data) => {
      if (!cancelado) setFilas(data)
    })
    return () => {
      cancelado = true
    }
  }, [productoId])

  if (!filas || !tieneGuiaDeTallas(filas)) return null

  const hayMedidas = tieneModoMedidas(filas)
  const hayPesoAltura = tieneModoPesoAltura(filas)
  const hayAmbosModos = hayMedidas && hayPesoAltura
  const pasos = hayAmbosModos ? ['modo', 'datos', 'resultado'] : ['datos', 'resultado']

  const abrir = () => {
    setPaso(0)
    setModo(hayAmbosModos ? null : hayMedidas ? 'medidas' : 'pesoAltura')
    setCintura('')
    setCadera('')
    setPeso('')
    setAltura('')
    setAbierto(true)
  }

  const elegirModo = (m) => {
    setModo(m)
    setPaso(1)
  }

  const datosCompletos =
    modo === 'medidas' ? cintura.trim() !== '' && cadera.trim() !== '' : peso.trim() !== '' && altura.trim() !== ''

  const verResultado = () => setPaso(pasos.length - 1)

  const resultadoMedidas =
    modo === 'medidas' && datosCompletos ? recomendarPorMedidas({ cintura: Number(cintura), cadera: Number(cadera) }, filas) : null
  const resultadoPesoAltura =
    modo === 'pesoAltura' && datosCompletos ? recomendarPorPesoAltura({ peso: Number(peso), altura: Number(altura) }, filas) : null

  const pasoActual = pasos[paso]

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-clay underline decoration-clay/40 underline-offset-4 transition-colors hover:text-clay-dark cursor-pointer"
      >
        <SparklesIcon className="h-3.5 w-3.5" />
        ¿Cuál es mi talla?
      </button>

      <Dialog open={abierto} onClose={() => setAbierto(false)} className="relative z-[80]">
        <DialogBackdrop className="fixed inset-0 bg-ink/40 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="relative w-full max-w-sm rounded-2xl bg-cream p-8 shadow-soft">
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 rounded-md p-1.5 text-ink-muted transition-colors hover:text-ink cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <PasoDots total={pasos.length} actual={paso} />

            {/* ---- Paso: elegir modo ---- */}
            {pasoActual === 'modo' && (
              <div className="text-center">
                <DialogTitle className="mb-1 font-serif text-xl font-light text-ink">¿Cómo prefieres calcularla?</DialogTitle>
                <p className="mb-6 text-xs font-light text-ink-muted">Elige la opción que te resulte más fácil.</p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => elegirModo('medidas')}
                    className="w-full rounded-xl border border-ink/15 px-5 py-4 text-left transition-colors hover:border-clay cursor-pointer"
                  >
                    <p className="text-sm font-medium text-ink">Tengo mis medidas exactas</p>
                    <p className="text-xs font-light text-ink-muted">Cintura y cadera en cm — más preciso.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => elegirModo('pesoAltura')}
                    className="w-full rounded-xl border border-ink/15 px-5 py-4 text-left transition-colors hover:border-clay cursor-pointer"
                  >
                    <p className="text-sm font-medium text-ink">No sé mis medidas exactas</p>
                    <p className="text-xs font-light text-ink-muted">Altura y peso — una estimación rápida.</p>
                  </button>
                </div>
              </div>
            )}

            {/* ---- Paso: ingresar datos ---- */}
            {pasoActual === 'datos' && (
              <div>
                <DialogTitle className="mb-1 text-center font-serif text-xl font-light text-ink">
                  {modo === 'medidas' ? 'Tus medidas' : 'Altura y peso'}
                </DialogTitle>
                <p className="mb-6 text-center text-xs font-light text-ink-muted">
                  {modo === 'medidas'
                    ? 'Mide sobre tu cuerpo, sin apretar la cinta.'
                    : 'Usamos esto solo para una estimación — la web nunca guarda estos datos.'}
                </p>

                {modo === 'medidas' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Cintura (cm)</label>
                      <input type="number" inputMode="numeric" min="0" value={cintura} onChange={(e) => setCintura(e.target.value)} className={inputClass} placeholder="70" />
                    </div>
                    <div>
                      <label className={labelClass}>Cadera (cm)</label>
                      <input type="number" inputMode="numeric" min="0" value={cadera} onChange={(e) => setCadera(e.target.value)} className={inputClass} placeholder="96" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Altura (cm)</label>
                      <input type="number" inputMode="numeric" min="0" value={altura} onChange={(e) => setAltura(e.target.value)} className={inputClass} placeholder="162" />
                    </div>
                    <div>
                      <label className={labelClass}>Peso (kg)</label>
                      <input type="number" inputMode="numeric" min="0" value={peso} onChange={(e) => setPeso(e.target.value)} className={inputClass} placeholder="60" />
                    </div>
                  </div>
                )}

                <div className="mt-7 flex items-center justify-between gap-3">
                  {hayAmbosModos ? (
                    <button type="button" onClick={() => setPaso(0)} className="text-xs uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink cursor-pointer">
                      Atrás
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={verResultado}
                    disabled={!datosCompletos}
                    className="rounded-full bg-ink px-7 py-3 text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-clay disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Ver mi talla
                  </button>
                </div>
              </div>
            )}

            {/* ---- Paso: resultado ---- */}
            {pasoActual === 'resultado' && modo === 'medidas' && resultadoMedidas && (
              <div className="text-center">
                {resultadoMedidas.recomendada ? (
                  <>
                    <p className="mb-1 text-[11px] uppercase tracking-luxe text-clay">Talla recomendada</p>
                    <p className="mb-5 font-serif text-4xl font-light text-ink">{resultadoMedidas.recomendada.tallaNombre}</p>
                    <TallaFitSilueta
                      cinturaEstado={resultadoMedidas.recomendada.cinturaEstado}
                      caderaEstado={resultadoMedidas.recomendada.caderaEstado}
                    />
                  </>
                ) : resultadoMedidas.fueraDeRango === 'grande' ? (
                  <>
                    <p className="mb-2 font-serif text-lg font-light text-ink">
                      Esta prenda todavía no tiene tu talla disponible
                    </p>
                    <p className="mb-6 text-xs font-light leading-relaxed text-ink-muted">
                      Escríbenos por WhatsApp y te avisamos apenas tengamos una opción para ti.
                    </p>
                    <a
                      href="https://wa.me/51994347405"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full bg-ink px-7 py-3 text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-clay"
                    >
                      Escribir por WhatsApp
                    </a>
                  </>
                ) : (
                  <p className="text-sm font-light text-ink-muted">Aún no tenemos suficientes datos para esta prenda.</p>
                )}
                <button type="button" onClick={() => setPaso(hayAmbosModos ? 1 : 0)} className="mt-6 text-xs uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink cursor-pointer">
                  Volver a intentar
                </button>
              </div>
            )}

            {pasoActual === 'resultado' && modo === 'pesoAltura' && resultadoPesoAltura && (
              <div className="text-center">
                {resultadoPesoAltura.recomendadas.length > 0 ? (
                  <>
                    <p className="mb-1 text-[11px] uppercase tracking-luxe text-clay">Talla estimada</p>
                    <p className="mb-2 font-serif text-4xl font-light text-ink">
                      {resultadoPesoAltura.recomendadas.map((r) => r.tallaNombre).join(' o ')}
                    </p>
                    <p className="mb-6 text-xs font-light leading-relaxed text-ink-muted">
                      Estimado a partir de tu altura y peso. Para mayor precisión, prueba con tus medidas exactas.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-2 font-serif text-lg font-light text-ink">No encontramos una talla estimada para ti</p>
                    <p className="mb-6 text-xs font-light leading-relaxed text-ink-muted">
                      Prueba con tus medidas exactas, o escríbenos por WhatsApp.
                    </p>
                  </>
                )}
                <button type="button" onClick={() => setPaso(hayAmbosModos ? 1 : 0)} className="text-xs uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink cursor-pointer">
                  Volver a intentar
                </button>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
