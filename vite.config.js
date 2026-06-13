import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Librerías en chunks cacheables aparte del código de la app:
        //  - "ui"     → @headlessui / @heroicons (grandes, compartidas)
        //  - "motion" → núcleo de framer-motion (m, LazyMotion, AnimatePresence).
        //               Las features pesadas (domMax) NO se fuerzan aquí: se
        //               dejan que Rollup las divida en el chunk async que carga
        //               LazyMotion bajo demanda (lazy-loading de features).
        //  - "vendor" → react, react-dom, react-router-dom y el resto de libs
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@headlessui') || id.includes('@heroicons')) return 'ui'
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
              return undefined // que Rollup separe el core (sync) de las features (async)
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
