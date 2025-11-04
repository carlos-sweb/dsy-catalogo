#!/bin/bash
# Script para optimizar imágenes usando ImageMagick

echo "🖼️  OPTIMIZADOR DE IMÁGENES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configuración
MAX_SIZE="1200x1200"
QUALITY=85
BACKUP_DIR="assets-original"
ASSETS_DIR="static/assets"

# Crear directorio de backup si no existe
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    echo "📁 Directorio de backup creado: $BACKUP_DIR"
fi

# Verificar que ImageMagick esté instalado
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick no está instalado"
    echo "   Instálalo con: pkg install imagemagick"
    exit 1
fi

# Contador de archivos procesados
count=0
total_original=0
total_optimized=0

echo "Configuración:"
echo "  - Tamaño máximo: $MAX_SIZE"
echo "  - Calidad: $QUALITY%"
echo "  - Crear backup: Sí"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Procesar cada imagen en el directorio assets
find "$ASSETS_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) 2>/dev/null | while read -r img; do
    # Verificar si el archivo existe
    if [ ! -f "$img" ]; then
        continue
    fi

    filename=$(basename "$img")
    backup_path="$BACKUP_DIR/$filename"

    echo "🔧 Procesando: $filename"

    # Obtener tamaño original
    original_size=$(stat -c%s "$img" 2>/dev/null || stat -f%z "$img" 2>/dev/null)
    original_size_mb=$(echo "scale=2; $original_size / 1048576" | bc)

    echo "   Tamaño original: ${original_size_mb}MB"

    # Crear backup si no existe
    if [ ! -f "$backup_path" ]; then
        cp "$img" "$backup_path"
        echo "   ✓ Backup creado"
    fi

    # Optimizar imagen
    magick "$img" -resize "$MAX_SIZE>" -quality $QUALITY -strip "$img.tmp"

    # Verificar que la optimización fue exitosa
    if [ $? -eq 0 ]; then
        mv "$img.tmp" "$img"

        # Obtener tamaño optimizado
        optimized_size=$(stat -c%s "$img" 2>/dev/null || stat -f%z "$img" 2>/dev/null)
        optimized_size_mb=$(echo "scale=2; $optimized_size / 1048576" | bc)

        # Calcular ahorro
        savings=$((original_size - optimized_size))
        savings_mb=$(echo "scale=2; $savings / 1048576" | bc)

        if [ $original_size -gt 0 ]; then
            savings_percent=$(echo "scale=1; ($savings * 100) / $original_size" | bc)
        else
            savings_percent=0
        fi

        echo "   Tamaño optimizado: ${optimized_size_mb}MB"
        echo "   ✅ Ahorro: ${savings_mb}MB (${savings_percent}%)"

        # Acumular totales
        total_original=$((total_original + original_size))
        total_optimized=$((total_optimized + optimized_size))
        count=$((count + 1))
    else
        echo "   ❌ Error al optimizar"
        rm -f "$img.tmp"
    fi

    echo ""
done

# Resumen final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 RESUMEN DE OPTIMIZACIÓN"
echo ""

if [ $count -eq 0 ]; then
    echo "⚠️  No se procesó ninguna imagen"
else
    total_original_mb=$(echo "scale=2; $total_original / 1048576" | bc)
    total_optimized_mb=$(echo "scale=2; $total_optimized / 1048576" | bc)
    total_savings=$((total_original - total_optimized))
    total_savings_mb=$(echo "scale=2; $total_savings / 1048576" | bc)

    if [ $total_original -gt 0 ]; then
        total_savings_percent=$(echo "scale=1; ($total_savings * 100) / $total_original" | bc)
    else
        total_savings_percent=0
    fi

    echo "Imágenes procesadas: $count"
    echo "Tamaño total original: ${total_original_mb}MB"
    echo "Tamaño total optimizado: ${total_optimized_mb}MB"
    echo "Ahorro total: ${total_savings_mb}MB (${total_savings_percent}%)"
    echo ""
    echo "✓ Las imágenes optimizadas están en $ASSETS_DIR"
    echo "  Vite las copiará a public/ durante el build"
fi

echo ""
echo "✅ Optimización completada!"
echo ""
