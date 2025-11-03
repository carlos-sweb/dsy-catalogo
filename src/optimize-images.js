const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directorios
const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const PUBLIC_ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');
const BACKUP_DIR = path.join(__dirname, '..', 'assets-original');

// Configuración de optimización
const CONFIG = {
  maxWidth: 1200,        // Ancho máximo para productos
  maxHeight: 1200,       // Alto máximo para productos
  quality: 85,           // Calidad de compresión (1-100)
  webpQuality: 85,       // Calidad para WebP
  createBackup: true,    // Crear backup de originales
  formats: ['jpg', 'jpeg', 'png', 'webp'] // Formatos a procesar
};

// Crear directorio de backup si no existe
if (CONFIG.createBackup && !fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('📁 Directorio de backup creado:', BACKUP_DIR);
}

// Función para obtener tamaño de archivo
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

// Función para formatear bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para optimizar una imagen
async function optimizeImage(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase().slice(1);

  // Verificar si es un formato soportado
  if (!CONFIG.formats.includes(ext)) {
    console.log(`⏭️  Ignorando ${fileName} (formato no soportado)`);
    return null;
  }

  console.log(`\n🔧 Procesando: ${fileName}`);

  const originalSize = getFileSize(filePath);
  console.log(`   Tamaño original: ${formatBytes(originalSize)}`);

  // Crear backup si está habilitado
  if (CONFIG.createBackup) {
    const backupPath = path.join(BACKUP_DIR, fileName);
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
      console.log(`   ✓ Backup creado`);
    }
  }

  try {
    // Leer metadata de la imagen
    const metadata = await sharp(filePath).metadata();
    console.log(`   Dimensiones originales: ${metadata.width}x${metadata.height}`);

    // Calcular nuevas dimensiones si exceden el máximo
    let resizeOptions = null;
    if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
      resizeOptions = {
        width: CONFIG.maxWidth,
        height: CONFIG.maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      };
    }

    // Procesar imagen según formato
    let sharpInstance = sharp(filePath);

    if (resizeOptions) {
      sharpInstance = sharpInstance.resize(resizeOptions);
    }

    // Aplicar compresión según formato original
    if (ext === 'jpg' || ext === 'jpeg') {
      await sharpInstance
        .jpeg({ quality: CONFIG.quality, progressive: true, mozjpeg: true })
        .toFile(filePath + '.tmp');
    } else if (ext === 'png') {
      await sharpInstance
        .png({ quality: CONFIG.quality, compressionLevel: 9, progressive: true })
        .toFile(filePath + '.tmp');
    } else if (ext === 'webp') {
      await sharpInstance
        .webp({ quality: CONFIG.webpQuality })
        .toFile(filePath + '.tmp');
    }

    // Reemplazar archivo original con optimizado
    fs.renameSync(filePath + '.tmp', filePath);

    const optimizedSize = getFileSize(filePath);
    const savings = originalSize - optimizedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

    console.log(`   Tamaño optimizado: ${formatBytes(optimizedSize)}`);
    console.log(`   ✅ Ahorro: ${formatBytes(savings)} (${savingsPercent}%)`);

    return {
      fileName,
      originalSize,
      optimizedSize,
      savings,
      savingsPercent: parseFloat(savingsPercent)
    };

  } catch (error) {
    console.error(`   ❌ Error procesando ${fileName}:`, error.message);
    return null;
  }
}

// Función principal
async function main() {
  console.log('🖼️  OPTIMIZADOR DE IMÁGENES\n');
  console.log(`Directorio: ${ASSETS_DIR}`);
  console.log(`Configuración:
  - Tamaño máximo: ${CONFIG.maxWidth}x${CONFIG.maxHeight}px
  - Calidad JPEG/PNG: ${CONFIG.quality}%
  - Calidad WebP: ${CONFIG.webpQuality}%
  - Crear backup: ${CONFIG.createBackup ? 'Sí' : 'No'}
`);

  // Leer todos los archivos del directorio
  const files = fs.readdirSync(ASSETS_DIR);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase().slice(1);
    return CONFIG.formats.includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log('⚠️  No se encontraron imágenes para optimizar');
    return;
  }

  console.log(`📋 Se encontraron ${imageFiles.length} imágenes para procesar\n`);
  console.log('━'.repeat(60));

  // Procesar cada imagen
  const results = [];
  for (const file of imageFiles) {
    const filePath = path.join(ASSETS_DIR, file);
    const result = await optimizeImage(filePath);
    if (result) {
      results.push(result);
    }
  }

  // Resumen final
  console.log('\n' + '━'.repeat(60));
  console.log('\n📊 RESUMEN DE OPTIMIZACIÓN\n');

  if (results.length === 0) {
    console.log('⚠️  No se optimizó ninguna imagen');
    return;
  }

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
  const totalSavings = totalOriginal - totalOptimized;
  const totalSavingsPercent = ((totalSavings / totalOriginal) * 100).toFixed(1);

  console.log(`Imágenes procesadas: ${results.length}`);
  console.log(`Tamaño total original: ${formatBytes(totalOriginal)}`);
  console.log(`Tamaño total optimizado: ${formatBytes(totalOptimized)}`);
  console.log(`Ahorro total: ${formatBytes(totalSavings)} (${totalSavingsPercent}%)\n`);

  // Copiar imágenes optimizadas a public/assets/
  console.log('📋 Copiando imágenes optimizadas a public/assets/...');

  // Crear directorio si no existe
  if (!fs.existsSync(PUBLIC_ASSETS_DIR)) {
    fs.mkdirSync(PUBLIC_ASSETS_DIR, { recursive: true });
  }

  // Copiar cada imagen
  for (const file of imageFiles) {
    const srcPath = path.join(ASSETS_DIR, file);
    const destPath = path.join(PUBLIC_ASSETS_DIR, file);
    fs.copyFileSync(srcPath, destPath);
  }

  console.log(`✓ ${imageFiles.length} imágenes copiadas a public/assets/`);
  console.log('\n✅ Optimización completada!\n');
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
