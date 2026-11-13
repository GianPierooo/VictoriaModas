# Texto corregido para el informe del Sprint 3 (Integrador II)

Reemplaza las secciones indicadas del documento `Integrador_Sprint3.docx` para que
describan el sistema que realmente está desplegado. Cambios pequeños al final.

---

## 13.2. Tecnologías empleadas

El sistema se desarrolló como una aplicación web de página única (SPA) con un backend
gestionado (Backend as a Service) y funciones serverless. Esta combinación permite
desplegar una solución modular, adaptable a computadoras y dispositivos móviles, sin
administrar servidores propios.

| Tecnología | Aplicación en el proyecto |
|---|---|
| React 19 + Vite 7 | Interfaz del catálogo, carrito, checkout, cuenta del cliente y panel administrativo. Vite compila y optimiza la aplicación. |
| React Router 6 | Navegación entre vistas; cada página se carga bajo demanda (lazy loading) para reducir el tiempo de carga inicial. |
| Tailwind CSS 3 | Estilos y diseño responsivo (mobile-first) con una paleta y tipografía propias de la marca. |
| Supabase (PostgreSQL 15) | Base de datos relacional normalizada: productos, variantes, categorías, tallas, colores, clientes, ventas, detalle de venta, cupones, movimientos de stock y reclamaciones. |
| Supabase Auth | Registro e inicio de sesión con correo y contraseña (almacenada con hashing bcrypt) y con Google (OAuth). Sesiones mediante tokens JWT. |
| Row Level Security (RLS) de PostgreSQL | Control de acceso por rol (administrador, vendedor, cliente) aplicado en la propia base de datos: cada consulta se filtra según el usuario autenticado. |
| Funciones SQL (RPC) y triggers | Reglas de negocio transaccionales: descuento de stock por venta, cancelación con devolución de stock, ajustes de inventario con motivo, registro automático de movimientos (kardex) y códigos correlativos (VTA-00001, CLI-00001). |
| Vercel (hosting + funciones serverless en Node.js) | Despliegue continuo desde GitHub, HTTPS/TLS automático y endpoints de servidor (`/api`) para operaciones que requieren llaves secretas. |
| Culqi | Pasarela de pago peruana para cobros con tarjeta; los datos de la tarjeta se tokenizan en el navegador y nunca pasan por el servidor del sistema. |
| Cloudflare Turnstile | Verificación anti-bots en registro e inicio de sesión. |
| Git y GitHub | Control de versiones y coordinación del trabajo del equipo. |
| ESLint | Análisis estático del código antes de cada commit. |

La organización por capas del patrón MVC se mantiene de forma conceptual: las vistas son
componentes de React, la coordinación de solicitudes la realizan los módulos de acceso a
datos y los endpoints serverless, y el modelo y sus reglas residen en PostgreSQL
(tablas, restricciones, funciones y políticas de seguridad).

---

## 16. Estructura del software

| Directorio o componente | Responsabilidad |
|---|---|
| `src/pages/` | Vistas públicas: inicio, catálogo por categoría, detalle de producto, carrito, checkout, cuenta del cliente ("Mis pedidos"), páginas legales y libro de reclamaciones. |
| `src/pages/admin/` | Vistas del panel interno: inicio (resumen), productos, stock, catálogo base (categorías, tallas, colores), cupones, ventas, clientes, reclamaciones, equipo y ajustes. |
| `src/components/` | Componentes reutilizables: tarjeta de producto, filtros, buscador, carrito lateral, protección de rutas por rol (`RequireRole`). |
| `src/context/` | Estado global: sesión del usuario, carrito (persistido en el navegador), favoritos y notificaciones. |
| `src/hooks/` | Lógica reutilizable de vistas, por ejemplo la carga del catálogo con respaldo estático. |
| `src/lib/` | Capa de acceso a datos (equivalente a repositorios): `supabaseAdmin.js` centraliza las consultas y operaciones del panel y de los pedidos del cliente. |
| `src/utils/` | Utilidades: formato de precios, validaciones (documento, teléfono), exportación CSV. |
| `api/` | Funciones serverless (capa de servicios con llaves secretas): cobro con Culqi y registro del pedido, consulta de stock, chat asistente, integración con Meta y WhatsApp. |
| `supabase/migrations/` | Scripts SQL versionados: tablas, restricciones, índices, funciones, triggers y políticas de seguridad. |
| `public/` | Imágenes optimizadas (WebP), `robots.txt` y `sitemap.xml`. |

### 16.1. Patrones de diseño

| Patrón o mecanismo | Aplicación en el proyecto | Beneficio |
|---|---|---|
| Arquitectura por componentes (vista) | Cada pantalla se compone de componentes React reutilizables. | Interfaz consistente y fácil de mantener. |
| Repository / capa de acceso a datos | `src/lib/supabaseAdmin.js` agrupa todas las consultas; las vistas no construyen consultas sueltas. | Bajo acoplamiento entre interfaz y base de datos. |
| Service Layer | Funciones SQL (`descontar_stock_venta`, `cancelar_venta`, `ajustar_stock`) y endpoints `api/` concentran las reglas de negocio. | Reglas en un solo lugar, ejecutadas de forma atómica. |
| Autorización por roles (RBAC) | Rutas protegidas con `RequireRole` en la interfaz y políticas RLS en la base de datos. | Aunque se manipule el navegador, la base de datos rechaza operaciones no autorizadas. |
| Provider / Context | Sesión, carrito y favoritos compartidos entre vistas. | Estado coherente sin duplicar lógica. |

### Aplicación en el checkout (reemplaza el párrafo de 16.1)

Cuando un cliente confirma una compra, la vista envía el carrito al endpoint
`api/culqi-cobrar`. Este servicio vuelve a consultar en la base de datos el precio y
el stock reales de cada variante (no confía en los importes enviados por el
navegador), valida el cupón, realiza el cobro con la pasarela Culqi y, si es aprobado,
registra la venta con su detalle, descuenta el stock una sola vez y asocia el pedido
al cliente. La vista muestra el código del pedido y su estado, que el cliente consulta
luego en "Mis pedidos".

---

## Cambios menores en el resto del documento

1. **Dominio**: reemplazar "VictoriaModas.store" por **victoriamodas.online** (el dominio
   `.store` ya no está en uso).
2. **Estados del pedido** (RF-09, CA-07, CUS-08): *Pendiente → Pagado → En preparación →
   Despachado → Entregado*, más *Cancelado* (devuelve el stock y libera el cupón).
3. **Pagos (2.4.2 y 6.4)**: añadir que se integró la pasarela peruana **Culqi** para pago con
   tarjeta, además de la coordinación por WhatsApp; siguen fuera de alcance las pasarelas
   internacionales (Stripe, PayPal).
4. **Stock en cero (RF-03)**: el checkout bloquea cantidades mayores al stock disponible; por
   decisión comercial, la vitrina muestra "últimas piezas" en lugar de "agotado".
5. **Comprobante interno (RF-06, CA-06)**: el panel genera un ticket de 80 mm imprimible o
   descargable en PDF, con código, fecha, cliente, detalle, importes y total, y la leyenda
   "no válido como comprobante SUNAT".
6. **Clientes (RF-05, CA-02)**: registro con DNI, RUC o carné de extranjería; el sistema valida
   el formato y no permite documentos duplicados (índice único en la base de datos).
7. **Pruebas (RNF-01, Sprint 4)**: Apache JMeter puede mantenerse como herramienta planificada
   para el Sprint 4; Postman aplica a los endpoints de `api/`.
