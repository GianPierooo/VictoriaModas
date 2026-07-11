import { Link } from 'react-router-dom'
import { Disclosure, Transition } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

const FAQS = [
  {
    pregunta: '¿Cómo compro?',
    respuesta:
      'Navega la colección con sus precios, elige color y talla y añade a tu ' +
      'carrito. Al finalizar, coordinamos el pedido por WhatsApp: confirmamos la ' +
      'disponibilidad, la entrega y el pago. Sin registros ni complicaciones.',
  },
  {
    pregunta: '¿Cómo pago mi pedido?',
    respuesta:
      'Aceptamos Yape, Plin y transferencia bancaria; en Lima, también efectivo ' +
      'contra entrega. Por ahora el pago se coordina por WhatsApp: aún no tenemos ' +
      'pasarela en la web.',
  },
  {
    pregunta: '¿Hacen envíos?',
    respuesta:
      'Sí, a todo el país. En Lima entregamos en 2 a 4 días hábiles; a provincias ' +
      'enviamos por Shalom u Olva Courier (4 a 7 días hábiles), con recojo en la ' +
      'agencia de tu ciudad. Envío gratis en compras mayores a S/ 200.',
  },
  {
    pregunta: '¿Puedo cambiar o devolver una prenda?',
    respuesta:
      'Aceptamos cambios dentro de los 7 días posteriores a la entrega, siempre ' +
      'que la prenda esté sin uso y en su empaque original. Escríbenos por ' +
      'WhatsApp y lo coordinamos sin vueltas.',
  },
  {
    pregunta: '¿Cómo sé mi talla?',
    respuesta:
      'Cada prenda indica sus tallas disponibles. Si tienes dudas, escríbenos por ' +
      'WhatsApp con tus medidas (busto, cintura y cadera) y te ayudamos a elegir ' +
      'la talla ideal.',
  },
]

export default function FAQPage() {
  useDocumentMeta({
    title: 'Preguntas frecuentes | Victoria Modas',
    description: 'Cómo comprar, métodos de pago (Yape, Plin, transferencia), envíos a todo el Perú, cambios y guía de tallas. Todo lo que necesitas saber.',
  })

  return (
    <Layout>
      <div className="bg-white">
        {/* Encabezado — entrada secuenciada */}
        <section className="bg-cream py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <p className="hero-line mb-4 text-[11px] uppercase tracking-luxe text-clay" style={{ animationDelay: '0.05s' }}>
              Ayuda
            </p>
            <h1
              className="hero-line mb-5 font-serif text-5xl font-light leading-[1.05] tracking-[-0.01em] text-ink md:text-6xl"
              style={{ animationDelay: '0.16s' }}
            >
              Preguntas frecuentes
            </h1>
            <p className="hero-line mx-auto max-w-md font-light leading-relaxed text-ink-soft" style={{ animationDelay: '0.28s' }}>
              Lo esencial sobre cómo comprar, pagar y recibir tu pedido.
            </p>
          </div>
        </section>

        {/* Acordeón */}
        <div className="mx-auto max-w-2xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="border-t border-ink/10">
            {FAQS.map((faq) => (
              <Disclosure key={faq.pregunta}>
                {({ open }) => (
                  <div className="border-b border-ink/10">
                    <Disclosure.Button className="flex w-full items-center justify-between gap-4 py-5 text-left font-serif text-lg font-light text-ink transition-colors hover:text-clay">
                      {faq.pregunta}
                      <ChevronUpIcon
                        className={`h-4 w-4 flex-shrink-0 text-ink-muted transition-transform duration-300 ${open ? '' : 'rotate-180'}`}
                      />
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="opacity-0 -translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition duration-150 ease-in"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 -translate-y-1"
                    >
                      <Disclosure.Panel className="pb-6 text-sm font-light leading-relaxed text-ink-soft">
                        {faq.respuesta}
                      </Disclosure.Panel>
                    </Transition>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>

          {/* CTA de contacto */}
          <div className="mt-14 text-center">
            <p className="mb-6 font-light text-ink-soft">
              ¿No encontraste tu respuesta?
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center rounded-full border border-ink/20 px-9 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:border-ink hover:bg-ink/[0.03]"
            >
              Escríbenos
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
