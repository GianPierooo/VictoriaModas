// Imagen con WebP + fallback al original (png/jpg) vía <picture>.
// Los .webp los genera scripts/optimize-images.mjs junto a cada original.
//
// Es un reemplazo directo de <img>: pasa src (al png/jpg), alt, className,
// loading, fetchPriority, width, height, style… El <source> webp se deriva
// del src cambiando la extensión.

function toWebp(src) {
  if (typeof src !== 'string') return null
  const webp = src.replace(/\.(png|jpe?g)$/i, '.webp')
  return webp === src ? null : webp
}

export default function ResponsiveImage({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  fetchPriority,
  sizes,
  width,
  height,
  style,
  ...rest
}) {
  const webp = toWebp(src)

  return (
    <picture>
      {webp && <source srcSet={webp} sizes={sizes} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        fetchPriority={fetchPriority}
        sizes={sizes}
        width={width}
        height={height}
        decoding="async"
        style={style}
        {...rest}
      />
    </picture>
  )
}
