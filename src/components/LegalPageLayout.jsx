import Layout from './Layout.jsx'

// Envoltorio compartido por las páginas legales de texto largo (Términos y
// Condiciones, Política de Cambios) — mismo encabezado editorial que el
// resto del sitio, cuerpo en prosa legible con jerarquía simple (h2/p/ul).
export default function LegalPageLayout({ eyebrow, title, subtitle, updated, children }) {
  return (
    <Layout>
      <div className="bg-white">
        <section className="bg-cream py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <p className="hero-line mb-4 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
              {eyebrow}
            </p>
            <h1 className="hero-line mb-5 font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl" style={{ animationDelay: '0.14s' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="hero-line max-w-2xl font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.22s' }}>
                {subtitle}
              </p>
            )}
            {updated && <p className="mt-4 text-xs font-light text-ink-muted">Última actualización: {updated}</p>}
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 py-14 lg:px-8 lg:py-16">
          <div className="prose-legal space-y-10">{children}</div>
        </div>
      </div>
    </Layout>
  )
}

// Bloque de sección reutilizable (título + contenido en prosa).
export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="mb-3 font-serif text-xl font-light text-ink">{title}</h2>
      <div className="space-y-3 text-sm font-light leading-relaxed text-ink-soft [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-ink">
        {children}
      </div>
    </section>
  )
}
