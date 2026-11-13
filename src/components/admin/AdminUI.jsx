// Piezas de interfaz compartidas por las páginas del panel admin.
import { useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export const labelClass = 'mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted'
export const inputClass =
  'w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-clay focus:outline-none'
export const pillInputClass =
  'rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-clay focus:outline-none'
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-clay disabled:opacity-60'
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-ink disabled:opacity-60'
export const linkAction = 'text-xs uppercase tracking-wide text-clay hover:text-clay-dark'

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-luxe text-clay">Panel admin</p>
        <h1 className="font-serif text-3xl font-light text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-sm font-light text-ink-soft">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}

export function StatCard({ label, value, hint, tone = 'default' }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-soft ring-1 ring-ink/10">
      <p className="text-[10px] uppercase tracking-luxe text-ink-muted">{label}</p>
      <p className={`mt-2 font-serif text-2xl font-light ${tone === 'alerta' ? 'text-clay-dark' : 'text-ink'}`}>{value}</p>
      {hint && <p className="mt-1 text-xs font-light text-ink-muted">{hint}</p>}
    </div>
  )
}

export function Chip({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-ink/5 text-ink-soft',
    clay: 'bg-clay/10 text-clay-dark',
    alerta: 'bg-red-50 text-red-700',
    ok: 'bg-cream-dark text-ink',
  }
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${tones[tone]}`}>{children}</span>
}

// Panel lateral (en celular ocupa toda la pantalla). Cierra con Escape o clic afuera.
export function Drawer({ open, onClose, title, kicker, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink/10 px-6 py-5">
          <div className="min-w-0">
            {kicker && <p className="text-[10px] uppercase tracking-luxe text-clay">{kicker}</p>}
            <h2 className="truncate font-serif text-xl font-light text-ink">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-ink-muted hover:text-ink">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="border-t border-ink/10 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function Dato({ label, children }) {
  return (
    <>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="break-words text-ink">{children || '—'}</dd>
    </>
  )
}

export function TablaVacia({ cols, children }) {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-8 text-center text-ink-muted">
        {children}
      </td>
    </tr>
  )
}
