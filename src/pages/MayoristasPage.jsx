// ============================================================
// /mayoristas — Catálogo PRIVADO de mayoreo
// ------------------------------------------------------------
// Ruta NO enlazada (ni Header, ni Footer, ni sitemap). El dueño la comparte a
// mano. Se protege con un código verificado SERVER-SIDE en /api/mayoreo.
//
// Seguridad en el cliente:
//  · El código se guarda SOLO en estado de React (memoria), nunca en
//    localStorage.
//  · Los precios de mayoreo llegan únicamente en la respuesta de /api/mayoreo
//    tras validar el código; no hay ningún precio hardcodeado en el bundle.
//  · <meta name="robots" content="noindex,nofollow"> mientras se ve la vista
//    (se quita al salir para no afectar el resto del sitio).
// ============================================================
import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import ResponsiveImage from '../components/ResponsiveImage.jsx'
import { PRODUCTS, getProductById } from '../data/products.js'
import { COLOR_HEX } from '../utils/colorMap.js'
import { estadoStyle } from '../hooks/useStock.js'
import { registerOrder } from '../utils/orderUtils.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

const WHATSAPP_NUMBER = '51993357672'
const keyOf = (id, color, talla) => `${id}|${color}|${talla}`
const fmtPEN = (n) => `S/ ${n}`
const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`

export default function MayoristasPage() {
  useDocumentMeta({ title: 'Mayoristas | Victoria Modas' })

  // noindex solo para esta vista; se retira al desmontar.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex,nofollow'
    document.head.appendChild(meta)
    return () => {
      if (meta.parentNode) meta.parentNode.removeChild(meta)
    }
  }, [])

  // 'locked' | 'checking' | 'error' | 'unlocked'
  const [status, setStatus] = useState('locked')
  const [code, setCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [items, setItems] = useState([])
  const [qty, setQty] = useState({})
  const [telefono, setTelefono] = useState('')

  async function submitCode(e) {
    e.preventDefault()
    if (!code.trim()) return
    setStatus('checking')
    setErrorMsg('')
    try {
      const res = await fetch('/api/mayoreo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      if (res.status === 401) {
        setStatus('error')
        setErrorMsg('Código incorrecto. Verifica con Victoria Modas.')
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(Array.isArray(data.items) ? data.items : [])
      setStatus('unlocked')
    } catch {
      setStatus('error')
      setErrorMsg('No se pudo verificar ahora. Intenta de nuevo.')
    }
  }

  // Agrupa las variantes por producto, en el orden del catálogo.
  const grouped = useMemo(() => {
    if (status !== 'unlocked') return []
    const byId = new Map()
    for (const it of items) {
      if (!byId.has(it.id)) byId.set(it.id, [])
      byId.get(it.id).push(it)
    }
    return PRODUCTS.filter((p) => byId.has(p.id)).map((p) => ({
      product: p,
      variants: byId.get(p.id),
    }))
  }, [items, status])

  const setQuantity = (id, color, talla, value) => {
    const n = Math.max(0, Math.floor(Number(value) || 0))
    setQty((prev) => ({ ...prev, [keyOf(id, color, talla)]: n }))
  }

  // Líneas seleccionadas (qty > 0).
  const orderLines = useMemo(() => {
    const lines = []
    for (const it of items) {
      const q = qty[keyOf(it.id, it.color, it.talla)] || 0
      if (q > 0) {
        const p = getProductById(it.id)
        lines.push({
          id: it.id,
          name: p ? p.name : it.id,
          color: it.color,
          talla: it.talla,
          price: it.precioMayorPEN,
          qty: q,
        })
      }
    }
    return lines
  }, [items, qty])

  const totalUnidades = orderLines.reduce((s, l) => s + l.qty, 0)
  const totalPEN = orderLines.reduce((s, l) => s + (l.price ? l.price * l.qty : 0), 0)

  const buildMessage = () => {
    let m = '*Pedido mayorista — Victoria Modas*\n\n'
    orderLines.forEach((l, i) => {
      m += `${i + 1}. *${l.name}* (${l.color} / ${l.talla}) x${l.qty}`
      if (l.price) m += ` — ${fmtPEN(l.price)} c/u = ${fmtPEN(l.price * l.qty)}`
      m += '\n'
    })
    m += `\n*Total: ${totalUnidades} u.`
    if (totalPEN) m += ` — ${fmtPEN(totalPEN)}`
    m += '*\n\nQuedo atenta para coordinar pago y envío.'
    return m
  }

  const enviarPedido = () => {
    if (orderLines.length === 0) return
    // Opcional: registrar el pedido con canal "mayor" (solo si dejó teléfono).
    if (telefono.trim()) {
      const itemsStr = orderLines
        .map((l) => `${l.qty}× ${l.name} (${l.color}/${l.talla})${l.price ? ` @${fmtPEN(l.price)}` : ''}`)
        .join('; ')
      registerOrder({
        canal: 'mayor',
        cliente: '',
        telefono: telefono.trim(),
        items: itemsStr,
        total: totalPEN || totalUnidades,
      })
    }
    window.open(waLink(buildMessage()), '_blank')
  }

  // ---------- Pantalla de acceso ----------
  if (status !== 'unlocked') {
    return (
      <Layout>
        <div className="bg-white">
          <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-20 lg:px-8">
            <div className="text-center">
              <p className="hero-line mb-4 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
                Acceso mayoristas
              </p>
              <h1 className="hero-line mb-5 font-serif text-5xl font-light leading-[1.05] text-ink" style={{ animationDelay: '0.16s' }}>
                Canal de mayoreo
              </h1>
              <p className="hero-line mb-10 font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.28s' }}>
                Sección privada para clientas mayoristas. Ingresa tu código de acceso para ver
                precios por mayor y disponibilidad.
              </p>
            </div>

            <form onSubmit={submitCode} className="space-y-4">
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código de acceso"
                autoComplete="off"
                className="w-full rounded-full border border-ink/20 bg-transparent px-6 py-4 text-center text-ink placeholder:text-ink-muted/50 focus:border-clay focus:outline-none"
              />
              {status === 'error' && (
                <p className="text-center text-sm text-red-400">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'checking'}
                className="block w-full rounded-full bg-ink py-4 text-center text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay disabled:opacity-60"
              >
                {status === 'checking' ? 'Verificando…' : 'Entrar'}
              </button>
            </form>

            <p className="mt-10 text-center text-xs font-light text-ink-muted">
              ¿No tienes código?{' '}
              <a
                href={waLink('Hola, me interesa el catálogo de mayoreo de Victoria Modas.')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-clay underline-offset-2 hover:underline"
              >
                Escríbenos por WhatsApp
              </a>
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  // ---------- Catálogo mayorista ----------
  return (
    <Layout>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="mb-14">
            <p className="hero-line mb-4 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
              Mayoristas · confidencial
            </p>
            <h1 className="hero-line font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl" style={{ animationDelay: '0.14s' }}>
              Catálogo de mayoreo
            </h1>
            <p className="hero-line mt-5 max-w-2xl font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.24s' }}>
              Precios por mayor y disponibilidad en vivo. Elige cantidades por color y talla, y
              envíanos el pedido por WhatsApp.
            </p>
          </div>

          {grouped.length === 0 ? (
            <div className="rounded-lg bg-cream p-8 text-center">
              <p className="font-light text-ink-soft">
                Aún no hay productos habilitados para mayoreo.{' '}
                <a
                  href={waLink('Hola, quiero consultar el catálogo de mayoreo.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-clay hover:underline"
                >
                  Escríbenos por WhatsApp
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-12 pb-32">
              {grouped.map(({ product, variants }) => (
                <section key={product.id} className="border-b border-ink/10 pb-12">
                  <div className="mb-7 flex items-center gap-6">
                    <div className="aspect-[3/4] w-24 flex-shrink-0 overflow-hidden rounded-xl bg-cream-dark md:w-28">
                      <ResponsiveImage
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-top"
                        loading="lazy"
                        width={200}
                        height={266}
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-[10px] uppercase tracking-luxe text-clay">{product.category}</p>
                      <h2 className="font-serif text-2xl font-light leading-tight text-ink md:text-3xl">{product.name}</h2>
                      <p className="mt-1.5 text-sm font-light text-ink-muted">{product.fabric}</p>
                    </div>
                  </div>

                  {/* Variantes */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-luxe text-ink-muted">
                          <th className="pb-3 pr-4 font-normal">Color</th>
                          <th className="pb-3 pr-4 font-normal">Talla</th>
                          <th className="pb-3 pr-4 font-normal">Disponibilidad</th>
                          <th className="pb-3 pr-4 font-normal">Precio mayor</th>
                          <th className="pb-3 font-normal">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v) => {
                          const est = estadoStyle(v.estado)
                          const k = keyOf(v.id, v.color, v.talla)
                          return (
                            <tr key={k} className="border-t border-ink/5">
                              <td className="py-3 pr-4">
                                <span className="flex items-center gap-2">
                                  <span
                                    className="inline-block h-4 w-4 flex-shrink-0 rounded-full border border-ink/15"
                                    style={{ backgroundColor: COLOR_HEX[v.color] || '#CCCCCC' }}
                                    aria-hidden="true"
                                  />
                                  <span className="text-ink">{v.color}</span>
                                </span>
                              </td>
                              <td className="py-3 pr-4 uppercase tracking-[0.1em] text-ink-soft">{v.talla}</td>
                              <td className="py-3 pr-4">
                                {est ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: est.color }}>
                                    <span
                                      className="inline-block h-1.5 w-1.5 rounded-full"
                                      style={{ backgroundColor: est.dot }}
                                      aria-hidden="true"
                                    />
                                    {est.label}
                                  </span>
                                ) : (
                                  <span className="text-xs text-ink-muted">—</span>
                                )}
                              </td>
                              <td className="py-3 pr-4 text-ink">
                                {v.precioMayorPEN ? fmtPEN(v.precioMayorPEN) : <span className="text-ink-muted">A consultar</span>}
                              </td>
                              <td className="py-3">
                                <input
                                  type="number"
                                  min="0"
                                  inputMode="numeric"
                                  value={qty[k] || ''}
                                  onChange={(e) => setQuantity(v.id, v.color, v.talla, e.target.value)}
                                  placeholder="0"
                                  disabled={v.estado === 'agotado'}
                                  className="w-20 rounded-md border border-ink/20 bg-transparent px-3 py-2 text-ink focus:border-clay focus:outline-none disabled:opacity-40"
                                />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Barra de pedido (aparece al elegir cantidades) */}
        {orderLines.length > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-cream/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="text-sm text-ink">
                <span className="font-medium">{totalUnidades}</span> unidades
                {totalPEN > 0 && (
                  <>
                    {' '}·{' '}
                    <span className="font-medium">{fmtPEN(totalPEN)}</span>
                  </>
                )}
                <span className="ml-1 text-ink-muted">en {orderLines.length} variante(s)</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Tu WhatsApp (opcional)"
                  className="rounded-full border border-ink/20 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-clay focus:outline-none"
                />
                <button
                  type="button"
                  onClick={enviarPedido}
                  className="rounded-full bg-ink px-8 py-3 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
                >
                  Enviar pedido por WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
