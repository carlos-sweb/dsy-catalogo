import { defineConfig } from 'vite';
import { resolve } from 'path';
import ViteYaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
  plugins: [ViteYaml()],
  // Base path relativo para GitHub Pages
  base: './',
  // Carpeta de assets estáticos
  publicDir: 'static',

  // Directorio de salida del build
  build: {
    outDir: 'public',
    emptyOutDir: true, // Limpiar public/ antes de cada build para eliminar archivos obsoletos
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        mediosDePago: resolve(__dirname, 'medios-de-pago.html')
      },
      output: {
        // Configuración de nombres de archivos con hash para cache busting
        // El hash cambia cuando el contenido cambia, forzando al navegador a descargar la nueva versión
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // CSS con hash
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return '[name]-[hash].css';
          }
          // Otros assets (imágenes, fuentes, etc.) con hash
          return '[name]-[hash].[ext]';
        }
      }
    },
    // Minificación
    minify: 'terser',
    cssMinify: true
  },

  // Configuración del servidor de desarrollo
  server: {
    open: true,
    port: 3000
  },

  // Optimización de dependencias
  optimizeDeps: {
    include: ['lodash.debounce', 'mithril', 'lucide-static']
  }
});
