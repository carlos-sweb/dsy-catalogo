# DSY Catálogo - Catálogo Oficial Paquetería

Sitio web estático para mostrar productos de paquetería y accesorios. Generado dinámicamente desde datos YAML usando Node.js.

## 🌐 Sitio en Vivo

**[Ver Catálogo en GitHub Pages](https://carlos-sweb.github.io/dsy-catalogo/)**

> 📌 El sitio se actualiza automáticamente cuando se hace push a la rama `main`

## 📱 Progressive Web App (PWA)

Este catálogo es una **PWA completa** que puede instalarse como una aplicación nativa:
- ✅ **Instalable** en Android, iOS y Desktop
- ✅ **Funciona offline** sin conexión a internet
- ✅ **Ícono en pantalla de inicio** como app nativa
- ✅ **Actualizaciones automáticas** del contenido

**📖 [Ver Guía Completa de PWA](./PWA-GUIDE.md)**

### Instalación Rápida

**Android/Chrome:** Menú → "Instalar app" o banner automático
**iOS/Safari:** Compartir → "Agregar a pantalla de inicio"
**Desktop:** Ícono ⊕ en barra de direcciones

## Estructura del Proyecto

```
dsy-catalogo/
├── index.html           # HTML principal (entry point)
├── medios-de-pago.html  # Página de medios de pago
├── public/              # Directorio de build (generado por Vite)
│   ├── index.html
│   ├── medios-de-pago.html
│   ├── manifest.json    # Configuración PWA
│   ├── service-worker.js
│   ├── icons/           # Iconos en múltiples tamaños
│   └── *.js, *.css      # Assets compilados
├── static/              # Archivos estáticos (copiados tal cual)
│   ├── manifest.json
│   ├── service-worker.js
│   └── icons/
├── src/
│   ├── main.js          # Entry point de la aplicación
│   ├── medios-pago.js   # Script de medios de pago
│   └── generate-icons.js # Generador de iconos
├── data.yml             # Datos de productos en formato YAML
├── vite.config.js       # Configuración de Vite
├── tailwind.config.js   # Configuración de Tailwind CSS
├── package.json         # Dependencias del proyecto
└── .claudecode          # Contexto para Claude Code
```

**Nota:** El proyecto ahora usa **Vite.js** como bundler y servidor de desarrollo.

## Instalación

```bash
# Instalar dependencias
npm install
```

## Uso

```bash
# Servidor de desarrollo con hot-reload
npm run dev

# Generar el sitio estático para producción
npm run build

# Previsualizar el build de producción
npm run preview
```

El servidor de desarrollo se abrirá automáticamente en `http://localhost:3000`

## Editar Productos

Los productos se gestionan en el archivo `data.yml`. Para agregar o modificar productos:

### En desarrollo (con hot-reload)
1. Ejecuta `npm run dev` para iniciar el servidor de desarrollo
2. Abre `data.yml` y edita la información del producto
3. Los cambios se reflejarán automáticamente en el navegador

### Para producción
1. Edita `data.yml` con los nuevos productos
2. Ejecuta `npm run build` para generar el sitio optimizado
3. Los archivos listos para deploy estarán en `public/`

### Estructura de un Producto

```yaml
- id: 1
  nombre: "Nombre del Producto"
  descripcion: "Descripción breve"
  precio: 650
  categoria: "plasticos"
  subcategoria: "bolsas"  # Opcional
  caracteristicas:
    - "Característica 1"
    - "Característica 2"
  imagen: "https://placehold.com/400x300?text=Producto"
  disponible: true
```

## Imágenes

- **Con foto real**: Coloca la imagen en `public/` y referencia el nombre en `data.yml`
- **Sin foto**: Usa placehold.com automáticamente (ya configurado en el sistema)

Ejemplo con imagen real:
```yaml
imagen: "producto.jpg"  # Archivo en public/producto.jpg
```

## GitHub Pages

**URL del sitio:** https://carlos-sweb.github.io/dsy-catalogo/

Para configurar/actualizar GitHub Pages:

1. Asegúrate de que los cambios estén en la rama `main`
2. Ejecuta `npm run build` para generar el HTML actualizado
3. Haz commit y push:
   ```bash
   git add .
   git commit -m "Actualizar catálogo de productos"
   git push origin main
   ```
4. Ve a Settings > Pages en tu repositorio de GitHub
5. Configura:
   - **Source:** Deploy from a branch
   - **Branch:** main
   - **Folder:** / (root)
6. GitHub Pages automáticamente servirá los archivos desde la raíz

**Nota importante:** El build automáticamente copia los archivos de `public/` a la raíz, por lo que GitHub Pages sirve desde `/` (raíz) y no desde `/public/`.

## Categorías Disponibles

- **Plásticos** (subcategorías: Bolsas, Vasos)
- **Perfumería**
- **Tabaquería**
- **Adhesivos**

## Tecnologías

- **Frontend**: Mithril.js + HTML5
- **CSS**: Tailwind CSS (con PostCSS y Autoprefixer)
- **Build**: Vite.js
- **Iconos**: Lucide Icons
- **Datos**: YAML (importado dinámicamente)
- **Hosting**: GitHub Pages
- **PWA**: Service Worker + Manifest

## Comandos Disponibles

```bash
npm run dev      # Servidor de desarrollo con hot-reload (puerto 3000)
npm run build    # Generar sitio estático optimizado
npm run preview  # Previsualizar build de producción
npm run icons    # Generar iconos PWA en múltiples tamaños
```

## Contribuir

1. Inicia el servidor de desarrollo: `npm run dev`
2. Edita `data.yml` con los nuevos productos
3. Verifica los cambios en el navegador (hot-reload automático)
4. Ejecuta `npm run build` para generar la versión de producción
5. Haz commit y push a GitHub

## Licencia

MIT