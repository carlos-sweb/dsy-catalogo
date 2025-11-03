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
├── index.html           # HTML en raíz (copiado automáticamente desde public/)
├── manifest.json        # PWA manifest (copiado desde public/)
├── service-worker.js    # Service Worker (copiado desde public/)
├── icons/               # Iconos PWA (copiado desde public/)
├── public/              # Directorio de build
│   ├── index.html       # HTML generado por build.js
│   ├── manifest.json    # Configuración PWA
│   ├── service-worker.js
│   ├── icons/           # Iconos en múltiples tamaños
│   └── assets/          # Recursos estáticos
├── src/
│   ├── build.js         # Script de construcción Node.js
│   ├── server.js        # Servidor local de desarrollo
│   └── generate-icons.js # Generador de iconos
├── data.yml             # Datos de productos en formato YAML
├── package.json         # Dependencias del proyecto
└── .claudecode          # Contexto para Claude Code
```

**Nota:** El comando `npm run build` genera archivos en `public/` y automáticamente los copia a la raíz para GitHub Pages.

## Instalación

```bash
# Instalar dependencias
npm install
```

## Uso

```bash
# Generar el sitio estático
npm run build

# El HTML se generará en public/index.html
```

## Editar Productos

Los productos se gestionan en el archivo `data.yml`. Para agregar o modificar productos:

1. Abre `data.yml`
2. Edita la información del producto siguiendo el formato existente
3. Ejecuta `npm run build` para regenerar el HTML
4. El sitio actualizado estará en `public/index.html`

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

- **Frontend**: HTML5, CSS (Tailwind CDN)
- **Build**: Node.js + js-yaml
- **Hosting**: GitHub Pages
- **Datos**: YAML

## Comandos Disponibles

```bash
npm run build    # Generar sitio estático
```

## Contribuir

1. Edita `data.yml` con los nuevos productos
2. Ejecuta `npm run build`
3. Verifica los cambios en `public/index.html`
4. Haz commit y push a GitHub

## Licencia

MIT