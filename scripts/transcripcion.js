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

        let ordenTranscripciones = ["vocal corta", "diptongo", "vocal larga"];
        let desbloqueado = sessionStorage.getItem("transcripciones");

        inputRespuesta = document.getElementById("inputRespuesta");
        respuestaCorrecta = document.getElementById("respuestaCorrecta");
        btnComprobar = document.getElementById("btnComprobar");
        btnNuevaPalabra = document.getElementById("btnNuevaPalabra");

        preguntas = datos.preguntas || [];

        const nivelMaximo = ordenTranscripciones.indexOf(desbloqueado);
        preguntasFiltradas = preguntas.filter(p => {
            const nivelPregunta = ordenTranscripciones.indexOf(p.contiene);
            return nivelPregunta !== -1 && nivelPregunta <= nivelMaximo;
        });

        if (preguntasFiltradas.length === 0) {
            document.querySelector('.envoltura').innerHTML = '<p>No hay preguntas disponibles para este nivel.</p>';
            return;
        }

        ultimoIndice = parseInt(localStorage.getItem('ultimoIndice') || '0');
        indicesAleatorios = JSON.parse(localStorage.getItem('indicesAleatorios'));
        if (!indicesAleatorios || !Array.isArray(indicesAleatorios) || indicesAleatorios.length !== preguntasFiltradas.length) {
            indicesAleatorios = Array.from({ length: preguntasFiltradas.length }, (_, i) => i).sort(() => Math.random() - 0.5);
            localStorage.setItem('indicesAleatorios', JSON.stringify(indicesAleatorios));
            ultimoIndice = 0;
        }

        cargarNuevaPregunta();

    } catch (error) {
        document.querySelector('.envoltura').innerHTML = '<p>Error al cargar el test: por favor, notifica a Gonzalo para que lo arregle.</p>';
    }
}

function cargarNuevaPregunta() {
    if (ultimoIndice >= preguntasFiltradas.length) {
        ultimoIndice = 0;
    }

    datosPregunta = preguntasFiltradas[indicesAleatorios[ultimoIndice]];
    ultimoIndice++;
    localStorage.setItem('ultimoIndice', ultimoIndice);

    const elementoPregunta = document.querySelector('#pregunta');
    elementoPregunta.textContent = datosPregunta.transcripcion;

    const elementoInputRespuesta = document.querySelector('#inputRespuesta');
    elementoInputRespuesta.disabled = false;
    elementoInputRespuesta.value = "";
    elementoInputRespuesta.classList.remove("correcta", "incorrecta");

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
    const respuestaNormalizada = inputRespuesta.value.trim().toLowerCase().replace(/[`´]/g, "'");
    const solucionNormalizada = datosPregunta.solucion.trim().toLowerCase().replace(/[`´]/g, "'");

    if (respuestaNormalizada === solucionNormalizada) {
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