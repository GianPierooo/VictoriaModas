// ============================================================
// Sistema unificado de notificaciones (toasts) — Victoria Modas
// ------------------------------------------------------------
// Paleta cream/ink/clay, apilables, auto-dismiss, accesibles
// (una sola live-region), y respeta prefers-reduced-motion (la capa de
// animación global neutraliza la duración).
//
// Uso:
//   const toast = useToast()
//   toast.success('Añadido al carrito', { action: { label: 'Ver carrito', onClick } })
//   toast.error('Código incorrecto')
//   toast.info('Mensaje enviado')
//
// Las acciones son callbacks (onClick), no enlaces de router, para que el
// provider pueda envolver toda la app sin depender del Router.
// ============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

const ToastContext = createContext(null)

const VARIANTS = {
  success: { accent: '#9C5F4E', Icon: CheckCircleIcon }, // clay
  error: { accent: '#B04A3F', Icon: ExclamationCircleIcon }, // rojo terroso, sin estridencias
  info: { accent: '#5B5150', Icon: InformationCircleIcon }, // ink-soft
}

const MAX_VISIBLE = 4
let seq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    const tm = timers.current.get(id)
    if (tm) {
      clearTimeout(tm)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (opts) => {
      const id = ++seq
      const toast = { id, variant: 'success', duration: 3600, ...opts }
      setToasts((list) => [...list, toast].slice(-MAX_VISIBLE))
      if (toast.duration > 0) {
        timers.current.set(id, setTimeout(() => dismiss(id), toast.duration))
      }
      return id
    },
    [dismiss]
  )

  // Limpieza de temporizadores al desmontar.
  useEffect(() => {
    const map = timers.current
    return () => map.forEach((tm) => clearTimeout(tm))
  }, [])

  const api = useMemo(
    () => ({
      notify: push,
      success: (message, opts) => push({ ...opts, message, variant: 'success' }),
      error: (message, opts) => push({ ...opts, message, variant: 'error' }),
      info: (message, opts) => push({ ...opts, message, variant: 'info' }),
      dismiss,
    }),
    [push, dismiss]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      className="pointer-events-none fixed inset-x-4 top-20 z-[60] flex flex-col items-stretch gap-2.5 sm:inset-x-auto sm:right-5 sm:w-96"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastCard({ toast, onDismiss }) {
  const v = VARIANTS[toast.variant] || VARIANTS.success
  const Icon = v.Icon
  return (
    <div className="animate-fadeInRight pointer-events-auto overflow-hidden rounded-xl bg-cream shadow-soft ring-1 ring-ink/10">
      <div className="flex items-start gap-3 p-4" style={{ borderLeft: `3px solid ${v.accent}` }}>
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: v.accent }} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          {toast.title && <p className="font-serif text-sm font-light text-ink">{toast.title}</p>}
          <p className="text-[13px] font-light leading-snug text-ink-soft">{toast.message}</p>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action.onClick?.()
                onDismiss(toast.id)
              }}
              className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] text-clay transition-colors hover:text-clay-dark"
            >
              {toast.action.label}
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Cerrar notificación"
          className="-mr-1 -mt-1 flex-shrink-0 rounded-md p-1 text-ink-muted transition-colors hover:text-ink"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
