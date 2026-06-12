// Pantalla de carga para el <Suspense> del code-splitting por ruta.
// Fondo cream con el nombre tipográfico centrado y un pulso sutil
// (solo si el usuario no prefiere movimiento reducido).
export default function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="motion-safe:animate-pulse-soft text-center">
        <p className="font-serif text-2xl font-light tracking-wide text-ink">
          Victoria<span className="italic text-clay">Modas</span>
        </p>
        <span className="mt-2 block text-[10px] uppercase tracking-luxe text-ink-muted">
          Cargando
        </span>
      </div>
    </div>
  )
}
