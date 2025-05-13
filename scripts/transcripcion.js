var preguntas, preguntasFiltradas, datosPregunta;
var inputRespuesta, respuestaCorrecta, btnComprobar, btnNuevaPalabra;
var ultimoIndice, indicesAleatorios;

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

        let ordenTranscripciones = ["vocal corta", "diptongo", "vocal larga"];
        let desbloqueado = sessionStorage.getItem("transcripciones");

        inputRespuesta = document.getElementById("inputRespuesta");
        respuestaCorrecta = document.getElementById("respuestaCorrecta");
        btnComprobar = document.getElementById("btnComprobar");
        btnNuevaPalabra = document.getElementById("btnNuevaPalabra");
        preguntas = datos.preguntas || [];
        preguntasFiltradas = preguntas.filter(pregunta => ordenTranscripciones.indexOf(pregunta.contiene) <= ordenTranscripciones.indexOf(desbloqueado));

        ultimoIndice = parseInt(localStorage.getItem('ultimoIndice') || '0');
        indicesAleatorios = JSON.parse(localStorage.getItem('indicesAleatorios'));
        if (!indicesAleatorios || ultimoIndice === 0) {
            indicesAleatorios = Array.from({ length: preguntasFiltradas.length }, (_, i) => i).sort(() => Math.random() - 0.5);
            localStorage.setItem('indicesAleatorios', JSON.stringify(indicesAleatorios));
        }
        cargarNuevaPregunta();

    } catch (error) {
        document.querySelector('.envoltura').innerHTML = '<p>Error al cargar el test: por favor, notifica a Gonzalo para que lo arregle.</p>';
    }
}

function cargarNuevaPregunta() {
    // Seleccionar la pregunta correspondiente al índice aleatorio actual
    datosPregunta = preguntasFiltradas[indicesAleatorios[ultimoIndice++]];

    // Verificar si se han recorrido todas las preguntas
    if (ultimoIndice >= preguntasFiltradas.length) ultimoIndice = 0;

    // Guardar el índice actualizado en `localStorage`
    localStorage.setItem('ultimoIndice', ultimoIndice);

    // Actualizar la pregunta en el DOM
    const elementoPregunta = document.querySelector('#pregunta');
    elementoPregunta.textContent = datosPregunta.transcripcion;

    // Resetear el campo de entrada de la respuesta
    const elementoInputRespuesta = document.querySelector('#inputRespuesta');
    elementoInputRespuesta.disabled = false;
    elementoInputRespuesta.value = "";
    elementoInputRespuesta.classList.remove("correcta");
    elementoInputRespuesta.classList.remove("incorrecta");

    // Ajustar la visibilidad de otros elementos según el estado
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
    const respuestaNormalizada = inputRespuesta.value.replace(/[`´]/g, "'");

    if (respuestaNormalizada == datosPregunta.solucion.toLowerCase()) {
        inputRespuesta.classList.add("correcta");
    } else {
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