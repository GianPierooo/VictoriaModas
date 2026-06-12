# Checklist final — Victoria Modas

Sitio en producción: **https://victoriamodas.store** (desplegado en Vercel desde
la rama `main` de GitHub). Cada `git push` a `main` redespliega automáticamente.

---

## 1. Registrar la web en Google Search Console (paso a paso)

Search Console es la herramienta gratuita de Google para que tu web aparezca en
las búsquedas y para vigilar cómo la ve Google.

### A. Verificar que la web es tuya (método meta tag)

1. Entra a **https://search.google.com/search-console** con tu cuenta de Google
   (usa la misma del negocio: victoriamodas1053@gmail.com si puedes).
2. Click en **"Agregar propiedad"** → elige el tipo **"Prefijo de URL"**
   (la opción de la derecha, NO "Dominio").
3. Escribe la URL exacta: `https://victoriamodas.store` y dale **Continuar**.
4. En la lista de métodos de verificación, abre **"Etiqueta HTML"**.
   Google te mostrará algo como:
   `<meta name="google-site-verification" content="aBc123XyZ..." />`
5. **Copia solo el código** de dentro de `content="..."` (lo que va entre
   comillas, p. ej. `aBc123XyZ...`).
6. Abre `index.html` (en la raíz del proyecto) y busca la línea:
   `<meta name="google-site-verification" content="REEMPLAZAR_CON_EL_CODIGO" />`
   Reemplaza `REEMPLAZAR_CON_EL_CODIGO` por el código que copiaste. Guarda.
7. Sube el cambio:
   ```
   git add index.html
   git commit -m "Añadir código de verificación de Google Search Console"
   git push
   ```
8. Espera ~1–2 minutos a que Vercel redepliegue (lo ves en vercel.com).
9. Vuelve a Search Console y pulsa **"Verificar"**. Debería decir
   "Propiedad verificada". ✅

> Si falla, espera unos minutos más (a veces el deploy tarda) y reintenta.
> El código se queda en la web para siempre; no lo borres.

### B. Enviar el sitemap (para que Google encuentre todas las páginas)

1. Ya verificada la propiedad, en el menú izquierdo de Search Console entra a
   **"Sitemaps"**.
2. En "Agregar un sitemap nuevo" escribe: `sitemap.xml` y dale **Enviar**.
   (La URL completa queda `https://victoriamodas.store/sitemap.xml`.)
3. Debe aparecer estado **"Correcto"** con las 14 URLs detectadas. Google
   empezará a rastrear e indexar en los días siguientes (no es instantáneo;
   puede tomar de días a un par de semanas).

### C. (Opcional) Pedir indexación de la home

1. En la barra superior de Search Console pega `https://victoriamodas.store` y
   pulsa Enter (herramienta "Inspección de URL").
2. Pulsa **"Solicitar indexación"**. Esto acelera que Google mire la home.

---

## 2. Qué revisar periódicamente

### Cada semana (5 minutos)
- **Search Console → Resultados de rendimiento**: cuántas veces apareciste en
  Google (impresiones) y cuántos clics. Crece poco a poco.
- **WhatsApp / Facebook**: que los pedidos lleguen bien (probar un pedido de
  prueba de vez en cuando desde el celular).

### Cada mes
- **Search Console → Páginas (Indexación)**: que no haya páginas con errores.
  Si sale alguna "no indexada", revisa el motivo.
- **Search Console → Experiencia / Core Web Vitals**: que esté en verde
  (velocidad y estabilidad en móvil).
- Probar la web en un celular real: que todo cargue rápido y se vea bien.
- Revisar que las fotos de producto sigan cargando (no enlaces rotos).

### Cuando agregues o quites productos
- Actualiza `src/data/products.js` (única fuente de productos).
- Añade/quita su URL en `public/sitemap.xml` (`/producto/{id}`).
- Corre `npm run optimize-images` si subiste imágenes nuevas (genera los WebP).
- `git push` → Vercel redespliega solo.

---

## 3. Pendientes para cuando tengas el material

Estos puntos no bloquean el funcionamiento, pero suben mucho la calidad y la
confianza de la web. Ahora mismo hay placeholders elegantes en su lugar.

- [ ] **Logo real (isotipo)**: colocar en `public/logo/`:
      - `isotipo.png` — 512 px lado mayor, fondo transparente (para fondos claros)
      - `isotipo-blanco.png` — versión clara (para el footer oscuro)
      Aparecerán solos en el Header y el Footer (ya están preparados con fallback).
      Ver `public/logo/LEEME.txt`.
- [ ] **Favicon real**: reemplazar `public/favicon.png` (512×512) y
      `public/apple-touch-icon.png` (180×180). Ahora es un placeholder "VM".
- [ ] **og-image con logo**: reemplazar `public/og-image.jpg` (1200×630) por uno
      con el logo real. Es la imagen que se ve al compartir el link en
      WhatsApp/Facebook/Instagram. Tras cambiarla, corre `npm run optimize-images`.
- [ ] **Fotos de producto buenas**: las actuales funcionan; si consigues fotos
      con mejor luz/fondo, reemplázalas en `public/imagenes/...` (mismos nombres)
      y corre `npm run optimize-images`.
- [ ] **Foto del hero**: la portada usa una foto de producto. Si tienes una foto
      editorial mejor, cámbiala en la sección Hero de `src/pages/HomePage.jsx`.
- [ ] **Foto del taller/tienda** en la página "Nosotros": hay un placeholder
      cream con el nombre. Reemplazar por una foto real (ver comentario en
      `src/pages/AboutPage.jsx`).
- [ ] **Instagram y TikTok**: cuando crees las cuentas, descomenta los íconos en
      `src/components/Footer.jsx` (ya están listos, solo hay que descomentar y
      poner el usuario real) y actualiza también el enlace de "Síguenos" si hace
      falta.
- [ ] **Horario de atención real**: en `src/pages/ContactPage.jsx` hay un
      placeholder "Lun a Sáb, 9am - 7pm". Ajústalo a tu horario real.

---

## 4. Datos y enlaces de referencia

- **Dominio**: https://victoriamodas.store
- **Repo GitHub**: https://github.com/GianPierooo/VictoriaModas (rama `main`)
- **WhatsApp**: +51 993 357 672 → https://wa.me/51993357672
- **Correo**: victoriamodas1053@gmail.com
- **Facebook**: https://www.facebook.com/profile.php?id=61555283742078
- **Sitemap**: https://victoriamodas.store/sitemap.xml
- **Robots**: https://victoriamodas.store/robots.txt
- **Fuente única de productos**: `src/data/products.js`
- **Optimizar imágenes a WebP**: `npm run optimize-images`
