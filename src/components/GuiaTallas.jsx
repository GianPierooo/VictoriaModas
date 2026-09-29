// ============================================================
// GuiaTallas — probador de tallas + guía de medidas (modal)
// ------------------------------------------------------------
// Diseñado en Figma ("Victoria Modas — Probador de tallas") y llevado a
// código. Dos accesos junto al selector de talla de la página de producto:
//  - "¿Cuál es mi talla?" → probador: la clienta marca su cintura y su cadera
//    en una cinta métrica (el maniquí se ajusta en vivo), ve su MEJOR OPCIÓN,
//    en qué parte del rango de cada talla cae y puede "probar" las demás
//    tallas (cada una muestra cómo le calza por zona). Con medidas ya
//    guardadas en su dispositivo, el botón dice "Tu talla: M".
//  - "Guía de medidas" → las fichas informativas por talla que hizo el
//    dueño (ver src/data/guiasMedidas.js), como la ventana "Tallas y
//    medidas" de las tiendas grandes.
// Si la prenda no tiene ninguna de las dos cosas, no renderiza nada — se
// puede poner en CUALQUIER producto sin romper los que aún no tienen datos.
//
// Modos del probador (el dueño decide cuáles cargó por prenda):
//  - "medidas": cintura/cadera en cm — el preciso, con maniquí.
//  - "pesoAltura": altura/peso — estimación rápida, marcada como tal.
// ============================================================
import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon, SparklesIcon, CheckCircleIcon, TableCellsIcon } from '@heroicons/react/24/outline'
import TallaFitSilueta, { InsigniaNivel } from './TallaFitSilueta.jsx'
import CintaMedida from './CintaMedida.jsx'
import MedidorTalla from './MedidorTalla.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { getGuiasMedidas } from '../data/guiasMedidas.js'
import {
  fetchMedidasProducto,
  tieneGuiaDeTallas,
  tieneModoMedidas,
  tieneModoPesoAltura,
  recomendarPorMedidas,
  recomendarPorPesoAltura,
  nivelZona,
  etiquetaZona,
  textoDiferencia,
  leerPerfilProbador,
  guardarPerfilProbador,
  borrarPerfilProbador,
} from '../lib/tallas.js'

const WHATSAPP_NUMBER = '51994347405'

const inputClass =
  'w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-clay focus:outline-none'
const labelClass = 'block text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted'

// Rangos de la cinta (solo para deslizar; en el cuadro numérico se puede
// escribir cualquier valor razonable).
const RANGO_CINTURA = { min: 55, max: 115, defecto: 70 }
const RANGO_CADERA = { min: 75, max: 140, defecto: 95 }
// Límites de validación de lo que se escribe (evita datos absurdos).
const VALIDO_CINTURA = [40, 200]
const VALIDO_CADERA = [50, 220]

const medidaValida = (texto, [min, max]) => {
  if (texto === '') return false
  const n = Number(texto)
  return Number.isFinite(n) && n >= min && n <= max
}

const NIVEL_INSIGNIA = { ideal: 'ok', aceptable: 'aviso', no: 'mal' }
const TITULO_TALLA = { ideal: 'También sirve', aceptable: 'También sirve', no: 'No recomendada' }

const enlaceClass =
  'inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-clay underline decoration-clay/40 underline-offset-4 transition-colors hover:text-clay-dark cursor-pointer'
const enlaceSuaveClass =
  'whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-ink-muted underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink cursor-pointer'
const ctaClass =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full bg-ink px-8 py-[18px] xl:px-10 text-center text-xs font-medium uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed'

