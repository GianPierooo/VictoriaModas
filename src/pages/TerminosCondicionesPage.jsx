import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout.jsx'
import {
  RUC,
  RAZON_SOCIAL,
  DOMICILIO_ESTABLECIMIENTO,
  NOMBRE_COMERCIAL,
  EMAIL_CONTACTO,
  WHATSAPP_DISPLAY,
  DIAS_PARA_CAMBIOS,
} from '../config/legal.js'

// Único origen para los títulos: alimenta tanto el índice de navegación
// (LegalPageLayout) como el id= de cada <LegalSection>, así nunca quedan
// desincronizados entre sí.
const SECCIONES = [
  { id: 'proveedor', title: '1. Identificación del proveedor' },
  { id: 'aceptacion', title: '2. Aceptación de estos términos' },
  { id: 'productos', title: '3. Productos, precios y disponibilidad' },
  { id: 'compra', title: '4. Cómo se cierra una compra' },
  { id: 'envios', title: '5. Envíos' },
  { id: 'cambios', title: '6. Cambios y devoluciones' },
  { id: 'cuenta', title: '7. Cuenta de usuario' },
  { id: 'datos', title: '8. Protección de datos personales' },
  { id: 'propiedad', title: '9. Propiedad intelectual' },
  { id: 'reclamaciones', title: '10. Libro de Reclamaciones' },
  { id: 'actualizaciones', title: '11. Cambios a estos términos' },
  { id: 'ley', title: '12. Ley aplicable' },
]
const T = Object.fromEntries(SECCIONES.map((s) => [s.id, s.title]))

