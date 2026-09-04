import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Dev-only: sirve /api/stock y /api/pedido ejecutando los MISMOS handlers
// serverless que en producción, para probar los endpoints end-to-end con
// `npm run dev` (en prod los sirve Vercel). Para /api/stock, por defecto usa
// STOCK_SOURCE=mock en local si no hay otra fuente configurada.
function devApi() {
  // Lee el cuerpo crudo de la request (para POST).
  const readBody = (req) =>
    new Promise((resolve) => {
      let data = ''
      req.on('data', (c) => (data += c))
      req.on('end', () => resolve(data))
      req.on('error', () => resolve(''))
    })

  const mount = (server, route, importPath) => {
    server.middlewares.use(route, async (req, res) => {
      const shim = {
        _code: 200,
        setHeader: (k, v) => res.setHeader(k, v),
        status(c) { this._code = c; return this },
        json(o) {
          res.statusCode = this._code
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(o))
        },
      }
      try {
        // Ruta absoluta desde la raíz del proyecto (el import relativo se
        // resolvería contra el archivo temporal de Vite, no contra el repo).
        const abs = pathToFileURL(path.resolve(process.cwd(), importPath)).href
        const { default: handler } = await import(abs)
        const url = new URL(req.originalUrl || req.url, 'http://localhost')
        const query = Object.fromEntries(url.searchParams)
        const raw = req.method === 'GET' || req.method === 'HEAD' ? '' : await readBody(req)
        let body = raw
        try {
          body = raw ? JSON.parse(raw) : {}
        } catch {
          body = raw
        }
        await handler({ method: req.method, query, body }, shim)
      } catch (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: false, error: String(err && err.message) }))
      }
    })
  }

  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      // .env.local solo expone las variables VITE_* a import.meta.env; estos
      // handlers son los MISMOS que corren en Vercel y leen process.env sin
      // prefijo (p. ej. SUPABASE_URL, no VITE_SUPABASE_URL). loadEnv (sin
      // prefijo '') lee TODAS las variables del .env y las copiamos a
      // process.env solo si no vinieran ya puestas por el sistema.
      const envAll = loadEnv(server.config.mode, server.config.root, '')
      for (const [k, v] of Object.entries(envAll)) {
        if (process.env[k] === undefined) process.env[k] = v
      }
      if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL
      if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY) process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
      if (!process.env.STOCK_SOURCE) process.env.STOCK_SOURCE = 'mock'
      // Código de mayoreo por defecto SOLO en local, para probar /mayoristas.
      if (!process.env.MAYOREO_ACCESS_CODE) process.env.MAYOREO_ACCESS_CODE = 'mayoreo-dev'
      mount(server, '/api/stock', 'api/stock.js')
      mount(server, '/api/pedido', 'api/pedido.js')
      mount(server, '/api/mayoreo', 'api/mayoreo.js')
      mount(server, '/api/chat', 'api/chat.js')
      mount(server, '/api/meta-conversions', 'api/meta-conversions.js')
      mount(server, '/api/culqi-cobrar', 'api/culqi-cobrar.js')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApi()],
  build: {
    rollupOptions: {
      output: {
        // Librerías en chunks cacheables aparte del código de la app:
        //  - "ui"     → @headlessui / @heroicons (grandes, compartidas)
        //  - "vendor" → react, react-dom, react-router-dom y el resto de libs
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@headlessui') || id.includes('@heroicons')) return 'ui'
            return 'vendor'
          }
        },
      },
    },
  },
})
