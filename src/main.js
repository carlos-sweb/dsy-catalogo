// Importar dependencias
import _ from 'lodash';
import m from 'mithril';
import { createIcons, Search, X, ChevronDown } from 'lucide';

// Hacer disponibles globalmente para uso en el HTML
window._ = _;
window.m = m;
window.createIcons = createIcons;
window.lucideIcons = { Search, X, ChevronDown };

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
    // Montar componente de búsqueda
    m.mount(document.getElementById('search-container'), SearchComponent);
});

// Exportar para uso global
window.SearchComponent = SearchComponent;
