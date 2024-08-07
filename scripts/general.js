function noDisponible() {
    alert("Lo siento, esta función todavía no está disponible");
}

function prohibido() {
    alert("Todavía no tienes acceso a esta sección");
}

function goToPage(page) {
    window.location.href = "/paginas/" + page + ".html";
}

function goToTest(nombreTest) {
    window.location.href = "/paginas/test.html?nombre=" + encodeURIComponent(nombreTest);
}

function redirigirAIndex() {
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