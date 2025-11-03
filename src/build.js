const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Rutas
const DATA_FILE = path.join(__dirname, '..', 'data.yml');
const OUTPUT_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'index.html');

// Leer y parsear el archivo YAML
console.log('📖 Leyendo datos desde data.yml...');
const yamlData = fs.readFileSync(DATA_FILE, 'utf8');
const data = yaml.load(yamlData);

console.log(`✓ ${data.productos.length} productos cargados`);
console.log(`✓ ${data.categorias.length} categorías encontradas`);

// Colores por categoría
const colores = {
  blue: { bg: 'bg-blue-600', bgGradient: 'from-blue-600 to-blue-800', text: 'text-blue-600', bgLight: 'bg-blue-50', fill: '#3B82F6' },
  green: { bg: 'bg-green-600', bgGradient: 'from-green-600 to-green-800', text: 'text-green-600', bgLight: 'bg-green-50', fill: '#10B981' },
  purple: { bg: 'bg-purple-600', bgGradient: 'from-purple-600 to-purple-800', text: 'text-purple-600', bgLight: 'bg-purple-50', fill: '#A855F7' },
  red: { bg: 'bg-red-600', bgGradient: 'from-red-600 to-red-800', text: 'text-red-600', bgLight: 'bg-red-50', fill: '#DC2626' },
  orange: { bg: 'bg-orange-600', bgGradient: 'from-orange-600 to-orange-800', text: 'text-orange-600', bgLight: 'bg-orange-50', fill: '#F97316' }
};

// Función para generar tarjeta de producto
function generarProductoHTML(producto, colorConfig) {
  const esImagenReal = !producto.imagen.includes('placehold.com');
  const caracteristicasHTML = producto.caracteristicas
    .map(c => `<p class="text-base text-gray-700 leading-relaxed"><span class="font-semibold text-lg">•</span> ${c}</p>`)
    .join('\n                            ');

  const imagenHTML = esImagenReal
    ? `<img src="${producto.imagen}"
             alt="${producto.nombre}"
             class="w-full h-full object-cover"
             loading="lazy">`
    : `<svg class="w-full h-full" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                                <rect width="300" height="200" fill="${colorConfig.fill}"/>
                                <text x="150" y="100" font-size="28" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${producto.nombre}</text>
                            </svg>`;

  // Formato especial para productos con precio unitario
  const precioHTML = producto.precio_unitario
    ? `<div class="text-center border-t-2 ${colorConfig.bg.replace('bg-', 'border-')} pt-5 mt-5">
                        <p class="text-lg text-gray-600 mb-3 font-medium">Valor display completo</p>
                        <span class="text-5xl font-bold ${colorConfig.text}">${data.configuracion.simbolo_moneda}${producto.precio.toLocaleString('es-MX')}</span>
                        <p class="text-base text-gray-500 mt-2">Precio unitario: ${data.configuracion.simbolo_moneda}${producto.precio_unitario}</p>
                    </div>`
    : `<div class="text-center border-t-2 ${colorConfig.bg.replace('bg-', 'border-')} pt-5 mt-5">
                        <span class="text-5xl font-bold ${colorConfig.text}">${data.configuracion.simbolo_moneda}${producto.precio.toLocaleString('es-MX')}</span>
                    </div>`;

  return `
                    <div class="producto-card bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden" data-nombre="${producto.nombre.toLowerCase()}" data-categoria="${producto.categoria}" data-id="${producto.id}">
                        <!-- Imagen a pantalla completa -->
                        <div class="${colorConfig.bgLight} h-56 flex items-center justify-center overflow-hidden">
                            ${imagenHTML}
                        </div>

                        <!-- Contenido con padding -->
                        <div class="p-6">
                            <h4 class="text-2xl font-bold text-gray-800 mb-3 leading-tight">${producto.nombre}</h4>
                            <p class="text-lg text-gray-600 mb-5 leading-relaxed">${producto.descripcion}</p>

                            <div class="bg-gray-50 rounded-lg p-4 mb-5 space-y-2">
                                ${caracteristicasHTML}
                            </div>

                            ${precioHTML}
                        </div>
                    </div>`;
}

