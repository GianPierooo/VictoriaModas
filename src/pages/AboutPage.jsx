import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { useInViewReveal } from '../motion/useInViewReveal.js'
import { ASSETS } from '../config/assets.js'

const TELAS = [
  { nombre: 'Scuba', detalle: 'Estructura y caída impecable, perfecta para siluetas modernas.' },
  { nombre: 'Suplex', detalle: 'Ajuste cómodo que acompaña el cuerpo sin perder la forma.' },
  { nombre: 'Lamé', detalle: 'Brillo sutil y elegante para ocasiones especiales.' },
  { nombre: 'Seda Francesa', detalle: 'Suavidad y fluidez premium para piezas versátiles.' },
  { nombre: 'Rit', detalle: 'Textura sofisticada con excelente caída y durabilidad.' },
]

const COMPROMISOS = [
  {
    titulo: 'Calidad en cada puntada',
    texto: 'Seleccionamos cada tela y revisamos cada acabado. Si nosotras no la usaríamos, no la vendemos.',
  },
  {
    titulo: 'Atención cercana',
    texto: 'Te asesoramos por WhatsApp como en la tienda: con paciencia, honestidad y ojo de estilista.',
  },
  {
    titulo: 'Hecho en Perú',
    texto: 'Diseñado y confeccionado en Gamarra, con el orgullo de la moda peruana que viste bien.',
  },
]

// Foto del taller con fallback elegante: intenta la ruta de ASSETS y, si el
// archivo aún no existe, muestra el placeholder tipográfico (nada se rompe).
function TallerImage() {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-cream">
        <p className="text-center font-serif text-2xl font-light tracking-wide text-ink/30">
          Victoria<span className="italic text-clay/40">Modas</span>
          <span className="mt-2 block text-[10px] uppercase tracking-luxe">Gamarra · Lima</span>
        </p>
      </div>
    )
  }

  return (
    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-cream">
      <img
        src={ASSETS.tallerImage}
        alt="Nuestro taller en Gamarra"
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export default function AboutPage() {
  useDocumentMeta({
    title: 'Nuestra historia | Victoria Modas',
    description: 'Victoria Modas nace en Gamarra, Lima. Años vistiendo a la mujer peruana con telas premium, ahora directo a la clienta final.',
  })

  const [historiaRef, historiaIn] = useInViewReveal({ amount: 0.15 })
  const [telasRef, telasIn] = useInViewReveal({ amount: 0.15 })
  const [compromisoRef, compromisoIn] = useInViewReveal({ amount: 0.15 })

  return (
    <Layout>
      <div className="bg-white">
        {/* Encabezado — entrada secuenciada */}
        <section className="bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <p className="hero-line mb-4 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
              Nosotros
            </p>
            <h1
              className="hero-line mb-7 font-serif text-5xl font-light leading-[1.05] tracking-[-0.01em] text-ink md:text-6xl"
              style={{ animationDelay: '0.16s' }}
            >
              De Gamarra,
              <span className="block italic text-clay">directo a ti</span>
            </h1>
            <p className="hero-line mx-auto max-w-xl font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.3s' }}>
              Somos Victoria Modas: años vistiendo a la mujer peruana desde el corazón
              textil de Lima, ahora llevando nuestros diseños directo a tu puerta.
            </p>
          </div>
        </section>

        {/* Nuestra historia */}
        <section ref={historiaRef} className="py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div className={`reveal ${historiaIn ? 'reveal-in' : ''}`}>
              <TallerImage />
            </div>

            <div className={`reveal ${historiaIn ? 'reveal-in' : ''}`} style={{ transitionDelay: '0.12s' }}>
              <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Nuestra historia</p>
              <h2 className="mb-6 font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl">
                Nacimos entre telas
              </h2>
              <div className="space-y-4 font-light leading-relaxed text-ink-soft">
                <p>
                  Victoria Modas nace en Gamarra, el corazón de la moda peruana. Ahí
                  aprendimos lo que años de mostrador enseñan: a distinguir una buena
                  tela al tacto, a entender qué corte favorece y a tratar a cada
                  clienta como se merece.
                </p>
                <p>
                  Hoy damos el siguiente paso: llevamos nuestros diseños directo a la
                  clienta final, sin intermediarios. Creemos que vestir bien no
                  debería ser complicado ni costoso — por eso cada prenda que ves
                  aquí pasó primero por nuestras manos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nuestras telas */}
        <section ref={telasRef} className="bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className={`reveal ${telasIn ? 'reveal-in' : ''} mb-14 text-center`}>
              <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Nuestras telas</p>
              <h2 className="font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl">
                La calidad se siente
              </h2>
              <p className="mx-auto mt-5 max-w-xl font-light leading-relaxed text-ink-soft">
                Cada colección parte de la tela. Trabajamos solo con materiales que
                conocemos de memoria y que sabemos que durarán contigo.
              </p>
            </div>
            <div className={`reveal ${telasIn ? 'reveal-in' : ''} mx-auto max-w-2xl`} style={{ transitionDelay: '0.12s' }}>
              <ul className="border-t border-ink/10">
                {TELAS.map((tela) => (
                  <li key={tela.nombre} className="flex flex-col gap-1 border-b border-ink/10 py-6 sm:flex-row sm:items-baseline sm:gap-6">
                    <span className="w-36 flex-shrink-0 font-serif text-xl font-light text-ink">
                      {tela.nombre}
                    </span>
                    <span className="text-sm font-light leading-relaxed text-ink-soft">
                      {tela.detalle}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Nuestro compromiso */}
        <section ref={compromisoRef} className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className={`reveal ${compromisoIn ? 'reveal-in' : ''} mb-14 text-center`}>
              <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Nuestro compromiso</p>
              <h2 className="font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl">
                Lo que nos importa
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
              {COMPROMISOS.map((c, idx) => (
                <div
                  key={c.titulo}
                  className={`reveal ${compromisoIn ? 'reveal-in' : ''} text-center`}
                  style={{ transitionDelay: `${idx * 0.1 + 0.1}s` }}
                >
                  <div className="mx-auto mb-5 h-px w-10 bg-clay" />
                  <h3 className="mb-3 font-serif text-xl font-light text-ink">{c.titulo}</h3>
                  <p className="text-sm font-light leading-relaxed text-ink-soft">{c.texto}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                to="/vestidos"
                className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
              >
                Conoce la colección
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
