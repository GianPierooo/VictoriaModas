import Layout from './Layout.jsx'

// Envoltorio compartido por las páginas legales de texto largo (Términos y
// Condiciones, Política de Cambios) — mismo encabezado editorial que el
// resto del sitio, cuerpo en prosa legible con jerarquía simple (h2/p/ul).
//
// `sections`: [{ id, title }] — si se pasa, agrega un índice de navegación
// (ancla a cada sección) para no obligar a desplazarse por un texto largo
// sin puntos de referencia. Es una guía de lectura de un documento legal
// extenso: mejora concreta de usabilidad, no decoración.
export default function LegalPageLayout({ eyebrow, title, subtitle, updated, sections, children }) {
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

        <div className="mx-auto max-w-5xl px-6 py-14 lg:px-8 lg:py-16">
          <div className={sections?.length ? 'lg:grid lg:grid-cols-[220px_1fr] lg:gap-14' : ''}>
            {sections?.length > 0 && (
              <nav aria-label="Índice" className="mb-12 lg:mb-0 lg:sticky lg:top-28 lg:self-start">
                <p className="mb-4 text-[10px] uppercase tracking-luxe text-ink-muted">En esta página</p>
                <ul className="space-y-2.5 border-l border-ink/10 pl-4">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="block text-xs font-light leading-snug text-ink-soft transition-colors duration-300 hover:text-clay"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <div className="max-w-prose space-y-10">{children}</div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

// Bloque de sección reutilizable (título + contenido en prosa). `id` ancla
// el índice de LegalPageLayout — se le resta la altura del header fijo con
// scroll-margin-top para que el título no quede tapado al saltar aquí.
export function LegalSection({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mb-3 font-serif text-xl font-light text-ink">{title}</h2>
      <div className="space-y-3 text-sm font-light leading-relaxed text-ink-soft [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-ink">
        {children}
      </div>
    </section>
  )
}
