import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout.jsx'
import { NOMBRE_COMERCIAL, EMAIL_CONTACTO, WHATSAPP_DISPLAY, WHATSAPP_NUMERO, DIAS_PARA_CAMBIOS } from '../config/legal.js'

export default function PoliticaCambiosPage() {
  useDocumentMeta({
    title: 'Política de Cambios y Devoluciones | Victoria Modas',
    description: `Cómo cambiar o devolver una prenda comprada en ${NOMBRE_COMERCIAL} — plazos, condiciones y pasos.`,
  })

  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Política de Cambios y Devoluciones"
      subtitle="Queremos que ames lo que compraste. Si algo no te queda o no era lo que esperabas, así lo resolvemos."
      updated="4 de septiembre de 2026"
    >
      <LegalSection title="1. Plazo para solicitar un cambio">
        <p>
          Tienes <strong>{DIAS_PARA_CAMBIOS} días calendario</strong> desde que recibes tu pedido para solicitar un
          cambio, escribiéndonos por WhatsApp al {WHATSAPP_DISPLAY}.
        </p>
      </LegalSection>

      <LegalSection title="2. Condiciones de la prenda">
        <p>Para aceptar un cambio, la prenda debe cumplir con lo siguiente:</p>
        <ul>
          <li>Sin uso, sin lavar y sin señales de haber sido usada.</li>
          <li>Con sus etiquetas originales puestas.</li>
          <li>En su empaque original, en buen estado.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Qué se puede cambiar">
        <p>
          Aceptamos cambios por talla o color distinto de la misma prenda, o por otra prenda de igual o mayor valor
          (pagando la diferencia). Las prendas en oferta con precio rebajado real (ver el precio tachado en la
          página del producto) también aceptan cambio, salvo que se indique lo contrario al momento de la compra.
        </p>
      </LegalSection>

      <LegalSection title="4. Devolución del dinero">
        <p>
          Si la prenda llegó con un defecto de fabricación o un error nuestro (talla, color o modelo distinto al
          pedido), puedes elegir entre un cambio o la devolución completa de tu dinero. En pedidos pagados en línea
          con tarjeta, la devolución se hace al mismo medio de pago; en pedidos coordinados por WhatsApp, se coordina
          contigo la forma de devolución.
        </p>
      </LegalSection>

      <LegalSection title="5. Costo de envío del cambio">
        <p>
          Si el cambio es por un error nuestro, el envío de ida y vuelta corre por nuestra cuenta. Si es porque
          cambiaste de opinión (talla, color, modelo), el costo de envío del cambio lo asume la clienta, salvo que
          coordinemos algo distinto contigo.
        </p>
      </LegalSection>

      <LegalSection title="6. Cómo iniciar un cambio o devolución">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Escríbenos por WhatsApp con tu número de pedido y el motivo del cambio.</li>
          <li>Te confirmamos si tu solicitud cumple las condiciones de arriba.</li>
          <li>Coordinamos el envío de la prenda y, según el caso, el nuevo despacho o la devolución.</li>
        </ol>
        <p className="mt-3">
          Si prefieres dejar constancia formal en vez de coordinar por WhatsApp, también puedes usar nuestro{' '}
          <Link to="/libro-de-reclamaciones" className="text-clay underline">Libro de Reclamaciones</Link>.
        </p>
      </LegalSection>

      <LegalSection title="7. Contacto">
        <p>
          WhatsApp:{' '}
          <a href={`https://wa.me/${WHATSAPP_NUMERO}`} target="_blank" rel="noopener noreferrer" className="text-clay underline">
            {WHATSAPP_DISPLAY}
          </a>
          {' '}· Correo:{' '}
          <a href={`mailto:${EMAIL_CONTACTO}`} className="text-clay underline">{EMAIL_CONTACTO}</a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
