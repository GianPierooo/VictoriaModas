import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
        const { default: handler } = await import(importPath)
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
      if (!process.env.STOCK_SOURCE) process.env.STOCK_SOURCE = 'mock'
      mount(server, '/api/stock', './api/stock.js')
      mount(server, '/api/pedido', './api/pedido.js')
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