// Generar HTML por categoría
function generarCategoriasHTML() {
  let html = '';

  data.categorias.forEach(categoria => {
    const colorConfig = colores[categoria.color] || colores.blue;

    // Filtrar productos de esta categoría
    const productosCategoria = data.productos.filter(p => p.categoria === categoria.id);

    if (productosCategoria.length === 0) return;

    html += `
        <!-- SECCIÓN ${categoria.nombre.toUpperCase()} -->
        <section class="categoria-section mb-20" data-categoria="${categoria.id}">
            <div class="flex items-center gap-4 mb-10">
                <div class="w-2 h-12 ${colorConfig.bg} rounded-full"></div>
                <h2 class="text-4xl font-bold text-gray-800">${categoria.nombre}</h2>
            </div>
`;

    // Si hay subcategorías
    if (categoria.subcategorias && categoria.subcategorias.length > 0) {
      categoria.subcategorias.forEach(subcategoria => {
        const productosSubcategoria = productosCategoria.filter(p => p.subcategoria === subcategoria.id);

        if (productosSubcategoria.length === 0) return;

        const subColorConfig = colores[subcategoria.color] || colorConfig;

        html += `
            <!-- Subsección ${subcategoria.nombre} -->
            <div class="mb-12">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-1.5 h-8 ${subColorConfig.bg} rounded-full"></div>
                    <h3 class="text-2xl font-bold text-gray-700">${subcategoria.nombre}</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">`;

        productosSubcategoria.forEach(producto => {
          html += generarProductoHTML(producto, subColorConfig);
        });

        html += `
                </div>
            </div>`;
      });
    } else {
      // Sin subcategorías, mostrar todos los productos directamente
      html += `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">`;

      productosCategoria.forEach(producto => {
        html += generarProductoHTML(producto, colorConfig);
      });

      html += `
            </div>`;
    }

    html += `
        </section>`;
  });

  return html;
}

