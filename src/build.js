const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { minify } = require('html-minifier-terser');
const { execSync } = require('child_process');

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
                        <span class="text-5xl font-bold ${colorConfig.text}">${data.configuracion.simbolo_moneda}${producto.precio.toLocaleString('es-CL')}</span>
                        <p class="text-base text-gray-500 mt-2">Precio unitario: ${data.configuracion.simbolo_moneda}${producto.precio_unitario}</p>
                    </div>`
    : `<div class="text-center border-t-2 ${colorConfig.bg.replace('bg-', 'border-')} pt-5 mt-5">
                        <span class="text-5xl font-bold ${colorConfig.text}">${data.configuracion.simbolo_moneda}${producto.precio.toLocaleString('es-CL')}</span>
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

                            <!-- Botón para mostrar/ocultar características -->
                            <div class="flex justify-end mb-3">
                                <button class="toggle-caracteristicas text-sm ${colorConfig.text} hover:underline focus:outline-none flex items-center gap-2 transition-all" onclick="toggleCaracteristicas(event)">
                                    <span class="font-medium">Ver más</span>
                                    <svg class="chevron w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                            </div>

                            <!-- Características (ocultas por defecto) -->
                            <div class="caracteristicas-container bg-gray-50 rounded-lg space-y-2">
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

    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#2563eb">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="DSY Catálogo">
    <link rel="manifest" href="./manifest.json">

    <!-- Apple Touch Icons -->
    <link rel="apple-touch-icon" sizes="72x72" href="./icons/icon-72x72.svg">
    <link rel="apple-touch-icon" sizes="96x96" href="./icons/icon-96x96.svg">
    <link rel="apple-touch-icon" sizes="128x128" href="./icons/icon-128x128.svg">
    <link rel="apple-touch-icon" sizes="144x144" href="./icons/icon-144x144.svg">
    <link rel="apple-touch-icon" sizes="152x152" href="./icons/icon-152x152.svg">
    <link rel="apple-touch-icon" sizes="192x192" href="./icons/icon-192x192.svg">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="./icons/icon-72x72.svg">

    <!-- Tailwind CSS optimizado -->
    <link href="./styles.css" rel="stylesheet">

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

        /* Botón flotante de búsqueda */
        .search-fab {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 1000;
            border: 2px solid #e5e7eb;
        }

        .search-fab:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15), 0 12px 32px rgba(0, 0, 0, 0.2);
            background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
        }

        .search-fab:active {
            transform: scale(0.95);
        }

        .search-fab svg {
            width: 28px;
            height: 28px;
            color: #374151;
        }

        /* Animación de pulso para el FAB */
        @keyframes pulse {
            0%, 100% {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.15);
            }
            50% {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.25);
            }
        }

        .search-fab.pulse {
            animation: pulse 2s ease-in-out infinite;
        }

        /* Animación suave para características */
        .caracteristicas-container {
            overflow: hidden;
            opacity: 0;
            transform: translateY(-10px);
            transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        margin 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            margin-bottom: 0;
            padding: 0;
            height: 0;
        }

        .caracteristicas-container.show {
            opacity: 1;
            transform: translateY(0);
            margin-bottom: 1.25rem;
            padding: 1rem;
        }

        /* Animación del chevron */
        .chevron {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    <div id="search-bar" class="bg-white border-b-4 border-blue-600 shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-6">
            <div id="search-container"></div>
        </div>
    </div>

    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto px-4 py-12">
        ${generarCategoriasHTML()}
    </main>

    <!-- Botón flotante de búsqueda -->
    <button id="search-fab" class="search-fab" aria-label="Buscar productos" title="Buscar productos">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    </button>

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

    <!-- Botón flotante de búsqueda -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const searchFab = document.getElementById('search-fab');
            const searchBar = document.getElementById('search-bar');
            const searchInput = document.getElementById('search-input');

            // Click en el botón flotante
            searchFab.addEventListener('click', function() {
                // Hacer scroll suave hacia el input de búsqueda
                searchBar.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Esperar a que termine el scroll y hacer focus en el input
                setTimeout(() => {
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 500);
            });

            // Mostrar/ocultar el FAB según el scroll
            let lastScrollTop = 0;
            window.addEventListener('scroll', function() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const searchBarBottom = searchBar.offsetTop + searchBar.offsetHeight;

                // Si estamos más abajo que la barra de búsqueda, mostrar el FAB
                if (scrollTop > searchBarBottom + 100) {
                    searchFab.style.opacity = '1';
                    searchFab.style.transform = 'scale(1)';
                    searchFab.style.pointerEvents = 'auto';
                } else {
                    // Si estamos arriba, ocultar el FAB
                    searchFab.style.opacity = '0';
                    searchFab.style.transform = 'scale(0)';
                    searchFab.style.pointerEvents = 'none';
                }

                lastScrollTop = scrollTop;
            }, { passive: true });

            // Estado inicial: ocultar el FAB
            searchFab.style.opacity = '0';
            searchFab.style.transform = 'scale(0)';
            searchFab.style.pointerEvents = 'none';
            searchFab.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    </script>

    <!-- Toggle de características -->
    <script>
        function toggleCaracteristicas(event) {
            const button = event.currentTarget;
            const card = button.closest('.producto-card');
            const container = card.querySelector('.caracteristicas-container');
            const chevron = button.querySelector('.chevron');
            const buttonText = button.querySelector('span');

            // Toggle clase show para animación
            const isShowing = container.classList.contains('show');

            if (isShowing) {
                // Primero establecer la altura actual para permitir transición
                const currentHeight = container.scrollHeight;
                container.style.height = currentHeight + 'px';

                // Forzar reflow
                container.offsetHeight;

                // Ocultar con animación
                container.style.height = '0px';
                container.classList.remove('show');
                chevron.style.transform = 'rotate(0deg)';
                buttonText.textContent = 'Ver más';
            } else {
                // Primero agregar la clase para aplicar padding y margin
                container.classList.add('show');

                // Forzar reflow para que el navegador calcule la altura con padding
                container.offsetHeight;

                // Calcular la altura real del contenido (incluyendo padding y un margen de seguridad)
                const targetHeight = container.scrollHeight + 50; // +50px margen de seguridad para líneas largas

                // Establecer altura inicial en 0
                container.style.height = '0px';

                // Forzar otro reflow
                requestAnimationFrame(() => {
                    // Animar a la altura real
                    container.style.height = targetHeight + 'px';
                });

                chevron.style.transform = 'rotate(180deg)';
                buttonText.textContent = 'Ocultar';
            }
        }
    </script>

    <!-- Service Worker Registration -->
    <script>
        // Registrar Service Worker para PWA
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .then((registration) => {
                        console.log('✅ Service Worker registrado:', registration.scope);

                        // Verificar actualizaciones
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            console.log('🔄 Nueva versión del Service Worker detectada');

                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('✨ Nueva versión disponible. Recarga para actualizar.');
                                    // Opcional: Mostrar notificación al usuario
                                    if (confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')) {
                                        window.location.reload();
                                    }
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        console.error('❌ Error al registrar Service Worker:', error);
                    });
            });
        } else {
            console.log('⚠️ Service Worker no soportado en este navegador');
        }

        // Detectar si la app está instalada
        window.addEventListener('beforeinstallprompt', (event) => {
            // Prevenir el prompt automático
            event.preventDefault();

            // Guardar el evento para mostrarlo más tarde
            window.deferredPrompt = event;

            console.log('📱 La aplicación puede ser instalada');

            // Opcional: Mostrar botón de instalación personalizado
            // Aquí podrías mostrar un banner o botón para instalar la PWA
        });

        // Detectar cuando la app ha sido instalada
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA instalada correctamente');
            window.deferredPrompt = null;
        });
    </script>

