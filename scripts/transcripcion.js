var preguntas, datosPregunta;
var inputRespuesta, respuestaCorrecta, btnComprobar, btnNuevaPalabra;

async function cargarPreguntas() {
    try {
        const transcripciones = await fetch(`../json/transcripciones.json`);
        if (!transcripciones.ok) {
            throw new Error('Error al cargar el archivo JSON');
        }
        const datos = await transcripciones.json();

        if (datos.titulo) {
            document.getElementById("titulo").textContent = datos.titulo;
        }
        if (datos.instrucciones) {
            //document.getElementById('instrucciones').textContent = datos.instrucciones;
        }

        inputRespuesta = document.getElementById("inputRespuesta");
        respuestaCorrecta = document.getElementById("respuestaCorrecta");
        btnComprobar = document.getElementById("btnComprobar");
        btnNuevaPalabra = document.getElementById("btnNuevaPalabra");
        preguntas = datos.preguntas || [];
        //mezclarArray(preguntas);
        cargarNuevaPregunta();

    } catch (error) {
        document.querySelector('.envoltura').innerHTML = '<p>Error al cargar el test: por favor, notifica a Gonzalo para que lo arregle.</p>';
    }
}

function cargarNuevaPregunta() {
    var ultimoIndice = parseInt(localStorage.getItem('ultimoIndice') || '0');
    datosPregunta = preguntas[ultimoIndice++];
    if (ultimoIndice >= preguntas.length) ultimoIndice = 0;
    localStorage.setItem('ultimoIndice', ultimoIndice);

    const elementoPregunta = document.querySelector('#pregunta');
    elementoPregunta.textContent = datosPregunta.pregunta;
    
    const elementoInputRespuesta = document.querySelector('#inputRespuesta');
    inputRespuesta.disabled = false;
    elementoInputRespuesta.value = "";
    elementoInputRespuesta.classList.remove("correcta");
    elementoInputRespuesta.classList.remove("incorrecta");

    btnComprobar.classList.remove("invisible");
    respuestaCorrecta.classList.add("oculto");
}

function añadirAtajosTeclado() {
    document.addEventListener('keydown', function (event) {
        if (event.key == 'Enter') {
            btnComprobar.click();
        }
        else if (event.key == 'Escape') {
            document.activeElement.blur();
        }
        else if (event.key == '<' || event.key == '>') {
            event.preventDefault();
            btnNuevaPalabra.click();
        }
        else if (!event.ctrlKey && !event.altKey && !event.metaKey) {
            inputRespuesta.focus();
        }
    });
}

function comprobarTest() {
    if (inputRespuesta.value == datosPregunta.solucion.toLowerCase()) {
        inputRespuesta.classList.add("correcta");
    }
    else {
        inputRespuesta.classList.add("incorrecta");
        respuestaCorrecta.innerText = datosPregunta.solucion;
        respuestaCorrecta.classList.remove("oculto");
    }
    document.activeElement.blur();
    inputRespuesta.disabled = true;
    btnComprobar.classList.add("invisible");
}


cargarPreguntas();
añadirAtajosTeclado();