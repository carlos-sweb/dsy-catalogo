// Importar dependencias
import data from '../data.yml';

// Importar iconos SVG de lucide-static
import copyIcon from 'lucide-static/icons/copy.svg?raw';
import shareIcon from 'lucide-static/icons/share-2.svg?raw';
import arrowLeftIcon from 'lucide-static/icons/arrow-left.svg?raw';
import checkIcon from 'lucide-static/icons/check.svg?raw';

// Hacer disponibles globalmente
window.lucideIcons = {
  copy: copyIcon,
  share: shareIcon,
  arrowLeft: arrowLeftIcon,
  check: checkIcon
};

// Colores por categoría
const colores = {
  blue: { bg: 'bg-blue-600', bgGradient: 'from-blue-600 to-blue-800', text: 'text-blue-600', bgLight: 'bg-blue-50' },
  green: { bg: 'bg-green-600', bgGradient: 'from-green-600 to-green-800', text: 'text-green-600', bgLight: 'bg-green-50' },
  purple: { bg: 'bg-purple-600', bgGradient: 'from-purple-600 to-purple-800', text: 'text-purple-600', bgLight: 'bg-purple-50' },
  red: { bg: 'bg-red-600', bgGradient: 'from-red-600 to-red-800', text: 'text-red-600', bgLight: 'bg-red-50' },
  orange: { bg: 'bg-orange-600', bgGradient: 'from-orange-600 to-orange-800', text: 'text-orange-600', bgLight: 'bg-orange-50' }
};

// Función para generar cards de medios de pago
function generarMediosDePagoHTML() {
  if (!data.medios_de_pago || data.medios_de_pago.length === 0) {
    return '<p class="text-center text-gray-600">No hay medios de pago configurados</p>';
  }

  return data.medios_de_pago.map(medio => {
    const colorConfig = colores[medio.color] || colores.blue;

    return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div class="bg-gradient-to-r ${colorConfig.bgGradient} px-8 py-6 flex justify-between items-center">
                <h2 class="text-3xl font-bold text-white">${medio.banco}</h2>
                <button onclick="copiarCuenta('${medio.id}')"
                        class="copy-btn p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Copiar información de la cuenta"
                        aria-label="Copiar información de la cuenta">
                    <span data-icon="copy" class="h-6 w-6 text-white inline-block"></span>
                </button>
            </div>

            <div class="p-8 space-y-6" id="cuenta-${medio.id}">
                <div class="border-l-4 ${colorConfig.bg.replace('bg-', 'border-')} pl-6 py-2">
                    <p class="text-sm text-gray-600 font-semibold mb-1">Tipo de cuenta</p>
                    <p class="text-xl text-gray-800">${medio.tipo_cuenta}</p>
                </div>

                <div class="border-l-4 ${colorConfig.bg.replace('bg-', 'border-')} pl-6 py-2">
                    <p class="text-sm text-gray-600 font-semibold mb-1">Número de cuenta</p>
                    <p class="text-2xl font-mono text-gray-800 tracking-wide">${medio.numero_cuenta}</p>
                </div>

                <div class="border-l-4 ${colorConfig.bg.replace('bg-', 'border-')} pl-6 py-2">
                    <p class="text-sm text-gray-600 font-semibold mb-1">Razón Social</p>
                    <p class="text-xl text-gray-800">${medio.razon_social}</p>
                </div>

                <div class="border-l-4 ${colorConfig.bg.replace('bg-', 'border-')} pl-6 py-2">
                    <p class="text-sm text-gray-600 font-semibold mb-1">RUT</p>
                    <p class="text-xl text-gray-800">${medio.rut}</p>
                </div>
            </div>

            <div class="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-between items-center">
                <p class="text-sm text-gray-600 flex-1">
                    ${medio.nota}
                </p>
                <button onclick="compartirCuenta('${medio.id}')"
                        class="share-btn ml-4 p-3 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                        title="Compartir información de la cuenta"
                        aria-label="Compartir información de la cuenta">
                    <span data-icon="share" class="h-6 w-6 text-blue-600 inline-block"></span>
                </button>
            </div>
        </div>
    `;
  }).join('\n');
}

// Actualizar el contenido de la página
function actualizarContenido() {
  // Actualizar header
  document.getElementById('store-name').textContent = data.configuracion.nombre_tienda;

  // Actualizar footer
  document.getElementById('footer-copyright').textContent = `© ${data.configuracion.año} ${data.configuracion.nombre_tienda}`;
  document.getElementById('footer-legal').textContent = data.configuracion.nota_legal;

  // Actualizar title
  document.title = `Medios de Pago - ${data.configuracion.nombre_tienda}`;

  // Generar y mostrar medios de pago
  const container = document.getElementById('payment-methods-container');
  container.innerHTML = generarMediosDePagoHTML();

  // Agregar botón volver
  const volverBtn = document.createElement('div');
  volverBtn.className = 'mt-8 text-center';
  volverBtn.innerHTML = `
    <a href="./index.html" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-md hover:shadow-lg">
      <span data-icon="arrowLeft" class="h-5 w-5 inline-block"></span>
      Volver al catálogo
    </a>
  `;
  container.appendChild(volverBtn);

  // Inicializar iconos SVG
  document.querySelectorAll('[data-icon]').forEach(el => {
    const iconName = el.getAttribute('data-icon');
    if (window.lucideIcons && window.lucideIcons[iconName]) {
      el.innerHTML = window.lucideIcons[iconName];
    }
  });
}

// Función para copiar información de la cuenta
window.copiarCuenta = function(cuentaId) {
  const cuenta = data.medios_de_pago.find(c => c.id === cuentaId);
  if (!cuenta) return;

  const texto = `${cuenta.banco}
Tipo de cuenta: ${cuenta.tipo_cuenta}
Número de cuenta: ${cuenta.numero_cuenta}
Razón Social: ${cuenta.razon_social}
RUT: ${cuenta.rut}`;

  navigator.clipboard.writeText(texto).then(() => {
    const btn = event.currentTarget;
    const icon = btn.querySelector('[data-icon]');

    if (icon && window.lucideIcons) {
      icon.innerHTML = window.lucideIcons.check;
      btn.classList.add('pulse-success');

      setTimeout(() => {
        icon.innerHTML = window.lucideIcons.copy;
        btn.classList.remove('pulse-success');
      }, 2000);
    }
  }).catch(err => {
    console.error('Error al copiar:', err);
    alert('No se pudo copiar la información');
  });
};

// Función para compartir información de la cuenta
window.compartirCuenta = function(cuentaId) {
  const cuenta = data.medios_de_pago.find(c => c.id === cuentaId);
  if (!cuenta) return;

  const texto = `${cuenta.banco}
Tipo de cuenta: ${cuenta.tipo_cuenta}
Número de cuenta: ${cuenta.numero_cuenta}
Razón Social: ${cuenta.razon_social}
RUT: ${cuenta.rut}`;

  if (navigator.share) {
    navigator.share({
      title: `Información de pago - ${cuenta.banco}`,
      text: texto
    }).then(() => {
      console.log('Compartido exitosamente');
    }).catch(err => {
      if (err.name !== 'AbortError') {
        console.error('Error al compartir:', err);
      }
    });
  } else {
    navigator.clipboard.writeText(texto).then(() => {
      alert('Información copiada al portapapeles');
    }).catch(err => {
      console.error('Error al copiar:', err);
      alert('No se pudo compartir la información');
    });
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  actualizarContenido();
});
