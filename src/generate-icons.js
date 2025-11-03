const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Crear directorio de iconos si no existe
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

console.log('🎨 Generando iconos SVG para PWA...\n');

sizes.forEach(size => {
  const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo degradado azul -->
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Fondo con bordes redondeados -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad${size})"/>

  <!-- Icono de paquete/caja -->
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <!-- Caja -->
    <rect x="${size * 0.1}" y="${size * 0.15}" width="${size * 0.4}" height="${size * 0.35}"
          fill="none" stroke="white" stroke-width="${size * 0.04}" rx="${size * 0.02}"/>

    <!-- Cinta horizontal -->
    <line x1="${size * 0.1}" y1="${size * 0.325}" x2="${size * 0.5}" y2="${size * 0.325}"
          stroke="white" stroke-width="${size * 0.05}" stroke-linecap="round"/>

    <!-- Cinta vertical -->
    <line x1="${size * 0.3}" y1="${size * 0.15}" x2="${size * 0.3}" y2="${size * 0.5}"
          stroke="white" stroke-width="${size * 0.05}" stroke-linecap="round"/>
  </g>

  <!-- Texto DSY (solo en iconos grandes) -->
  ${size >= 144 ? `<text x="${size / 2}" y="${size * 0.85}"
        font-family="Arial, sans-serif"
        font-size="${size * 0.18}"
        font-weight="bold"
        fill="white"
        text-anchor="middle">DSY</text>` : ''}
</svg>`;

  const filename = `icon-${size}x${size}.png.svg`;
  const filepath = path.join(ICONS_DIR, filename);

  fs.writeFileSync(filepath, svgContent);
  console.log(`✓ Creado: ${filename}`);
});

console.log('\n📝 Nota: Los archivos SVG han sido creados como placeholders.');
console.log('Para producción, convierte estos SVG a PNG o reemplázalos con iconos reales.\n');
console.log('Puedes usar herramientas como:');
console.log('  - https://cloudconvert.com/svg-to-png');
console.log('  - ImageMagick: convert icon.svg icon.png');
console.log('  - O cualquier editor de imágenes\n');
