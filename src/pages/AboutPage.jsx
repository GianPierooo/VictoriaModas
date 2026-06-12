import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

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

export default function AboutPage() {
  useDocumentMeta({
    title: 'Nuestra historia | Victoria Modas',
    description: 'Victoria Modas nace en Gamarra, Lima. Años vistiendo a la mujer peruana con telas premium, ahora directo a la clienta final.',
  })

  return (
    <Layout>
      <div className="bg-white">
        {/* Encabezado */}
        <section className="bg-cream py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Nosotros</p>
            <h1 className="mb-6 font-serif text-4xl font-light leading-tight text-ink md:text-5xl">
              De Gamarra,
              <span className="block italic text-clay">directo a ti</span>
            </h1>
            <p className="mx-auto max-w-xl font-light leading-relaxed text-ink-soft">
              Somos Victoria Modas: años vistiendo a la mujer peruana desde el corazón
              textil de Lima, ahora llevando nuestros diseños directo a tu puerta.
            </p>
          </div>
        </section>

        {/* Nuestra historia */}
        <section className="py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            {/*
              Placeholder de imagen — REEMPLAZAR por foto real del taller o
              de la tienda en Gamarra cuando esté disponible:
              <img src="/imagenes/nosotros/taller.jpg" alt="Nuestro taller en Gamarra" className="h-full w-full rounded-lg object-cover" />
            */}
            <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-cream">
              <p className="text-center font-serif text-2xl font-light tracking-wide text-ink/30">
                Victoria<span className="italic text-clay/40">Modas</span>
                <span className="mt-2 block text-[10px] uppercase tracking-luxe">Gamarra · Lima</span>
              </p>
            </div>

            <div>
              <p className="mb-3 text-[11px] uppercase tracking-luxe text-clay">Nuestra historia</p>
              <h2 className="mb-6 font-serif text-3xl font-light text-ink md:text-4xl">
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
        <section className="bg-cream py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-3 text-[11px] uppercase tracking-luxe text-clay">Nuestras telas</p>
              <h2 className="font-serif text-3xl font-light text-ink md:text-4xl">
                La calidad se siente
              </h2>
              <p className="mx-auto mt-4 max-w-xl font-light leading-relaxed text-ink-soft">
                Cada colección parte de la tela. Trabajamos solo con materiales que
                conocemos de memoria y que sabemos que durarán contigo.
              </p>
            </div>
            <div className="mx-auto max-w-2xl">
              <ul className="border-t border-ink/10">
                {TELAS.map((tela) => (
                  <li key={tela.nombre} className="flex flex-col gap-1 border-b border-ink/10 py-5 sm:flex-row sm:items-baseline sm:gap-6">
                    <span className="w-36 flex-shrink-0 font-serif text-lg font-light text-ink">
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
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-3 text-[11px] uppercase tracking-luxe text-clay">Nuestro compromiso</p>
              <h2 className="font-serif text-3xl font-light text-ink md:text-4xl">
                Lo que nos importa
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
              {COMPROMISOS.map((c) => (
                <div key={c.titulo} className="text-center">
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
