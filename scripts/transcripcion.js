var datosPregunta;
var inputRespuesta, respuestaCorrecta, btnComprobar;

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
        var preguntas = datos.preguntas || [];
        //mezclarArray(preguntas);
        datosPregunta = preguntas[Math.floor(Math.random() * preguntas.length)];
        const elementoPregunta = document.querySelector('#pregunta');
        elementoPregunta.textContent = datosPregunta.pregunta;


    } catch (error) {
        document.querySelector('.envoltura').innerHTML = '<p>Error al cargar el test: por favor, notifica a Gonzalo para que lo arregle.</p>';
    }
}

function añadirAtajosTeclado() {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            btnComprobar.click();
        }
        else if (event.key == 'Escape') {
            document.activeElement.blur();
        }
        else if (!event.ctrlKey && !event.altKey && !event.metaKey) {
            inputRespuesta.focus();
        }
    });
}

function comprobarTest() {
    if (inputRespuesta.value == datosPregunta.solucion) {
        inputRespuesta.classList.add("correcta");
    }
    else {
        inputRespuesta.classList.add("incorrecta");
        respuestaCorrecta.innerText = datosPregunta.solucion;
        respuestaCorrecta.classList.remove("oculto");
    }
    document.activeElement.blur();
    btnComprobar.classList.add("oculto");
}


cargarPreguntas();
añadirAtajosTeclado();