// Plantilla HTML completa
const htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.configuracion.nombre_tienda}</title>
    <meta name="description" content="${data.configuracion.descripcion_tienda}">

    <!-- Google Fonts - Poppins -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Lodash -->
    <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>

    <!-- Mithril.js -->
    <script src="https://unpkg.com/mithril/mithril.js"></script>

    <style>
        body {
            font-family: 'Poppins', sans-serif;
        }
        .producto-card {
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .producto-card.hidden {
            display: none;
        }
        .categoria-section {
            transition: opacity 0.3s ease;
        }
        .categoria-section.hidden {
            display: none;
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div class="max-w-7xl mx-auto px-4">
            <h1 class="text-5xl md:text-6xl font-bold mb-3">${data.configuracion.nombre_tienda}</h1>
            <p class="text-xl text-blue-100">${data.configuracion.descripcion_tienda}</p>
        </div>
    </header>

    <!-- Buscador de Productos -->
    <div id="search-bar" class="bg-white border-b-4 border-blue-600 shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-6">
            <div id="search-container"></div>
        </div>
    </div>

    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto px-4 py-12">
        ${generarCategoriasHTML()}
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-10 mt-20">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-gray-400 text-lg mb-3">© ${data.configuracion.año} ${data.configuracion.nombre_tienda}</p>
            <p class="text-gray-500 text-base">${data.configuracion.nota_legal}</p>
        </div>
    </footer>

    <!-- Script de búsqueda con Mithril.js -->
    <script>
        // Componente de búsqueda
        const SearchComponent = {
            searchTerm: '',
            totalProducts: 0,
            visibleProducts: 0,
            debouncedFilter: null,

            oninit: function() {
                this.totalProducts = document.querySelectorAll('.producto-card').length;
                this.visibleProducts = this.totalProducts;

                // Crear función debounced con 300ms de delay
                this.debouncedFilter = _.debounce((term) => {
                    this.applyFilter(term);
                    m.redraw();
                }, 300);
            },

            applyFilter: function(term) {
                const searchLower = term.toLowerCase();
                const cards = document.querySelectorAll('.producto-card');
                let visible = 0;

                // Filtrar productos
                cards.forEach(card => {
                    const nombre = card.getAttribute('data-nombre');
                    if (nombre.includes(searchLower)) {
                        card.classList.remove('hidden');
                        visible++;
                    } else {
                        card.classList.add('hidden');
                    }
                });

                this.visibleProducts = visible;

                // Ocultar/Mostrar categorías según productos visibles
                const categorySections = document.querySelectorAll('.categoria-section');
                categorySections.forEach(section => {
                    const categoriaId = section.getAttribute('data-categoria');
                    // Contar productos visibles en esta categoría
                    const visibleInCategory = section.querySelectorAll('.producto-card:not(.hidden)').length;

                    if (visibleInCategory === 0) {
                        section.classList.add('hidden');
                    } else {
                        section.classList.remove('hidden');
                    }
                });
            },

            handleInput: function(value) {
                // Actualizar searchTerm inmediatamente para mostrar en el input
                this.searchTerm = value;
                // Aplicar filtro con debounce
                this.debouncedFilter(value);
            },

            clearSearch: function() {
                this.searchTerm = '';
                // Cancelar cualquier debounce pendiente
                this.debouncedFilter.cancel();
                // Aplicar filtro inmediatamente
                this.applyFilter('');
                const input = document.getElementById('search-input');
                if (input) {
                    input.value = '';
                    input.focus();
                }
                m.redraw();
            },

            scrollToSearch: function() {
                // Hacer scroll suave hacia la barra de búsqueda
                const searchBar = document.getElementById('search-bar');
                if (searchBar) {
                    // Scroll con comportamiento suave
                    searchBar.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            },

            view: function() {
                return m('div', { class: 'relative' }, [
                    // Input de búsqueda
                    m('div', { class: 'relative' }, [
                        m('input', {
                            id: 'search-input',
                            type: 'text',
                            placeholder: 'Buscar productos por nombre...',
                            value: this.searchTerm,
                            class: 'w-full text-xl px-6 py-4 pr-32 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all',
                            oninput: (e) => {
                                this.handleInput(e.target.value);
                            },
                            onfocus: (e) => {
                                // Pequeño delay para que el teclado se despliegue primero
                                setTimeout(() => {
                                    this.scrollToSearch();
                                }, 150);
                            },
                            onkeydown: (e) => {
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    this.clearSearch();
                                }
                            }
                        }),
                        // Icono de búsqueda
                        m('div', {
                            class: 'absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2'
                        }, [
                            this.searchTerm ?
                                m('button', {
                                    class: 'text-gray-400 hover:text-gray-600 transition-colors p-2',
                                    onclick: () => this.clearSearch(),
                                    title: 'Limpiar búsqueda (Esc)'
                                }, [
                                    m('svg', {
                                        class: 'w-6 h-6',
                                        fill: 'none',
                                        stroke: 'currentColor',
                                        viewBox: '0 0 24 24'
                                    }, [
                                        m('path', {
                                            'stroke-linecap': 'round',
                                            'stroke-linejoin': 'round',
                                            'stroke-width': '2',
                                            d: 'M6 18L18 6M6 6l12 12'
                                        })
                                    ])
                                ])
                            : null,
                            m('svg', {
                                class: 'w-7 h-7 text-gray-400',
                                fill: 'none',
                                stroke: 'currentColor',
                                viewBox: '0 0 24 24'
                            }, [
                                m('path', {
                                    'stroke-linecap': 'round',
                                    'stroke-linejoin': 'round',
                                    'stroke-width': '2',
                                    d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                })
                            ])
                        ])
                    ]),
                    // Contador de resultados
                    this.searchTerm ?
                        m('div', {
                            class: 'mt-3 text-lg text-gray-600'
                        }, [
                            this.visibleProducts === 0 ?
                                m('span', { class: 'text-red-600 font-semibold' },
                                    \`No se encontraron productos que coincidan con "\${this.searchTerm}"\`
                                )
                            : this.visibleProducts === 1 ?
                                m('span', { class: 'text-green-600 font-semibold' },
                                    \`Se encontró 1 producto\`
                                )
                            :
                                m('span', { class: 'text-green-600 font-semibold' },
                                    \`Se encontraron \${this.visibleProducts} productos\`
                                )
                        ])
                    : null
                ]);
            }
        };

        // Montar el componente cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            m.mount(document.getElementById('search-container'), SearchComponent);
        });
    </script>

</body>
</html>
`;

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Escribir archivo HTML
console.log('🔨 Generando HTML estático...');
fs.writeFileSync(OUTPUT_FILE, htmlTemplate, 'utf8');

console.log(`✓ Archivo generado: ${OUTPUT_FILE}`);
console.log('✅ Build completado exitosamente!');
