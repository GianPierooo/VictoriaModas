// Pegar esta funcion Hero dentro de HomePage.jsx reemplazando la funcion Hero actual
// Requiere los imports ya existentes: Link, ChevronRightIcon, ChevronDownIcon

// ============= HERO EDITORIAL =============
function Hero() {
  return (
    <section className="relative bg-cream overflow-hidden">
      {/* Acento radial cálido, muy sutil */}
      <div className="absolute -top-32 -right-32 w-[36rem] h-[36rem] bg-gradient-radial-rose rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-radial-rose rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center min-h-[88vh] py-20">
        {/* Columna texto */}
        <div className="order-2 lg:order-1 text-center lg:text-left animate-fadeInUp">
          <p className="text-[11px] uppercase tracking-luxe text-clay mb-6">
            Nueva colección · 2026
          </p>
          <h1 className="font-serif font-light text-ink leading-[1.05] text-5xl md:text-6xl lg:text-7xl mb-8">
            Elegancia
            <span className="block italic text-clay">hecha para ti</span>
          </h1>
          <p className="text-ink-soft text-base md:text-lg max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
            Vestidos, blusas y abrigos en telas premium. Piezas pensadas para
            la mujer que viste con intención.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              to="/vestidos"
              className="group inline-flex items-center justify-center bg-ink text-cream px-9 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:bg-clay"
            >
              Explorar colección
              <ChevronRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/nosotros"
              className="inline-flex items-center justify-center border border-ink/20 text-ink px-9 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:border-ink hover:bg-ink/[0.03]"
            >
              Nuestra historia
            </Link>
          </div>
        </div>

        {/* Columna imagen */}
        <div className="order-1 lg:order-2 animate-fadeIn">
          <div className="relative aspect-[4/5] max-w-md mx-auto rounded-[1.5rem] overflow-hidden bg-cream-dark shadow-rose-lg">
            <img
              src="/imagenes/vestidos/vestido_suplex01/azul_adelante.png"
              alt="Vestido de la nueva colección Victoria Modas"
              className="w-full h-full object-cover object-top"
            />
            {/* Marco interior elegante */}
            <div className="absolute inset-4 border border-cream/40 rounded-[1rem] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Indicador scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-ink-muted animate-pulse-soft">
        <span className="text-[10px] uppercase tracking-luxe">Descubre</span>
        <ChevronDownIcon className="w-4 h-4" />
      </div>
    </section>
  )
}

