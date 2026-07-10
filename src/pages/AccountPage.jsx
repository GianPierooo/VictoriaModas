import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

// Página honesta: las cuentas de usuario aún no existen. Mostramos un estado
// "Próximamente" en vez de un panel decorativo con enlaces a "#".
export default function AccountPage() {
  useDocumentMeta({
    title: 'Mi cuenta | Victoria Modas',
    description: 'Pronto podrás crear tu cuenta y seguir tus pedidos. Por ahora, coordinamos todo por WhatsApp.',
  })

  return (
    <Layout>
      <div className="bg-cream">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center lg:px-8">
          <p className="hero-line mb-4 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
            Próximamente
          </p>
          <h1 className="hero-line mb-6 font-serif text-5xl font-light leading-[1.05] text-ink md:text-6xl" style={{ animationDelay: '0.16s' }}>
            Tu cuenta,
            <span className="block italic text-clay">muy pronto</span>
          </h1>
          <p className="hero-line mb-10 max-w-md font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.28s' }}>
            Estamos preparando un espacio donde podrás crear tu cuenta y seguir
            tus pedidos. Mientras tanto, coordinamos todo contigo por WhatsApp.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/vestidos"
              className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
            >
              Seguir comprando
            </Link>
            <Link
              to="/favoritos"
              className="inline-flex items-center justify-center rounded-full border border-ink/20 px-9 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:border-ink hover:bg-ink/[0.03]"
            >
              Ver favoritos
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
