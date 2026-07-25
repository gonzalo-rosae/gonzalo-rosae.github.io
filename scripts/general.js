// Umbrales de progreso que no pertenecen a un test/texto concreto,
// sino a la entrada a una sección completa o a un nivel de transcripción.
const UMBRALES = {
    seccionConsonantes: 4,
    seccionVocales: 26,
    seccionExtra: 62,
    transcripcionInicial: 45
};

function noDisponible() {
    alert("Lo siento, esta función todavía no está disponible");
}

function prohibido() {
    alert("Todavía no tienes acceso a esta sección");
}

function irAPagina(page) {
    window.location.href = "/paginas/" + page + ".html";
}

function realizarTest(nombreTest) {
    window.location.href = "/paginas/test.html?nombre=" + encodeURIComponent(nombreTest);
}

function cerrarSesion() {
    sessionStorage.removeItem('idUsuario');
    sessionStorage.removeItem('token');
    window.location.href = '/index.html';
}

function tokenEsValido(token, identificador) {
    try {
        const decodedToken = atob(token);
        const [tokenIdentificador, timestamp, randomPart] = decodedToken.split(':');
        
        if (!tokenIdentificador || !timestamp || !randomPart) {
            return false;
        }
        
        if (tokenIdentificador !== identificador) {
            return false;
        }
        
        const tiempoExpiracion = 24 * 60 * 60 * 1000;
        const tiempoActual = Date.now();
        if (tiempoActual - parseInt(timestamp) > tiempoExpiracion) {
            return false;
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

// El botón/imagen de "volver atrás" (si existe en la página) comparte
// siempre el mismo atajo que la tecla Escape.
document.addEventListener('DOMContentLoaded', function () {
    const flechaAtras = document.getElementById('flechaAtras');
    if (flechaAtras) flechaAtras.dataset.atajo = 'Esc';

    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) btnCerrarSesion.dataset.atajo = 'Esc';
});

// Tooltips de atajos de teclado: cualquier elemento con [data-atajo="X"]
// muestra un circulito con "X" mientras se mantiene pulsada la tecla H.
let tooltipsAtajos = [];

function mostrarAtajos() {
    document.querySelectorAll('[data-atajo]').forEach(elemento => {
        const rect = elemento.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const tooltip = document.createElement('div');
        tooltip.textContent = elemento.dataset.atajo;
        tooltip.className = 'tooltipAtajo';
        tooltip.style.cssText = `
            position: fixed;
            top: ${rect.top - 12}px;
            left: ${rect.left - 12}px;
            min-width: 24px;
            height: 24px;
            padding: 0 4px;
            border-radius: 12px;
            background-color: #ff4646;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            z-index: 99999;
            pointer-events: none;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
        `;
        document.body.appendChild(tooltip);
        tooltipsAtajos.push(tooltip);
    });
}

function ocultarAtajos() {
    tooltipsAtajos.forEach(tooltip => tooltip.remove());
    tooltipsAtajos = [];
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' || event.key === '0') {
        window.history.back();
    } else if (event.key === 'h' || event.key === 'H') {
        const elementoActivo = document.activeElement;
        const escribiendo = elementoActivo && (elementoActivo.tagName === 'INPUT' || elementoActivo.tagName === 'TEXTAREA');
        if (!escribiendo && tooltipsAtajos.length === 0) {
            mostrarAtajos();
        }
    }
});

document.addEventListener('keyup', function (event) {
    if (event.key === 'h' || event.key === 'H') {
        ocultarAtajos();
    }
});