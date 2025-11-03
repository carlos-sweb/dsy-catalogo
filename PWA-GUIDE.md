# Guía de PWA - DSY Catálogo

## 📱 ¿Qué es una PWA?

Una **Progressive Web App (PWA)** permite que el catálogo se comporte como una aplicación nativa:
- ✅ Instalable en dispositivos móviles y desktop
- ✅ Funciona offline (sin internet)
- ✅ Ícono en la pantalla de inicio
- ✅ Pantalla completa (sin barra de navegador)
- ✅ Actualizaciones automáticas

## 🚀 Archivos PWA Implementados

### 1. `public/manifest.json`
Configuración de la PWA:
- Nombre de la app: "Catálogo Oficial Paquetería"
- Nombre corto: "DSY Catálogo"
- Color del tema: Azul (#2563eb)
- Iconos en múltiples tamaños
- Modo: Standalone (pantalla completa)

### 2. `public/service-worker.js`
Service Worker para funcionalidad offline:
- Caché de archivos estáticos
- Estrategia Network First
- Sincronización en segundo plano
- Soporte para notificaciones push (futuro)

### 3. `public/icons/`
Iconos SVG en 8 tamaños diferentes:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

**Nota:** Los iconos actuales son SVG placeholders. Para producción:
1. Convierte los SVG a PNG usando https://cloudconvert.com/svg-to-png
2. O reemplázalos con iconos PNG personalizados

## 📲 Cómo Instalar la PWA

### En Android (Chrome/Edge)

1. Abre el sitio en Chrome o Edge
2. Verás un banner "Agregar a pantalla de inicio"
3. O toca el menú (⋮) → "Instalar app" o "Agregar a pantalla de inicio"
4. Confirma la instalación
5. El ícono aparecerá en tu pantalla de inicio

### En iOS (Safari)

1. Abre el sitio en Safari
2. Toca el botón Compartir (cuadro con flecha)
3. Desplázate y selecciona "Agregar a pantalla de inicio"
4. Edita el nombre si deseas
5. Toca "Agregar"
6. El ícono aparecerá en tu pantalla de inicio

### En Desktop (Chrome/Edge)

1. Abre el sitio en Chrome o Edge
2. Busca el ícono de instalación (⊕) en la barra de direcciones
3. O ve al menú → "Instalar DSY Catálogo"
4. Confirma la instalación
5. La app se abrirá en una ventana separada

## 🔧 Desarrollo

### Regenerar Iconos
```bash
npm run icons
```
Esto genera iconos SVG placeholders en `public/icons/`

### Actualizar Service Worker
Cuando modifiques `public/service-worker.js`:
1. Incrementa el número de versión en `CACHE_NAME`
2. Los usuarios verán un prompt para actualizar

```javascript
const CACHE_NAME = 'dsy-catalogo-v2'; // Incrementar versión
```

### Probar PWA Localmente

1. Inicia el servidor:
   ```bash
   npm start
   ```

2. Abre Chrome DevTools (F12)
3. Ve a la pestaña "Application"
4. Verifica:
   - ✅ Manifest (pestaña Manifest)
   - ✅ Service Workers (pestaña Service Workers)
   - ✅ Storage/Cache (pestaña Cache Storage)

5. Prueba modo offline:
   - En DevTools → Application → Service Workers
   - Marca "Offline"
   - Recarga la página
   - El sitio debe funcionar sin internet

## ✨ Características PWA Implementadas

### ✅ Instalabilidad
- Manifest.json configurado
- Meta tags para iOS y Android
- Iconos en múltiples tamaños

### ✅ Offline First
- Service Worker registrado
- Caché de archivos críticos
- Fallback cuando no hay internet

### ✅ Actualizaciones Automáticas
- Detección de nuevas versiones
- Prompt de actualización al usuario

### ✅ Experiencia Nativa
- Pantalla de carga (splash screen)
- Sin barra de navegador
- Orientación optimizada (portrait)

## 🎨 Personalizar Iconos

Para reemplazar los iconos placeholder:

1. **Opción 1: Convertir SVG a PNG**
   ```bash
   # Usando ImageMagick (si está instalado)
   convert public/icons/icon-192x192.svg public/icons/icon-192x192.png
   ```

2. **Opción 2: Herramientas Online**
   - https://cloudconvert.com/svg-to-png
   - https://convertio.co/svg-png/

3. **Opción 3: Editor de Imágenes**
   - GIMP, Photoshop, Figma, etc.
   - Crea iconos en los tamaños requeridos

4. **Actualizar manifest.json**
   Cambia las extensiones de `.svg` a `.png`:
   ```json
   "src": "./icons/icon-192x192.png",
   "type": "image/png"
   ```

## 📊 Verificar PWA

### Lighthouse Audit (Chrome)

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Lighthouse"
3. Selecciona categoría "Progressive Web App"
4. Click en "Generate report"
5. Revisa el puntaje y sugerencias

### PWA Builder

1. Ve a https://www.pwabuilder.com/
2. Ingresa la URL de tu sitio
3. Analiza el reporte
4. Descarga assets adicionales si es necesario

## 🚨 Troubleshooting

### La PWA no se instala

1. Verifica que uses HTTPS (requerido para PWA)
   - GitHub Pages automáticamente usa HTTPS ✅

2. Revisa que el manifest.json sea accesible:
   ```
   https://tu-sitio.com/manifest.json
   ```

3. Verifica que el Service Worker se registre:
   - DevTools → Console
   - Busca: "✅ Service Worker registrado"

### La app no funciona offline

1. Verifica que el Service Worker esté activo:
   - DevTools → Application → Service Workers
   - Estado debe ser "activated"

2. Revisa la caché:
   - DevTools → Application → Cache Storage
   - Debe existir "dsy-catalogo-v1"

3. Fuerza actualización:
   - DevTools → Application → Service Workers
   - Click "Update" y "Skip waiting"

## 📝 Checklist Pre-Producción

Antes de desplegar a producción:

- [ ] Reemplazar iconos SVG con PNG
- [ ] Probar instalación en Android
- [ ] Probar instalación en iOS
- [ ] Probar instalación en Desktop
- [ ] Verificar funcionamiento offline
- [ ] Ejecutar Lighthouse audit (>90 puntos)
- [ ] Verificar que manifest.json sea accesible
- [ ] Probar actualización de Service Worker

## 🎉 ¡Listo!

Tu catálogo ahora es una PWA completa y puede ser instalada como una app nativa en cualquier dispositivo.
