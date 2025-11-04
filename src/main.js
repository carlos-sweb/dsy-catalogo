// Importar dependencias
import _ from 'lodash';
import m from 'mithril';
import { createIcons, Search, X, ChevronDown } from 'lucide';
import data from '../data.yml';

// Hacer disponibles globalmente para uso en el HTML
window._ = _;
window.m = m;
window.createIcons = createIcons;
window.lucideIcons = { Search, X, ChevronDown };

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
    ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="w-full h-full object-cover" loading="lazy">`
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
                        <div class="${colorConfig.bgLight} h-56 flex items-center justify-center overflow-hidden">
                            ${imagenHTML}
                        </div>
                        <div class="p-6">
                            <h4 class="text-2xl font-bold text-gray-800 mb-3 leading-tight">${producto.nombre}</h4>
                            <p class="text-lg text-gray-600 mb-5 leading-relaxed">${producto.descripcion}</p>
                            <div class="flex justify-end mb-3">
                                <button class="toggle-caracteristicas text-sm ${colorConfig.text} hover:underline focus:outline-none flex items-center gap-2 transition-all" onclick="toggleCaracteristicas(event)">
                                    <span class="font-medium">Ver más</span>
                                    <i data-lucide="chevron-down" class="chevron w-4 h-4 transform transition-transform"></i>
                                </button>
                            </div>
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
    const productosCategoria = data.productos.filter(p => p.categoria === categoria.id);

    if (productosCategoria.length === 0) return;

    html += `
        <section class="categoria-section mb-20" data-categoria="${categoria.id}">
            <div class="flex items-center gap-4 mb-10">
                <div class="w-2 h-12 ${colorConfig.bg} rounded-full"></div>
                <h2 class="text-4xl font-bold text-gray-800">${categoria.nombre}</h2>
            </div>`;

    // Si hay subcategorías
    if (categoria.subcategorias && categoria.subcategorias.length > 0) {
      categoria.subcategorias.forEach(subcategoria => {
        const productosSubcategoria = productosCategoria.filter(p => p.subcategoria === subcategoria.id);

        if (productosSubcategoria.length === 0) return;

        const subColorConfig = colores[subcategoria.color] || colorConfig;

        html += `
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
      html += `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">`;
      productosCategoria.forEach(producto => {
        html += generarProductoHTML(producto, colorConfig);
      });
      html += `</div>`;
    }

    html += `</section>`;
  });

  return html;
}

// Actualizar el contenido de la página
function actualizarContenido() {
  // Actualizar header
  document.getElementById('store-name').textContent = data.configuracion.nombre_tienda;
  document.getElementById('store-description').textContent = data.configuracion.descripcion_tienda;

  // Actualizar footer
  document.getElementById('footer-copyright').textContent = `© ${data.configuracion.año} ${data.configuracion.nombre_tienda}`;
  document.getElementById('footer-legal').textContent = data.configuracion.nota_legal;

  // Actualizar title
  document.title = data.configuracion.nombre_tienda;

  // Generar y mostrar productos
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = generarCategoriasHTML();

  // Inicializar iconos de Lucide
  createIcons();
}

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
                            m('i', {
                                'data-lucide': 'x',
                                class: 'w-6 h-6',
                                oncreate: () => createIcons({ icons: { X } })
                            })
                        ])
                    : null,
                    m('i', {
                        'data-lucide': 'search',
                        class: 'w-7 h-7 text-gray-400',
                        oncreate: () => createIcons({ icons: { Search } })
                    })
                ])
            ]),
            // Contador de resultados
            this.searchTerm ?
                m('div', {
                    class: 'mt-3 text-lg text-gray-600'
                }, [
                    this.visibleProducts === 0 ?
                        m('span', { class: 'text-red-600 font-semibold' },
                            `No se encontraron productos que coincidan con "${this.searchTerm}"`
                        )
                    : this.visibleProducts === 1 ?
                        m('span', { class: 'text-green-600 font-semibold' },
                            `Se encontró 1 producto`
                        )
                    :
                        m('span', { class: 'text-green-600 font-semibold' },
                            `Se encontraron ${this.visibleProducts} productos`
                        )
                ])
            : null
        ]);
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar contenido con datos de data.yml
    actualizarContenido();

    // Montar componente de búsqueda
    m.mount(document.getElementById('search-container'), SearchComponent);
});

// Exportar para uso global
window.SearchComponent = SearchComponent;
