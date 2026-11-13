import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const POR_DEFECTO = [
  'Envío gratis en compras mayores a S/ 60',
  'Nueva colección disponible',
  'Atención personalizada por WhatsApp',
]

// Los textos se editan en /admin/ajustes (tabla `ajustes`, clave "anuncios").
// Se piden una sola vez por visita y se comparten entre páginas.
let anunciosPromise = null
function cargarAnuncios() {
  if (!supabase) return Promise.resolve(POR_DEFECTO)
  anunciosPromise ||= supabase
    .from('ajustes')
    .select('valor')
    .eq('clave', 'anuncios')
    .maybeSingle()
    .then(({ data }) => {
      const lista = Array.isArray(data?.valor) ? data.valor.filter((t) => typeof t === 'string' && t.trim()) : []
      return lista.length ? lista : POR_DEFECTO
    })
    .catch(() => POR_DEFECTO)
  return anunciosPromise
}

export default function AnnouncementBanner() {
  const [current, setCurrent] = useState(0)
  const [announcements, setAnnouncements] = useState(POR_DEFECTO)

  useEffect(() => {
    let vivo = true
    cargarAnuncios().then((lista) => {
      if (!vivo) return
      setAnnouncements(lista)
      setCurrent(0)
    })
    return () => {
      vivo = false
    }
  }, [])

  // Rotación automática de anuncios
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [announcements.length])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-ink text-cream text-center py-2.5"
      role="banner"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* key dispara el fade suave en cada cambio de mensaje */}
        <p
          key={current}
          className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-light"
          style={{ animation: 'fadeIn 0.7s ease-out both' }}
        >
          {announcements[current]}
        </p>
      </div>
    </div>
  )
}
