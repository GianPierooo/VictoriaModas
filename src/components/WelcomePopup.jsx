// ============================================================
// WelcomePopup — ruleta (o cupón directo) de bienvenida
// ------------------------------------------------------------
// Se muestra UNA vez por navegador (localStorage), con un pequeño retraso.
// Si hay 2+ cupones activos con canal='ruleta' en Supabase, se juega la
// ruleta gamificada (giro único, todos los sectores del MISMO tamaño visual
// que su probabilidad real — nada de ruleta "trucada"). Si no hay cupones de
// ruleta configurados, cae al popup directo con el cupón BIENVENIDA* activo.
// Sin ninguno de los dos (o sin Supabase disponible), no muestra nada.
//
// Estética propia (cream/clay/ink) — sin el rojo/naranja de Shein/Temu.
// ============================================================
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'
import { obtenerCuponesRuleta, obtenerCuponBienvenida } from '../lib/cupones.js'
import { useToast } from '../context/ToastContext.jsx'

const SEEN_KEY = 'vm_welcome_popup_seen'
const DELAY_MS = 2200
const GIRO_MS = 3600 // duración del giro (ms) — debe ser >= la transición CSS del wheel
const SIN_PREMIO = { id: '__sin_premio__' }

// Paleta del wheel — alterna clay/cream/rose, nunca colores saturados.
const COLORES = ['#9C5F4E', '#F4EDE7', '#D7B3A8', '#FBF7F4', '#8A5340']

// Etiqueta corta para los sectores del wheel (sin punto final).
function etiquetaSector(cupon) {
  if (cupon.id === SIN_PREMIO.id) return 'Sigue intentando'
  if (cupon.tipo === 'porcentaje') return `${cupon.valor}% dcto.`
  if (cupon.tipo === 'monto_fijo') return `S/ ${cupon.valor} dcto.`
  return 'Envío gratis'
}

// Frase para el texto corrido ("llévate ___ en compras...") — sin punto
// final, porque la oración que la envuelve ya pone el suyo.
function fraseDescuento(cupon) {
  if (cupon.tipo === 'porcentaje') return `${cupon.valor}% de descuento`
  if (cupon.tipo === 'monto_fijo') return `S/ ${cupon.valor} de descuento`
  return 'envío gratis'
}

