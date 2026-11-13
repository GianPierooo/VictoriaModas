import { useEffect, useState } from 'react'
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { getAjuste, setAjuste } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { FREE_SHIPPING_THRESHOLD } from '../../utils/price.js'
import { PageHeader, btnPrimary, btnSecondary, inputClass, labelClass } from '../../components/admin/AdminUI.jsx'

const MAX_ANUNCIOS = 6
const MAX_LARGO = 70

export default function AdminAjustesPage() {
  useDocumentMeta({ title: 'Ajustes | Panel admin' })
  const toast = useToast()
  const [anuncios, setAnuncios] = useState(null)
  const [original, setOriginal] = useState('[]')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    getAjuste('anuncios')
      .then((v) => {
        const lista = Array.isArray(v) ? v : []
        setAnuncios(lista)
        setOriginal(JSON.stringify(lista))
      })
      .catch((e) => toast.error('No se pudo cargar: ' + e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cambiar = (i, texto) => setAnuncios((prev) => prev.map((a, j) => (j === i ? texto.slice(0, MAX_LARGO) : a)))
  const mover = (i, d) =>
    setAnuncios((prev) => {
      const n = [...prev]
      ;[n[i], n[i + d]] = [n[i + d], n[i]]
      return n
    })

  const guardar = async () => {
    const limpios = anuncios.map((a) => a.trim()).filter(Boolean)
    if (!limpios.length) {
      toast.error('Deja al menos un anuncio.')
      return
    }
    setGuardando(true)
    try {
      await setAjuste('anuncios', limpios)
      setAnuncios(limpios)
      setOriginal(JSON.stringify(limpios))
      toast.success('Anuncios publicados. Se ven en la web al recargar la página.')
    } catch (err) {
      toast.error('No se pudo guardar: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (anuncios === null) return <p className="text-ink-muted">Cargando…</p>
  const cambiado = JSON.stringify(anuncios) !== original

  return (
    <div className="max-w-3xl">
      <PageHeader title="Ajustes de la tienda" />

      <section className="rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10">
        <h2 className="mb-1 font-serif text-lg font-light text-ink">Barra de anuncios</h2>
        <p className="mb-5 text-sm font-light text-ink-soft">
          Los mensajes que rotan en la franja oscura de arriba de la web, cada 4 segundos. Máximo {MAX_ANUNCIOS}, de {MAX_LARGO} caracteres.
        </p>

        <div className="mb-4 space-y-3">
          {anuncios.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 text-right text-xs text-ink-muted">{i + 1}</span>
              <input
                type="text"
                value={a}
                onChange={(e) => cambiar(i, e.target.value)}
                aria-label={`Anuncio ${i + 1}`}
                className={inputClass}
              />
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="p-1 text-ink-muted hover:text-ink disabled:opacity-30">
                <ArrowUpIcon className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === anuncios.length - 1} aria-label="Bajar" className="p-1 text-ink-muted hover:text-ink disabled:opacity-30">
                <ArrowDownIcon className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setAnuncios((p) => p.filter((_, j) => j !== i))} aria-label="Quitar" className="p-1 text-ink-muted hover:text-red-500">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {anuncios.length < MAX_ANUNCIOS && (
          <button type="button" onClick={() => setAnuncios((p) => [...p, ''])} className={`mb-6 ${btnSecondary}`}>
            <PlusIcon className="h-4 w-4" />
            Agregar anuncio
          </button>
        )}

        <p className={labelClass}>Vista previa</p>
        <div className="mb-4 space-y-1 rounded-lg bg-ink px-4 py-3 text-center">
          {anuncios.filter((a) => a.trim()).map((a, i) => (
            <p key={i} className="text-[10px] font-light uppercase tracking-[0.2em] text-cream">{a}</p>
          ))}
        </div>
        <p className="mb-6 text-xs text-ink-muted">
          Ojo: el envío gratis real se calcula en el carrito con el monto fijo de S/ {FREE_SHIPPING_THRESHOLD}. Si lo mencionas en un anuncio, usa ese mismo monto.
        </p>

        <button type="button" onClick={guardar} disabled={!cambiado || guardando} className={btnPrimary}>
          {guardando ? 'Publicando…' : 'Publicar cambios'}
        </button>
      </section>
    </div>
  )
}
