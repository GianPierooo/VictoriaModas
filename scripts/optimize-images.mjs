// Genera una versión .webp de cada .png/.jpg/.jpeg dentro de public/imagenes/
// (y de og-image.jpg en public/). Conserva los originales como fallback.
//
//   npm run optimize-images
//
// Requiere sharp (devDependency). Reejecutar tras añadir imágenes nuevas:
// solo regenera los webp que falten o cuyo original sea más reciente.

import { readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TARGETS = [
  path.join(ROOT, 'public', 'imagenes'),
]
const EXT = new Set(['.png', '.jpg', '.jpeg'])
const QUALITY = 80

let made = 0
let skipped = 0
let bytesIn = 0
let bytesOut = 0

async function walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full)
      continue
    }
    const ext = path.extname(entry.name).toLowerCase()
    if (!EXT.has(ext)) continue
    await convert(full)
  }
}

async function convert(srcPath) {
  const webpPath = srcPath.replace(/\.(png|jpe?g)$/i, '.webp')
  const srcStat = await stat(srcPath)

  // Saltar si el webp ya existe y es más nuevo que el original
  if (existsSync(webpPath)) {
    const webpStat = await stat(webpPath)
    if (webpStat.mtimeMs >= srcStat.mtimeMs) {
      skipped++
      return
    }
  }

  await sharp(srcPath).webp({ quality: QUALITY }).toFile(webpPath)
  const outStat = await stat(webpPath)
  bytesIn += srcStat.size
  bytesOut += outStat.size
  made++
  const rel = path.relative(ROOT, webpPath)
  const pct = Math.round((1 - outStat.size / srcStat.size) * 100)
  console.log(`  ✓ ${rel}  (-${pct}%)`)
}

const kb = (b) => (b / 1024).toFixed(0)

console.log('Optimizando imágenes → WebP…\n')
for (const target of TARGETS) {
  await walk(target)
}
// og-image.jpg en la raíz de public
const og = path.join(ROOT, 'public', 'og-image.jpg')
if (existsSync(og)) await convert(og)

console.log(
  `\nListo. ${made} generadas, ${skipped} sin cambios.` +
  (made ? `\nOriginales: ${kb(bytesIn)} KB → WebP: ${kb(bytesOut)} KB ` +
    `(ahorro ${Math.round((1 - bytesOut / bytesIn) * 100)}%)` : '')
)
