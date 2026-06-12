import { useEffect } from 'react'

// Actualiza una etiqueta <meta> existente o la crea si no existe.
function setMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Hook de SEO por ruta para esta SPA: actualiza el título del documento, la
 * meta description y, en espejo, los títulos/descripciones de Open Graph y
 * Twitter. Opcionalmente inyecta un bloque JSON-LD que se limpia al desmontar.
 *
 * @param {object} opts
 * @param {string} opts.title        Título de la pestaña/página.
 * @param {string} [opts.description] Meta description.
 * @param {object} [opts.jsonLd]     Objeto JSON-LD (memorízalo en el caller).
 */
export function useDocumentMeta({ title, description, jsonLd } = {}) {
  useEffect(() => {
    if (title) {
      document.title = title
      setMeta('property', 'og:title', title)
      setMeta('name', 'twitter:title', title)
    }
    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
      setMeta('name', 'twitter:description', description)
    }

    let script
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-dynamic', 'true')
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }

    return () => {
      if (script && script.parentNode) script.parentNode.removeChild(script)
    }
  }, [title, description, jsonLd])
}
