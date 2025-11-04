import { defineConfig } from 'vite';
import { resolve } from 'path';
import ViteYaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
  plugins: [ViteYaml()],
  // Carpeta de assets estáticos
  publicDir: 'static',

  // Directorio de salida del build
  build: {
    outDir: 'public',
    emptyOutDir: false, // No vaciar public/ para mantener archivos generados por build.js
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        mediosDePago: resolve(__dirname, 'medios-de-pago.html')
      },
      output: {
        // Configuración de nombres de archivos
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'styles.css';
          }
          return '[name].[ext]';
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
    include: ['lodash', 'mithril', 'lucide']
  }
});
