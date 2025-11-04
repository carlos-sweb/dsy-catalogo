const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Rutas
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

// Simplificado para usar Vite
// El build ahora se maneja completamente con Vite

console.log('🚀 Build configurado con Vite');
console.log('📦 Para desarrollo: npm run dev');
console.log('🏗️  Para producción: npm run build');
console.log('🔍 Para preview: npm run preview');
