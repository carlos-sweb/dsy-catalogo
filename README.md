# DSY Catálogo - Catálogo Oficial Paquetería

Sitio web estático para mostrar productos de paquetería y accesorios. Generado dinámicamente desde datos YAML usando Node.js.

## Estructura del Proyecto

```
dsy-catalogo/
├── public/              # Sitio estático (se despliega en GitHub Pages)
│   ├── index.html       # HTML generado automáticamente
│   └── assets/          # Recursos estáticos (imágenes, etc.)
├── src/
│   └── build.js         # Script de construcción Node.js
├── data.yml             # Datos de productos en formato YAML
├── package.json         # Dependencias del proyecto
└── .claudecode          # Contexto para Claude Code
```

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

Para desplegar en GitHub Pages:

1. Asegúrate de que los cambios estén en la rama `main`
2. Ve a Settings > Pages en tu repositorio de GitHub
3. Selecciona la carpeta `public/` como fuente
4. GitHub Pages automáticamente servirá el contenido de `public/`

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