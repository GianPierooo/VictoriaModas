import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Todo node_modules va a un chunk cacheable aparte del código de la app:
        //  - "ui"     → @headlessui / @heroicons (grandes, compartidas entre rutas)
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