</body>
</html>
`;

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Función para generar CSS optimizado con Tailwind
function buildTailwindCSS() {
  console.log('🎨 Generando CSS optimizado con Tailwind...');

  const INPUT_CSS = path.join(__dirname, 'input.css');
  const OUTPUT_CSS = path.join(OUTPUT_DIR, 'styles.css');

  try {
    // Ejecutar Tailwind CLI
    execSync(
      `npx tailwindcss -i ${INPUT_CSS} -o ${OUTPUT_CSS} --minify`,
      { stdio: 'pipe' }
    );

    // Verificar tamaño del CSS generado
    const cssSize = fs.statSync(OUTPUT_CSS).size;
    console.log(`✓ CSS generado: ${OUTPUT_CSS}`);
    console.log(`✓ Tamaño CSS optimizado: ${(cssSize / 1024).toFixed(2)}KB`);
  } catch (error) {
    console.error('❌ Error al generar CSS:', error.message);
    throw error;
  }
}

// Función async principal para manejar la minificación
async function buildHTML() {
  console.log('🔨 Generando HTML estático...');

  // Opciones de minificación
  const minifyOptions = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
  };

  try {
    // Minificar HTML (async)
    const minifiedHTML = await minify(htmlTemplate, minifyOptions);

    // Escribir HTML minificado
    fs.writeFileSync(OUTPUT_FILE, minifiedHTML, 'utf8');

    // Calcular ahorro
    const originalSize = Buffer.byteLength(htmlTemplate, 'utf8');
    const minifiedSize = Buffer.byteLength(minifiedHTML, 'utf8');
    const savings = originalSize - minifiedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

    console.log(`✓ Archivo generado: ${OUTPUT_FILE}`);
    console.log(`✓ Minificación: ${(originalSize / 1024).toFixed(2)}KB → ${(minifiedSize / 1024).toFixed(2)}KB (${savingsPercent}% ahorro)`);
  } catch (error) {
    console.error('❌ Error al minificar HTML:', error.message);
    // Escribir HTML sin minificar en caso de error
    fs.writeFileSync(OUTPUT_FILE, htmlTemplate, 'utf8');
    console.log(`✓ Archivo generado (sin minificar): ${OUTPUT_FILE}`);
  }

  copyFilesToRoot();
}

// Función para copiar archivos a la raíz
function copyFilesToRoot() {
  // Copiar archivos a la raíz para GitHub Pages
  const ROOT_DIR = path.join(__dirname, '..');
  const ROOT_INDEX = path.join(ROOT_DIR, 'index.html');

  console.log('📋 Copiando archivos a la raíz para GitHub Pages...');

  // Copiar index.html a la raíz
  fs.copyFileSync(OUTPUT_FILE, ROOT_INDEX);
  console.log(`✓ index.html copiado a la raíz`);

  // Copiar manifest.json a la raíz
  const MANIFEST_SRC = path.join(OUTPUT_DIR, 'manifest.json');
  const MANIFEST_DEST = path.join(ROOT_DIR, 'manifest.json');
  if (fs.existsSync(MANIFEST_SRC)) {
    fs.copyFileSync(MANIFEST_SRC, MANIFEST_DEST);
    console.log(`✓ manifest.json copiado a la raíz`);
  }

  // Copiar service-worker.js a la raíz con versionado automático
  const SW_SRC = path.join(OUTPUT_DIR, 'service-worker.js');
  const SW_DEST = path.join(ROOT_DIR, 'service-worker.js');
  if (fs.existsSync(SW_SRC)) {
    // Generar versión basada en timestamp
    const cacheVersion = `v${Date.now()}`;

    // Leer service worker y reemplazar placeholder
    let swContent = fs.readFileSync(SW_SRC, 'utf8');
    swContent = swContent.replace(/%%CACHE_VERSION%%/g, cacheVersion);

    // Escribir con versión
    fs.writeFileSync(SW_DEST, swContent, 'utf8');
    console.log(`✓ service-worker.js copiado a la raíz (${cacheVersion})`);
  }

  // Crear symlink o copiar carpeta icons si no existe en la raíz
  const ICONS_SRC = path.join(OUTPUT_DIR, 'icons');
  const ICONS_DEST = path.join(ROOT_DIR, 'icons');
  if (fs.existsSync(ICONS_SRC) && !fs.existsSync(ICONS_DEST)) {
    // Copiar directorio recursivamente
    fs.cpSync(ICONS_SRC, ICONS_DEST, { recursive: true });
    console.log(`✓ Carpeta icons/ copiada a la raíz`);
  }

  // Copiar carpeta assets a la raíz (siempre sincronizar)
  const ASSETS_SRC = path.join(OUTPUT_DIR, 'assets');
  const ASSETS_DEST = path.join(ROOT_DIR, 'assets');
  if (fs.existsSync(ASSETS_SRC)) {
    // Copiar directorio recursivamente (sobrescribir si existe)
    fs.cpSync(ASSETS_SRC, ASSETS_DEST, { recursive: true });
    console.log(`✓ Carpeta assets/ copiada a la raíz`);
  }

  // Copiar styles.css a la raíz
  const CSS_SRC = path.join(OUTPUT_DIR, 'styles.css');
  const CSS_DEST = path.join(ROOT_DIR, 'styles.css');
  if (fs.existsSync(CSS_SRC)) {
    fs.copyFileSync(CSS_SRC, CSS_DEST);
    console.log(`✓ styles.css copiado a la raíz`);
  }

  // Copiar carpeta fonts a la raíz
  const FONTS_SRC = path.join(OUTPUT_DIR, 'fonts');
  const FONTS_DEST = path.join(ROOT_DIR, 'fonts');
  if (fs.existsSync(FONTS_SRC)) {
    fs.cpSync(FONTS_SRC, FONTS_DEST, { recursive: true });
    console.log(`✓ Carpeta fonts/ copiada a la raíz`);
  }

  console.log('✅ Build completado exitosamente!');
}

// Ejecutar el build
async function build() {
  buildTailwindCSS();
  await buildHTML();
}

build();
