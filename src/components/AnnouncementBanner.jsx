import { useState, useEffect } from 'react'

export default function AnnouncementBanner() {
  const [current, setCurrent] = useState(0)

  const announcements = [
    "Envío gratis en compras mayores a S/ 200",
    "Nueva colección disponible",
    "Atención personalizada por WhatsApp",
  ]

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