function PasoDots({ total, actual }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === actual ? 'w-[22px] bg-clay' : 'w-1.5 bg-ink/25'}`} />
      ))}
    </div>
  )
}

function Cabecera({ titulo, sub }) {
  return (
    <div className="flex flex-col gap-2">
      <DialogTitle className="font-serif text-[28px] font-light leading-[34px] text-ink sm:text-[34px] sm:leading-[40px]">{titulo}</DialogTitle>
      {sub && <p className="text-[13px] font-light leading-[19px] text-ink-soft sm:text-sm sm:leading-[21px]">{sub}</p>}
    </div>
  )
}

export default function GuiaTallas({
  productoId,
  nombreProducto = '',
  imagen = '',
  colorNombre = '',
  tallaActual = '',
  tallasDeshabilitadas = [],
  onElegirTalla,
  onTallaSugerida,
}) {
  const [filas, setFilas] = useState(null) // null = cargando; [] = sin datos
  const [abierto, setAbierto] = useState(false)
  const [vista, setVista] = useState('probador') // 'probador' | 'guia'
  const [paso, setPaso] = useState(0) // índice dentro de `pasos`
  const [modo, setModo] = useState(null) // 'medidas' | 'pesoAltura'
  const [cintura, setCintura] = useState('')
  const [cadera, setCadera] = useState('')
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [tono, setTono] = useState(1)
  const [tallaSel, setTallaSel] = useState(null) // talla que se está "probando" en el resultado
  const [tallaGuia, setTallaGuia] = useState('')
  const [comoMedir, setComoMedir] = useState(false)
  const [perfil, setPerfil] = useState(() => leerPerfilProbador())
  const esLg = useMediaQuery('(min-width: 1024px)')
  const altoEscenario = esLg ? 340 : 300

  useEffect(() => {
    let cancelado = false
    setFilas(null)
    fetchMedidasProducto(productoId).then((data) => {
      if (!cancelado) setFilas(data)
    })
    return () => {
      cancelado = true
    }
  }, [productoId])

  const guias = getGuiasMedidas(productoId)
  const tallasGuia = guias ? Object.keys(guias) : []
  const tieneProbador = !!filas && tieneGuiaDeTallas(filas)
  const hayMedidas = !!filas && tieneModoMedidas(filas)
  const hayPesoAltura = !!filas && tieneModoPesoAltura(filas)
  const hayAmbosModos = hayMedidas && hayPesoAltura
  const pasos = hayAmbosModos ? ['modo', 'datos', 'resultado'] : ['datos', 'resultado']

  // Talla que ya le corresponde a la clienta según lo guardado en su
  // dispositivo — personaliza el botón y marca la talla en el selector.
  const sugerida = useMemo(() => {
    if (!filas || !hayMedidas || !perfil?.cintura || !perfil?.cadera) return null
    return recomendarPorMedidas({ cintura: perfil.cintura, cadera: perfil.cadera }, filas).recomendada
  }, [filas, hayMedidas, perfil])
  const nombreSugerida = sugerida?.tallaNombre ?? null

  useEffect(() => {
    onTallaSugerida?.(nombreSugerida)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombreSugerida])

  if (!tieneProbador && !guias) return null

  const abrirProbador = () => {
    const p = leerPerfilProbador()
    setPerfil(p)
    setVista('probador')
    setTono(p?.tono ?? 1)
    setPeso('')
    setAltura('')
    setComoMedir(false)
    if (hayMedidas && p?.cintura && p?.cadera) {
      // Ya dejó sus medidas antes: directo a su resultado.
      const r = recomendarPorMedidas({ cintura: p.cintura, cadera: p.cadera }, filas)
      setModo('medidas')
      setCintura(String(p.cintura))
      setCadera(String(p.cadera))
      setTallaSel((r.recomendada || r.mejorAproximada)?.tallaNombre ?? null)
      setPaso(pasos.length - 1)
    } else {
      setModo(hayAmbosModos ? null : hayMedidas ? 'medidas' : 'pesoAltura')
      setCintura('')
      setCadera('')
      setTallaSel(null)
      setPaso(0)
    }
    setAbierto(true)
  }

  const abrirGuia = (talla) => {
    setTallaGuia(guias?.[talla] ? talla : guias?.[tallaActual] ? tallaActual : tallasGuia[0])
    setVista('guia')
    setAbierto(true)
  }

  const elegirModo = (m) => {
    setModo(m)
    setPaso(1)
  }

  const medidasOk = medidaValida(cintura, VALIDO_CINTURA) && medidaValida(cadera, VALIDO_CADERA)
  const pesoAlturaOk = peso.trim() !== '' && altura.trim() !== '' && Number(peso) > 0 && Number(altura) > 0
  const datosCompletos = modo === 'medidas' ? medidasOk : pesoAlturaOk

  const verResultado = () => {
    if (modo === 'medidas') {
      const c = Number(cintura)
      const h = Number(cadera)
      const r = recomendarPorMedidas({ cintura: c, cadera: h }, filas)
      setTallaSel((r.recomendada || r.mejorAproximada)?.tallaNombre ?? null)
      guardarPerfilProbador({ cintura: c, cadera: h, tono })
      setPerfil(leerPerfilProbador())
    }
    setPaso(pasos.length - 1)
  }

  const cambiarTono = (i) => {
    setTono(i)
    guardarPerfilProbador({ tono: i })
  }

  const editarMedidas = () => setPaso(pasos.length - 2)

  const borrarDatos = () => {
    borrarPerfilProbador()
    setPerfil(null)
    setCintura('')
    setCadera('')
    setTallaSel(null)
    setTono(1)
    setPaso(0)
  }

  const resultadoMedidas = modo === 'medidas' && medidasOk ? recomendarPorMedidas({ cintura: Number(cintura), cadera: Number(cadera) }, filas) : null
  const resultadoPesoAltura = modo === 'pesoAltura' && pesoAlturaOk ? recomendarPorPesoAltura({ peso: Number(peso), altura: Number(altura) }, filas) : null

  const pasoActual = pasos[paso]
  const enGuia = vista === 'guia'

  // ---- Resultado por medidas: talla que se está "probando" ----
  const candidatas = resultadoMedidas?.candidatas.filter((c) => c.gap != null) ?? []
  const esFallback = !!resultadoMedidas && !resultadoMedidas.recomendada
  const candSel =
    candidatas.find((c) => c.tallaNombre === tallaSel) ||
    resultadoMedidas?.recomendada ||
    resultadoMedidas?.mejorAproximada ||
    candidatas[0] ||
    null
  const esMejor = !!candSel && candSel.tallaNombre === resultadoMedidas?.recomendada?.tallaNombre
  const esCercana = esFallback && !!candSel && candSel.tallaNombre === resultadoMedidas?.mejorAproximada?.tallaNombre
  const tituloTalla = esMejor ? 'Mejor opción' : esCercana ? 'La más cercana' : TITULO_TALLA[candSel?.nivel] || 'Talla'
  const deshabilitada = !!candSel && tallasDeshabilitadas.includes(candSel.tallaNombre)

  const elegirTalla = () => {
    if (!candSel) return
    onElegirTalla?.(candSel.tallaNombre)
    setAbierto(false)
  }

  const mensajeWhatsApp = () => {
    const medidas = medidasOk ? ` Mis medidas: cintura ${cintura} cm, cadera ${cadera} cm.` : ''
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, quiero consultar por la talla de "${nombreProducto || 'una prenda'}".${medidas}`)}`
  }

  const botonProbador = (
    <button
      type="button"
      onClick={abrirProbador}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors cursor-pointer ${
        nombreSugerida ? 'border-clay/50 bg-clay/10 text-clay-dark hover:bg-clay/15' : 'border-clay/40 text-clay hover:bg-clay/5'
      }`}
    >
      {nombreSugerida ? <CheckCircleIcon className="h-3.5 w-3.5" /> : <SparklesIcon className="h-3.5 w-3.5" />}
      {nombreSugerida ? `Tu talla: ${nombreSugerida}` : '¿Cuál es mi talla?'}
    </button>
  )

  const botonCerrar = (
    <button
      type="button"
      onClick={() => setAbierto(false)}
      aria-label="Cerrar"
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-cream-dark text-ink-soft transition-colors hover:text-ink cursor-pointer"
    >
      <XMarkIcon className="h-4 w-4" />
    </button>
  )

  // Nota de privacidad + borrar (solo en el resultado por medidas)
  const notaGuardado = (
    <p className="max-w-[13rem] text-xs font-light leading-[17px] text-ink-muted xl:max-w-[16rem]">
      Tus medidas se guardan solo en este dispositivo.{' '}
      <button type="button" onClick={borrarDatos} className="underline decoration-ink/20 underline-offset-2 transition-colors hover:text-ink cursor-pointer">
        Borrar mis datos
      </button>
    </p>
  )

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1.5">
        {guias && (
          <button type="button" onClick={() => abrirGuia(tallaActual)} className={enlaceClass}>
            <TableCellsIcon className="h-3.5 w-3.5" />
            Guía de medidas
          </button>
        )}
        {tieneProbador && botonProbador}
      </div>

      <Dialog open={abierto} onClose={() => setAbierto(false)} className="relative z-[80]">
        <DialogBackdrop className="fixed inset-0 bg-ink/40 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6">
          <DialogPanel
            className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl bg-cream shadow-[0_24px_60px_rgba(43,36,36,0.22)] ring-1 ring-ink/[0.08] md:flex-row ${
              enGuia ? 'max-w-[560px]' : 'max-w-[1040px]'
            }`}
          >
            {/* ---- Foto de la prenda (el "probador") ---- */}
            {!enGuia && (
              <div className="relative hidden flex-shrink-0 bg-cream-dark md:block md:w-[26%] lg:w-[240px] xl:w-[280px]">
                {imagen && <ResponsiveImage src={imagen} alt={nombreProducto} className="h-full w-full object-cover object-top" loading="eager" />}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent px-6 pb-5 pt-16">
                  <p className="font-serif text-2xl font-light text-cream">{nombreProducto}</p>
                  {colorNombre && <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-cream/80">{colorNombre}</p>}
                </div>
              </div>
            )}

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6 pt-5 sm:px-10 sm:pb-8 sm:pt-[30px] lg:px-8 xl:px-10">
              <div className="flex items-center justify-between">
                {enGuia ? <span /> : <PasoDots total={pasos.length} actual={paso} />}
                {botonCerrar}
              </div>

              {/* ================= GUÍA DE MEDIDAS (fichas) ================= */}
              {enGuia && guias && (
                <div className="vm-paso flex flex-col items-center gap-4 text-center">
                  <DialogTitle className="font-serif text-[30px] font-light leading-[36px] text-ink sm:text-[32px]">Guía de medidas</DialogTitle>
                  <p className="-mt-2 text-[13px] font-light text-ink-soft">
                    {nombreProducto ? `${nombreProducto} · ` : ''}medidas de la prenda en plano, sin estirar.
                  </p>
                  <div className="flex justify-center gap-2.5">
                    {tallasGuia.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTallaGuia(t)}
                        aria-pressed={tallaGuia === t}
                        className={`h-10 w-14 rounded-full border text-sm uppercase tracking-[0.1em] transition-colors cursor-pointer ${
                          tallaGuia === t ? 'border-ink bg-ink text-cream' : 'border-ink/[0.28] text-ink-soft hover:border-ink'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <img
                    key={tallaGuia}
                    src={guias[tallaGuia]}
                    alt={`Guía de medidas talla ${tallaGuia}${nombreProducto ? ` — ${nombreProducto}` : ''}`}
                    className="vm-paso aspect-[4/5] w-full max-w-[400px] rounded-[14px] border border-ink/[0.14] object-cover"
                  />
                  {tieneProbador && (
                    <button type="button" onClick={abrirProbador} className={enlaceClass}>
                      <SparklesIcon className="h-3.5 w-3.5" />
                      ¿No sabes cuál elegir? Pruébalo en el probador
                    </button>
                  )}
                </div>
              )}

              {/* ================= PROBADOR ================= */}
              {!enGuia && (
                <div key={paso} className="vm-paso flex flex-1 flex-col gap-5">
                  {/* ---- Paso: elegir modo ---- */}
                  {pasoActual === 'modo' && (
                    <>
                      <Cabecera titulo="¿Cómo prefieres calcularla?" sub="Elige la opción que te resulte más fácil." />
                      <div className="max-w-md space-y-3">
                        <button
                          type="button"
                          onClick={() => elegirModo('medidas')}
                          className="w-full rounded-2xl border border-ink/15 bg-white px-5 py-4 text-left transition-colors hover:border-clay cursor-pointer"
                        >
                          <p className="text-sm font-medium text-ink">Tengo mis medidas exactas</p>
                          <p className="text-xs font-light text-ink-muted">Cintura y cadera en cm — más preciso.</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => elegirModo('pesoAltura')}
                          className="w-full rounded-2xl border border-ink/15 bg-white px-5 py-4 text-left transition-colors hover:border-clay cursor-pointer"
                        >
                          <p className="text-sm font-medium text-ink">No sé mis medidas exactas</p>
                          <p className="text-xs font-light text-ink-muted">Altura y peso — una estimación rápida.</p>
                        </button>
                      </div>
                    </>
                  )}

                  {/* ---- Paso: ingresar medidas ---- */}
                  {pasoActual === 'datos' && modo === 'medidas' && (
                    <>
                      <Cabecera titulo="Ajusta tus medidas" sub="Desliza la cinta o escribe tu cintura y tu cadera: el maniquí se ajusta a ti en vivo." />
                      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-[30px]">
                        <TallaFitSilueta
                          cintura={cintura === '' ? null : Number(cintura)}
                          cadera={cadera === '' ? null : Number(cadera)}
                          tono={tono}
                          onTono={cambiarTono}
                          alto={altoEscenario}
                        />
                        <div className="flex min-w-0 flex-col gap-5">
                          <CintaMedida id="cintura" etiqueta="Cintura" valor={cintura} onChange={setCintura} {...RANGO_CINTURA} />
                          <CintaMedida id="cadera" etiqueta="Cadera" valor={cadera} onChange={setCadera} {...RANGO_CADERA} />
                          <button
                            type="button"
                            onClick={() => setComoMedir((v) => !v)}
                            aria-expanded={comoMedir}
                            className={`${enlaceSuaveClass} self-start lg:hidden`}
                          >
                            ¿Cómo me mido?
                          </button>
                          <div className={`rounded-[14px] bg-cream-dark p-3 ${comoMedir ? 'block' : 'hidden lg:block'}`}>
                            <p className={`${labelClass} mb-1.5`}>¿Cómo me mido?</p>
                            <ul className="space-y-1 text-xs font-light leading-[17px] text-ink-soft">
                              <li>
                                <span className="font-medium text-ink">Cintura:</span> la parte más estrecha del torso, sin apretar la cinta.
                              </li>
                              <li>
                                <span className="font-medium text-ink">Cadera:</span> la parte más ancha, por encima de los glúteos.
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ---- Paso: altura y peso ---- */}
                  {pasoActual === 'datos' && modo === 'pesoAltura' && (
                    <>
                      <Cabecera titulo="Altura y peso" sub="Usamos esto solo para una estimación." />
                      <div className="grid max-w-xs grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="pa-altura" className={`${labelClass} mb-1.5`}>Altura (cm)</label>
                          <input id="pa-altura" type="number" inputMode="numeric" min="0" value={altura} onChange={(e) => setAltura(e.target.value)} className={inputClass} placeholder="162" />
                        </div>
                        <div>
                          <label htmlFor="pa-peso" className={`${labelClass} mb-1.5`}>Peso (kg)</label>
                          <input id="pa-peso" type="number" inputMode="numeric" min="0" value={peso} onChange={(e) => setPeso(e.target.value)} className={inputClass} placeholder="60" />
                        </div>
                      </div>
                    </>
                  )}

                  {pasoActual === 'datos' && (
                    <div className="mt-auto flex flex-col gap-4 pt-1 lg:flex-row lg:items-center lg:justify-between">
                      <div className="order-2 flex items-center justify-between gap-3 lg:order-1">
                        {hayAmbosModos ? (
                          <button type="button" onClick={() => setPaso(0)} className={enlaceSuaveClass}>
                            Atrás
                          </button>
                        ) : (
                          <p className="text-xs font-light text-ink-muted">Tus medidas se guardan solo en este dispositivo.</p>
                        )}
                      </div>
                      <button type="button" onClick={verResultado} disabled={!datosCompletos} className={`${ctaClass} order-1 lg:order-2`}>
                        Ver mi talla
                      </button>
                    </div>
                  )}

                  {/* ---- Paso: resultado por medidas ---- */}
                  {pasoActual === 'resultado' && modo === 'medidas' && resultadoMedidas && candSel && (
                    <>
                      <Cabecera
                        titulo={esFallback ? 'Tu talla más cercana' : 'Tu talla ideal'}
                        sub={`Con tu cintura de ${cintura} cm y tu cadera de ${cadera} cm.`}
                      />
                      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[408px_minmax(0,1fr)]">
                        <TallaFitSilueta
                          cintura={Number(cintura)}
                          cadera={Number(cadera)}
                          cinturaNivel={nivelZona(candSel.cinturaDet)}
                          caderaNivel={nivelZona(candSel.caderaDet)}
                          cinturaTexto={etiquetaZona(candSel.cinturaDet)}
                          caderaTexto={etiquetaZona(candSel.caderaDet)}
                          tono={tono}
                          onTono={cambiarTono}
                          alto={altoEscenario}
                          conEtiquetas
                        />

                        <div className="flex min-w-0 flex-col gap-3.5">
                          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-clay">{tituloTalla}</p>
                          <div className="flex items-center gap-4">
                            <div className="relative flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center rounded-[18px] border border-ink/[0.14] bg-white">
                              <span className="font-serif text-[46px] font-light leading-none text-ink">{candSel.tallaNombre}</span>
                              <span className="absolute -right-[5px] -top-[9px]">
                                <InsigniaNivel key={candSel.tallaNombre} nivel={NIVEL_INSIGNIA[candSel.nivel]} tam={24} />
                              </span>
                            </div>
                            <button type="button" onClick={editarMedidas} className={enlaceSuaveClass}>
                              Editar medidas
                            </button>
                          </div>

                          {esFallback && (
                            <p className="rounded-xl border border-ink/[0.14] bg-white px-3 py-3 text-xs font-light leading-[18px] text-ink-soft">
                              {resultadoMedidas.fueraDeRango === 'grande'
                                ? 'Esta prenda todavía no tiene una talla que te calce cómoda.'
                                : 'La talla más pequeña te quedaría muy suelta.'}{' '}
                              Escríbenos por WhatsApp y te ayudamos a encontrar una opción para ti.
                            </p>
                          )}

                          <div>
                            <p className="mb-2.5 text-xs font-light text-ink-muted">Pruébala también en otras tallas:</p>
                            <div className="flex flex-wrap gap-2.5">
                              {candidatas.map((c) => {
                                const sel = c.tallaNombre === candSel.tallaNombre
                                return (
                                  <button
                                    key={c.tallaId}
                                    type="button"
                                    onClick={() => setTallaSel(c.tallaNombre)}
                                    aria-pressed={sel}
                                    aria-label={`Talla ${c.tallaNombre}${c.nivel === 'ideal' ? ', calce ideal' : c.nivel === 'aceptable' ? ', calce aceptable' : ', no recomendada'}`}
                                    className={`relative h-10 w-14 rounded-full border text-sm uppercase tracking-[0.1em] transition-colors cursor-pointer ${
                                      sel ? 'border-ink bg-ink text-cream' : 'border-ink/[0.28] text-ink-soft hover:border-ink'
                                    }`}
                                  >
                                    {c.tallaNombre}
                                    <span className="absolute -right-1.5 -top-1.5">
                                      <InsigniaNivel nivel={NIVEL_INSIGNIA[c.nivel]} tam={16} />
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col gap-3">
                            <MedidorTalla
                              key={`c-${candSel.tallaNombre}`}
                              zona="Cintura"
                              valor={Number(cintura)}
                              tallas={candidatas.map((c) => ({ nombre: c.tallaNombre, rango: c.cinturaRango }))}
                              seleccionada={candSel.tallaNombre}
                              texto={textoDiferencia(candSel.cinturaDet, candSel.tallaNombre, candSel.cinturaRango)}
                            />
                            <MedidorTalla
                              key={`h-${candSel.tallaNombre}`}
                              zona="Cadera"
                              valor={Number(cadera)}
                              tallas={candidatas.map((c) => ({ nombre: c.tallaNombre, rango: c.caderaRango }))}
                              seleccionada={candSel.tallaNombre}
                              texto={textoDiferencia(candSel.caderaDet, candSel.tallaNombre, candSel.caderaRango)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col gap-4 pt-1 lg:flex-row lg:items-center lg:justify-between">
                        <div className="order-3 lg:order-1">{notaGuardado}</div>
                        <div className="order-1 flex flex-col-reverse gap-3.5 lg:order-2 lg:flex-row lg:items-center lg:gap-[22px]">
                          {guias?.[candSel.tallaNombre] && (
                            <button type="button" onClick={() => abrirGuia(candSel.tallaNombre)} className={`${enlaceClass} self-center`}>
                              Ver guía de la talla {candSel.tallaNombre}
                            </button>
                          )}
                          {esFallback ? (
                            <a href={mensajeWhatsApp()} target="_blank" rel="noopener noreferrer" className={ctaClass}>
                              Escribir por WhatsApp
                            </a>
                          ) : (
                            <button type="button" onClick={elegirTalla} disabled={deshabilitada} className={ctaClass}>
                              {deshabilitada ? 'Talla no disponible' : `Elegir talla ${candSel.tallaNombre}`}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ---- Paso: resultado por peso/altura ---- */}
                  {pasoActual === 'resultado' && modo === 'pesoAltura' && resultadoPesoAltura && (
                    <div className="max-w-sm">
                      <Cabecera titulo={resultadoPesoAltura.recomendadas.length > 0 ? 'Talla estimada' : 'Sin talla estimada'} />
                      {resultadoPesoAltura.recomendadas.length > 0 ? (
                        <>
                          <p className="my-4 font-serif text-5xl font-light text-ink">{resultadoPesoAltura.recomendadas.map((r) => r.tallaNombre).join(' o ')}</p>
                          <p className="mb-6 text-xs font-light leading-relaxed text-ink-muted">
                            Estimado a partir de tu altura y peso. Para mayor precisión, prueba con tus medidas exactas.
                          </p>
                        </>
                      ) : (
                        <p className="my-4 text-sm font-light leading-relaxed text-ink-muted">
                          No encontramos una talla estimada para ti. Prueba con tus medidas exactas, o escríbenos por WhatsApp.
                        </p>
                      )}
                      <button type="button" onClick={editarMedidas} className={enlaceSuaveClass}>
                        Volver a intentar
                      </button>
                    </div>
                  )}

                  {pasoActual === 'resultado' && !candSel && !resultadoPesoAltura && (
                    <div>
                      <Cabecera titulo="Aún no tenemos suficientes datos" />
                      <button type="button" onClick={editarMedidas} className={`${enlaceSuaveClass} mt-4`}>
                        Volver
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