export default function WelcomePopup() {
  const [modo, setModo] = useState(null) // 'ruleta' | 'directo' | null
  const [cuponDirecto, setCuponDirecto] = useState(null)
  const [segmentos, setSegmentos] = useState([])
  const [open, setOpen] = useState(false)
  const [girando, setGirando] = useState(false)
  const [rotacion, setRotacion] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  // Decide qué mostrar (una sola vez por navegador).
  useEffect(() => {
    let alive = true
    let ya = false
    try {
      ya = localStorage.getItem(SEEN_KEY) === 'true'
    } catch {
      ya = true
    }
    if (ya) return

    const timer = setTimeout(async () => {
      const premios = await obtenerCuponesRuleta()
      if (!alive) return
      if (premios.length >= 2) {
        setSegmentos([...premios, SIN_PREMIO])
        setModo('ruleta')
        setOpen(true)
        return
      }
      const directo = await obtenerCuponBienvenida()
      if (!alive || !directo) return
      setCuponDirecto(directo)
      setModo('directo')
      setOpen(true)
    }, DELAY_MS)

    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [])

  // Marca "visto" apenas se abre — gane o no, no vuelve a insistir.
  useEffect(() => {
    if (!open) return
    try {
      localStorage.setItem(SEEN_KEY, 'true')
    } catch {
      /* sin storage disponible: seguirá apareciendo, no rompe nada */
    }
  }, [open])

  const cerrar = () => setOpen(false)

  const irAColeccion = () => {
    cerrar()
    navigate('/vestidos')
  }

  const copiarCodigo = async (codigo) => {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      toast.success('Código copiado.')
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error('No se pudo copiar — anótalo: ' + codigo)
    }
  }

  // ---------------------------------------------------------
  // Ruleta: cada sector ocupa el mismo ángulo, y la probabilidad de caer en
  // cada uno es la misma (1/N) — el tamaño visual SÍ es la probabilidad
  // real, nada de trucos.
  // ---------------------------------------------------------
  const anguloPorSector = segmentos.length ? 360 / segmentos.length : 0

  const girar = () => {
    if (girando || resultado || segmentos.length === 0) return
    setGirando(true)
    const idx = Math.floor(Math.random() * segmentos.length)
    const centroSector = idx * anguloPorSector + anguloPorSector / 2
    // 5 vueltas completas + el ángulo exacto para que el centro del sector
    // elegido quede bajo el puntero (fijo arriba, en 0°).
    const objetivo = 5 * 360 + (360 - centroSector)
    setRotacion(objetivo)
    setTimeout(() => {
      setResultado(segmentos[idx])
      setGirando(false)
    }, GIRO_MS)
  }

  const gradiente = segmentos
    .map((_, i) => `${COLORES[i % COLORES.length]} ${i * anguloPorSector}deg ${(i + 1) * anguloPorSector}deg`)
    .join(', ')

  return (
    <Dialog open={open} onClose={cerrar} className="relative z-[80]">
      <DialogBackdrop className="fixed inset-0 bg-ink/40 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative w-full max-w-sm rounded-2xl bg-cream p-8 text-center shadow-soft">
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-md p-1.5 text-ink-muted transition-colors hover:text-ink"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {modo === 'ruleta' && (
            <>
              <p className="mb-2 text-[11px] uppercase tracking-luxe text-clay">Bienvenida</p>
              <DialogTitle className="mb-6 font-serif text-2xl font-light leading-[1.15] text-ink">
                {resultado ? (resultado.id === SIN_PREMIO.id ? 'Casi...' : '¡Ganaste!') : 'Gira y llévate un descuento'}
              </DialogTitle>

              <div className="relative mx-auto mb-7 h-[220px] w-[220px]">
                {/* Puntero fijo (no rota) */}
                <div
                  className="absolute left-1/2 top-[-6px] z-10 h-0 w-0 -translate-x-1/2"
                  style={{ borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '14px solid #2B2424' }}
                  aria-hidden="true"
                />
                {/* Rueda */}
                <div
                  className="h-full w-full rounded-full ring-1 ring-ink/10"
                  style={{
                    background: `conic-gradient(${gradiente})`,
                    transform: `rotate(${rotacion}deg)`,
                    transition: girando ? 'transform 3.5s cubic-bezier(0.15, 0.65, 0.1, 1)' : 'none',
                  }}
                  data-testid="wheel"
                  data-rotation={rotacion}
                >
                  {segmentos.map((s, i) => (
                    <div
                      key={s.id}
                      className="absolute inset-0"
                      style={{ transform: `rotate(${i * anguloPorSector + anguloPorSector / 2}deg)` }}
                    >
                      <span
                        className="absolute left-1/2 top-[14px] -translate-x-1/2 whitespace-nowrap text-[10px] font-normal uppercase tracking-[0.06em]"
                        style={{ color: i % 2 === 0 ? '#FBF7F4' : '#2B2424' }}
                      >
                        {etiquetaSector(s)}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Centro decorativo (no rota) */}
                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" aria-hidden="true" />
              </div>

              {!resultado && (
                <button
                  type="button"
                  onClick={girar}
                  disabled={girando}
                  className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay disabled:opacity-60"
                >
                  {girando ? 'Girando…' : 'Girar la ruleta'}
                </button>
              )}

              {resultado && resultado.id !== SIN_PREMIO.id && (
                <>
                  <p className="mb-5 text-sm font-light leading-relaxed text-ink-soft">
                    Usa este código al finalizar tu pedido:
                  </p>
                  <button
                    type="button"
                    onClick={() => copiarCodigo(resultado.codigo)}
                    aria-label={`Copiar código ${resultado.codigo}`}
                    className="mb-5 flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-clay/40 bg-white px-5 py-4 transition-colors hover:border-clay"
                  >
                    <span className="font-serif text-xl font-light tracking-[0.08em] text-ink">{resultado.codigo}</span>
                    <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-clay">
                      {copiado ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                      {copiado ? 'Copiado' : 'Copiar'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={irAColeccion}
                    className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
                  >
                    Explorar la colección
                  </button>
                </>
              )}

              {resultado && resultado.id === SIN_PREMIO.id && (
                <>
                  <p className="mb-6 text-sm font-light leading-relaxed text-ink-soft">
                    Esta vez no hubo premio, pero igual te esperamos con toda la colección.
                  </p>
                  <button
                    type="button"
                    onClick={irAColeccion}
                    className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
                  >
                    Explorar la colección
                  </button>
                </>
              )}
            </>
          )}

          {modo === 'directo' && cuponDirecto && (
            <>
              <p className="mb-3 text-[11px] uppercase tracking-luxe text-clay">Bienvenida</p>
              <DialogTitle className="mb-3 font-serif text-3xl font-light leading-[1.1] text-ink">
                Un regalo para tu primera compra
              </DialogTitle>
              <p className="mb-7 text-sm font-light leading-relaxed text-ink-soft">
                Usa este código al finalizar tu pedido y llévate {fraseDescuento(cuponDirecto)}
                {cuponDirecto.monto_minimo > 0 ? ` en compras desde S/ ${cuponDirecto.monto_minimo}` : ''}.
              </p>
              <button
                type="button"
                onClick={() => copiarCodigo(cuponDirecto.codigo)}
                aria-label={`Copiar código ${cuponDirecto.codigo}`}
                className="mb-7 flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-clay/40 bg-white px-5 py-4 transition-colors hover:border-clay"
              >
                <span className="font-serif text-xl font-light tracking-[0.08em] text-ink">{cuponDirecto.codigo}</span>
                <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-clay">
                  {copiado ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                  {copiado ? 'Copiado' : 'Copiar'}
                </span>
              </button>
              <button
                type="button"
                onClick={irAColeccion}
                className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
              >
                Explorar la colección
              </button>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
