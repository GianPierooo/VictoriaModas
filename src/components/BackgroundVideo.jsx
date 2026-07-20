import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'

// ============================================================
// BackgroundVideo — capa de video de fondo para secciones editoriales.
// ------------------------------------------------------------
// Replica el patrón del Hero pero pensado para secciones BAJO el pliegue:
//  · La imagen de la sección SIEMPRE queda debajo (es el poster/fallback).
//    Este componente solo pinta la capa de <video> encima.
//  · LAZY de verdad: no monta el video hasta que la sección entra en pantalla
//    (`active`, que el padre calcula con su IntersectionObserver) y además
//    tras el primer paint (requestIdleCallback). Así no compiten con el LCP
//    del hero ni se descargan de golpe al abrir la home.
//  · muted + loop + playsInline + autoPlay, preload="metadata".
//  · onError → se retira y queda la imagen (si el archivo no existe, nada
//    se rompe).
//  · prefers-reduced-motion → nunca se monta (se ve la imagen fija).
//
// Uso: dentro de un contenedor `relative` que ya tiene su <ResponsiveImage
// absolute inset-0> como base. Colocar <BackgroundVideo> justo después.
// ============================================================
export default function BackgroundVideo({
  mp4,
  webm,
  poster,
  active = true,
  objectClass = 'object-cover object-top',
  className = '',
}) {
  const reduced = usePrefersReducedMotion()
  const [showVideo, setShowVideo] = useState(false)
  const [failed, setFailed] = useState(false)

  // Arranca el montaje solo cuando la sección está en pantalla y en tiempo
  // ocioso (tras el primer paint). Si no hay requestIdleCallback, un pequeño
  // timeout hace de respaldo.
  useEffect(() => {
    if (reduced || !active || showVideo) return
    let idleId
    const start = () => setShowVideo(true)
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(start, { timeout: 1200 })
      return () => window.cancelIdleCallback?.(idleId)
    }
    const t = setTimeout(start, 400)
    return () => clearTimeout(t)
  }, [reduced, active, showVideo])

  if (reduced || failed || !showVideo || !mp4) return null

  return (
    <video
      className={`absolute inset-0 h-full w-full ${objectClass} ${className}`}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      onError={() => setFailed(true)}
      aria-hidden="true"
    >
      {webm && <source src={webm} type="video/webm" />}
      <source src={mp4} type="video/mp4" />
    </video>
  )
}
