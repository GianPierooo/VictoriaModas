import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only: sirve /api/stock ejecutando el MISMO handler serverless que en
// producción, para probar el endpoint end-to-end con `npm run dev` (en prod
// lo sirve Vercel). Por defecto usa STOCK_SOURCE=mock en local si no hay otra
// fuente configurada, para ver el indicador con datos de ejemplo.
function devApi() {
  return {
    name: 'dev-api-stock',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/stock', async (req, res) => {
        try {
          const { default: handler } = await import('./api/stock.js')
          const url = new URL(req.originalUrl || req.url, 'http://localhost')
          const query = Object.fromEntries(url.searchParams)
          if (!process.env.STOCK_SOURCE) process.env.STOCK_SOURCE = 'mock'
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
          await handler({ method: req.method, query }, shim)
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, error: String(err && err.message) }))
        }
      })
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