export default function TerminosCondicionesPage() {
  useDocumentMeta({
    title: 'Términos y Condiciones | Victoria Modas',
    description: 'Términos y condiciones de uso y compra en victoriamodas.store.',
  })

  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Términos y Condiciones"
      subtitle={`Condiciones de uso del sitio web y de compra en ${NOMBRE_COMERCIAL} (victoriamodas.store).`}
      updated="4 de septiembre de 2026"
      sections={SECCIONES}
    >
      <LegalSection id="proveedor" title={T.proveedor}>
        <p>
          Este sitio web es operado por <strong>{RAZON_SOCIAL}</strong>, identificado con RUC{' '}
          <strong>{RUC}</strong>, con domicilio en {DOMICILIO_ESTABLECIMIENTO}, que opera bajo el nombre comercial{' '}
          <strong>{NOMBRE_COMERCIAL}</strong>. Puedes contactarnos por WhatsApp al {WHATSAPP_DISPLAY} o al correo{' '}
          <a href={`mailto:${EMAIL_CONTACTO}`} className="text-clay underline">{EMAIL_CONTACTO}</a>.
        </p>
      </LegalSection>

      <LegalSection id="aceptacion" title={T.aceptacion}>
        <p>
          Al navegar, registrarte o comprar en victoriamodas.store aceptas estos Términos y Condiciones, nuestra{' '}
          <Link to="/politica-de-cambios" className="text-clay underline">Política de Cambios y Devoluciones</Link> y el
          tratamiento de tus datos personales descrito más abajo. Si no estás de acuerdo, te pedimos no usar el sitio.
        </p>
      </LegalSection>

      <LegalSection id="productos" title={T.productos}>
        <p>
          Los precios se muestran en soles (S/) e incluyen los impuestos de ley. Trabajamos con stock real: si una
          prenda aparece como "últimas piezas" es porque queda poco inventario, no una técnica de venta. Los precios y
          la disponibilidad pueden cambiar sin previo aviso hasta el momento en que se confirma tu pedido.
        </p>
        <p>
          Al tratarse de confección peruana, las medidas de una misma talla pueden variar ligeramente entre prendas o
          lotes de producción. Si tienes dudas sobre tu talla, escríbenos por WhatsApp antes de comprar.
        </p>
      </LegalSection>

      <LegalSection id="compra" title={T.compra}>
        <p>Ofrecemos dos formas de comprar:</p>
        <ul>
          <li><strong>Pago en línea con tarjeta</strong> (Culqi, pasarela de pago autorizada) directamente en el checkout.</li>
          <li>
            <strong>Coordinación por WhatsApp</strong>, donde confirmamos disponibilidad, pago (Yape, Plin,
            transferencia o efectivo contra entrega en Lima) y envío contigo directamente.
          </li>
        </ul>
        <p>
          Una compra queda confirmada cuando se aprueba el pago en línea, o cuando ambas partes acordamos los
          términos por WhatsApp.
        </p>
      </LegalSection>

      <LegalSection id="envios" title={T.envios}>
        <p>
          Envío gratis en compras desde S/ 60. Realizamos envíos a todo el Perú: en Lima, entrega en 2 a 4 días
          hábiles; a provincias, mediante Shalom u Olva Courier (4 a 7 días hábiles), con recojo en la agencia de tu
          ciudad. Los plazos son estimados y pueden variar por factores fuera de nuestro control (agencia de envío,
          feriados, zonas de difícil acceso).
        </p>
      </LegalSection>

      <LegalSection id="cambios" title={T.cambios}>
        <p>
          Aceptamos cambios dentro de los {DIAS_PARA_CAMBIOS} días posteriores a la entrega — ver el detalle completo
          en nuestra <Link to="/politica-de-cambios" className="text-clay underline">Política de Cambios y Devoluciones</Link>.
        </p>
      </LegalSection>

      <LegalSection id="cuenta" title={T.cuenta}>
        <p>
          Comprar en {NOMBRE_COMERCIAL} no requiere crear una cuenta. Si decides registrarte, eres responsable de
          mantener la confidencialidad de tu contraseña y de la actividad realizada desde tu cuenta.
        </p>
      </LegalSection>

      <LegalSection id="datos" title={T.datos}>
        <p>
          Recopilamos los datos que nos das al comprar o registrarte (nombre, teléfono, correo, dirección) únicamente
          para procesar tu pedido, coordinar la entrega y responderte. No vendemos tus datos a terceros.
        </p>
        <p>
          Usamos el Píxel de Meta (Facebook/Instagram) y su API de Conversiones para medir el rendimiento de nuestra
          publicidad; los datos de contacto que se comparten con Meta para esto (teléfono, correo) se envían siempre
          cifrados (hash), nunca en texto plano. Puedes solicitar la eliminación de tus datos personales
          escribiéndonos a {EMAIL_CONTACTO}, conforme a la Ley N.° 29733, Ley de Protección de Datos Personales.
        </p>
      </LegalSection>

      <LegalSection id="propiedad" title={T.propiedad}>
        <p>
          Las fotografías, textos, marca y diseño de victoriamodas.store son propiedad de {RAZON_SOCIAL}. No está
          permitido reproducirlos sin autorización previa.
        </p>
      </LegalSection>

      <LegalSection id="reclamaciones" title={T.reclamaciones}>
        <p>
          Si tienes un reclamo o queja, tienes a tu disposición nuestro{' '}
          <Link to="/libro-de-reclamaciones" className="text-clay underline">Libro de Reclamaciones virtual</Link>,
          conforme al Código de Protección y Defensa del Consumidor (Ley N.° 29571).
        </p>
      </LegalSection>

      <LegalSection id="actualizaciones" title={T.actualizaciones}>
        <p>
          Podemos actualizar estos Términos y Condiciones cuando sea necesario; la fecha de la última actualización
          queda indicada arriba. El uso continuado del sitio después de un cambio implica su aceptación.
        </p>
      </LegalSection>

      <LegalSection id="ley" title={T.ley}>
        <p>
          Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia se somete a los
          juzgados competentes de Lima, sin perjuicio de tu derecho a acudir a INDECOPI como consumidor.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
