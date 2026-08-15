// Umbrales de progreso que no pertenecen a un test/texto concreto,
// sino a la entrada a una sección completa o a un nivel de transcripción.
const UMBRALES = {
    seccionConsonantes: 4,
    seccionVocales: 26,
    seccionExtra: 62,
    transcripcionInicial: 45,
    // El desbloqueador más alto de todo el curso (el último texto de vocales).
    // Actualízalo a mano si algún día añades contenido con un desbloqueador mayor.
    progresoMaximo: 66
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

// Traduce el par accion+destino de un ítem de catálogo (json/catalogos/*.json)
// a la función real que debe ejecutar el botón correspondiente.
function resolverAccion(accion, destino) {
    if (accion === 'test') return () => realizarTest(destino);
    if (accion === 'pagina') return () => irAPagina(destino);
    return () => prohibido();
}

// Carga un catálogo de sección (json/catalogos/consonantes.json, vocales.json o
// extra.json), y para cada ítem ya desbloqueado según `progreso` le quita la
// clase "prohibido" y asigna su comportamiento y texto al botón #id
// correspondiente (que debe existir ya en el HTML de la página, con
// class="btnSeccion prohibido" y onclick="prohibido()" por defecto). También
// le añade la insignia de "recién desbloqueado" si corresponde, y la retira
// al hacer clic. Devuelve la lista de ítems del catálogo, por si la página la
// necesita (p. ej. para atajos de teclado dinámicos).
async function cargarInfoBotones(rutaCatalogo, progreso, seccion) {
    const identificador = sessionStorage.getItem('idUsuario');
    const pendientes = obtenerInsigniasPendientes(identificador);
    const animacionesVistas = obtenerAnimacionesVistas(identificador);
    const respuesta = await fetch(rutaCatalogo);
    const { items } = await respuesta.json();
    items.forEach(item => {
        if (progreso < item.desbloqueador) return;
        const btn = document.getElementById(item.id);
        const claveItem = seccion + ':' + item.destino;
        const accion = resolverAccion(item.accion, item.destino);
        btn.onclick = function () {
            marcarVisitado(identificador, claveItem);
            actualizarInsignia(btn, false);
            accion();
        };
        if (item.nivel === 'Avanzado') btn.parentElement.classList.remove('grupoOculto');

        // La animación de apertura es solo para la primera vez que se ve el
        // botón ya desbloqueado: si el alumno lo ignora y la insignia sigue
        // pendiente, en la siguiente visita se muestra ya desbloqueado sin
        // volver a animarlo (por eso animacionesVistas es un registro aparte
        // de insigniasPendientes, que no se toca hasta que el alumno lo abre).
        if (pendientes.has(claveItem) && !animacionesVistas.has(claveItem)) {
            marcarAnimacionVista(identificador, claveItem);
            animarDesbloqueoTest(btn, item.texto);
        } else {
            btn.classList.remove('prohibido');
            btn.querySelector('.textoBtn').innerHTML = item.texto;
            actualizarInsignia(btn, pendientes.has(claveItem));
        }
    });
    return items;
}

// Anima la apertura de un test recién desbloqueado: el fondo pasa del gris de
// bloqueado a su color propio (transición ya definida en menu.css sobre
// .btnSeccion), el candado 🔒 "salta" a 🔓 y un instante después se desvanece
// para revelar el nombre del test — mientras, la insignia de "nuevo" aparece
// a la vez creciendo desde un punto diminuto (ver @keyframes aparecerInsignia
// en general.css). El pequeño retraso inicial deja que la página se asiente
// antes de empezar, para que la animación no se pierda en la carga.
function animarDesbloqueoTest(btn, textoFinal) {
    const textoBtn = btn.querySelector('.textoBtn');
    const RETRASO_INICIAL = 500;
    const DURACION_POP = 400;
    const ESPERA_ABIERTO = 300;
    const DURACION_DESVANECIDO = 300;

    setTimeout(() => {
        btn.classList.remove('prohibido');
        actualizarInsignia(btn, true);
        textoBtn.textContent = '🔓';
        textoBtn.classList.add('candadoAbriendose');

        setTimeout(() => {
            textoBtn.style.opacity = '0';
            setTimeout(() => {
                textoBtn.classList.remove('candadoAbriendose');
                textoBtn.innerHTML = textoFinal;
                textoBtn.style.opacity = '1';
            }, DURACION_DESVANECIDO);
        }, DURACION_POP + ESPERA_ABIERTO);
    }, RETRASO_INICIAL);
}

// Sistema de insignias ("circulito") para señalar los mismos ítems que
// aparecen en el modal de "nuevos desbloqueos" de home.html (no todo lo
// desbloqueado sin abrir, solo lo recién desbloqueado) mientras el alumno no
// los haya abierto. Se guarda por alumno y por dispositivo/navegador
// (localStorage), igual que `progresoVisto_<identificador>`.
function claveInsignias(identificador) {
    return 'insigniasPendientes_' + identificador;
}

function obtenerInsigniasPendientes(identificador) {
    try {
        const guardado = JSON.parse(localStorage.getItem(claveInsignias(identificador)));
        return new Set(Array.isArray(guardado) ? guardado : []);
    } catch (error) {
        return new Set();
    }
}

// Añade al conjunto de insignias pendientes las claves recién desbloqueadas
// (llamado desde home.html cuando el progreso ha avanzado desde la última vez).
function agregarInsigniasPendientes(identificador, claves) {
    if (claves.length === 0) return;
    const pendientes = obtenerInsigniasPendientes(identificador);
    claves.forEach(clave => pendientes.add(clave));
    localStorage.setItem(claveInsignias(identificador), JSON.stringify([...pendientes]));
}

// Retira la insignia pendiente de un ítem (al abrirlo).
function marcarVisitado(identificador, clave) {
    const pendientes = obtenerInsigniasPendientes(identificador);
    if (!pendientes.has(clave)) return;
    pendientes.delete(clave);
    localStorage.setItem(claveInsignias(identificador), JSON.stringify([...pendientes]));
}

// Registro de qué ítems ya han reproducido su animación de "recién
// desbloqueado" (ver animarDesbloqueoTest) alguna vez, para no repetirla en
// visitas posteriores mientras el alumno lo ignore y la insignia siga
// pendiente. Deliberadamente independiente de insigniasPendientes: esta se
// marca la primera vez que se VE el botón desbloqueado, no cuando se ABRE.
function claveAnimacionesVistas(identificador) {
    return 'animacionesVistas_' + identificador;
}

function obtenerAnimacionesVistas(identificador) {
    try {
        const guardado = JSON.parse(localStorage.getItem(claveAnimacionesVistas(identificador)));
        return new Set(Array.isArray(guardado) ? guardado : []);
    } catch (error) {
        return new Set();
    }
}

function marcarAnimacionVista(identificador, clave) {
    const vistas = obtenerAnimacionesVistas(identificador);
    if (vistas.has(clave)) return;
    vistas.add(clave);
    localStorage.setItem(claveAnimacionesVistas(identificador), JSON.stringify([...vistas]));
}

// Crea o retira el circulito de "nuevo" en la esquina superior derecha de un
// elemento (que debe tener o heredar `position: relative`).
function actualizarInsignia(elemento, mostrar) {
    if (!elemento) return;
    let insignia = elemento.querySelector('.insigniaNuevo');
    if (mostrar && !insignia) {
        insignia = document.createElement('span');
        insignia.className = 'insigniaNuevo';
        elemento.appendChild(insignia);
    } else if (!mostrar && insignia) {
        insignia.remove();
    }
}

// Muestra la insignia en el botón #btnTextos si el alumno tiene algún texto
// recién desbloqueado que todavía no ha abierto.
async function actualizarInsigniaTextos(seccion, rutaTextos, progreso) {
    const identificador = sessionStorage.getItem('idUsuario');
    const pendientes = obtenerInsigniasPendientes(identificador);
    try {
        const respuesta = await fetch(rutaTextos);
        const datos = await respuesta.json();
        const hayNuevo = datos.textos.some(t => progreso >= t.desbloqueador && pendientes.has(seccion + ':texto:' + t.titulo));
        actualizarInsignia(document.getElementById('btnTextos'), hayNuevo);
    } catch (error) {
        console.error('No se pudo comprobar si hay textos nuevos:', error);
    }
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