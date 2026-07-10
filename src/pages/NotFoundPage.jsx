import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

// 404 coherente con el sistema: tipografía display, dirección clara.
export default function NotFoundPage() {
  useDocumentMeta({
    title: 'Página no encontrada | Victoria Modas',
    description: 'La página que buscas no existe. Descubre la colección de Victoria Modas.',
  })

  return (
    <Layout>
      <div className="bg-cream">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center lg:px-8">
          <p className="hero-line mb-4 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
            Error 404
          </p>
          <h1 className="hero-line mb-6 font-serif text-5xl font-light leading-[1.05] text-ink md:text-6xl" style={{ animationDelay: '0.16s' }}>
            Esta página
            <span className="block italic text-clay">no existe</span>
          </h1>
          <p className="hero-line mb-10 max-w-md font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.28s' }}>
            Puede que el enlace haya cambiado. Lo bueno sigue aquí: descubre la colección.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
            >
              Ir al inicio
            </Link>
            <Link
              to="/vestidos"
              className="inline-flex items-center justify-center rounded-full border border-ink/20 px-9 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:border-ink hover:bg-ink/[0.03]"
            >
              Ver la colección
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
