let preguntas = [];
let indicePreguntaActual = 0;
let cantidadRespuestasCorrectas = 0;
let opcionesFijas = null;

async function cargarPreguntas() {
    const urlParams = new URLSearchParams(window.location.search);
    const nombreTest = urlParams.get('nombre');

    if (!nombreTest) {
        document.querySelector('.envoltura').innerHTML = '<p>Tipo de test no especificado.</p>';
        return;
    }

    try {
        const respuesta = await fetch(`../json/${nombreTest}.json`);
        if (!respuesta.ok) {
            throw new Error('Error al cargar el archivo JSON');
        }
        const datos = await respuesta.json();

        if (datos.titulo) {
            document.getElementById("titulo").textContent = datos.titulo;
        }
        if (datos.instrucciones) {
            document.getElementById('instrucciones').textContent = datos.instrucciones;
        }
        if (datos.numRespuestas) {
            document.getElementById("alternativas").className = "de" + datos.numRespuestas + "respuestas";
        }

        // Guardar las opciones fijas si están presentes
        if (datos.mismasOpciones) {
            opcionesFijas = datos.mismasOpciones;
        }

        preguntas = datos.preguntas || [];
        mezclarArray(preguntas);

    } catch (error) {
        document.querySelector('.envoltura').innerHTML = '<p>Error al cargar el test: por favor, notifica a Gonzalo para que lo arregle.</p>';
    }
}

function cargarPregunta(indice) {
    const datosPregunta = preguntas[indice];
    const elementoPregunta = document.querySelector('#pregunta');
    const contenedorAlternativas = document.querySelector('#alternativas');
    contenedorAlternativas.innerHTML = ''; // Limpiar las alternativas anteriores

    // Configura la pregunta
    elementoPregunta.textContent = datosPregunta.pregunta;
    if (datosPregunta.pregunta.length < 4) elementoPregunta.classList.add('preguntaCorta');
    else elementoPregunta.classList.remove('preguntaCorta');

    let opcionesAMostrar;
    let indiceOpcionCorrecta;

    if (opcionesFijas) {
        // Usar las opciones fijas y encontrar el índice de la opción correcta
        opcionesAMostrar = opcionesFijas;
        indiceOpcionCorrecta = opcionesFijas.indexOf(datosPregunta.opciones[0]);
    } else {
        // Desordenar las opciones si no hay opciones fijas
        opcionesAMostrar = [...datosPregunta.opciones];
        mezclarArray(opcionesAMostrar);
        indiceOpcionCorrecta = opcionesAMostrar.indexOf(datosPregunta.opciones[0]);
    }

    // Crea las opciones dinámicamente
    opcionesAMostrar.forEach((opcion, i) => {
        const elementoOpcion = document.createElement('div');
        elementoOpcion.className = 'opcion';
        elementoOpcion.textContent = opcion;
        elementoOpcion.onclick = () => verificarRespuesta(i, indiceOpcionCorrecta);
        contenedorAlternativas.appendChild(elementoOpcion);
    });

    actualizarEstado();
}

function verificarRespuesta(indiceSeleccionado, indiceOpcionCorrecta) {
    const opciones = document.querySelectorAll('.opcion');

    opciones.forEach((opcion, i) => {
        opcion.classList.remove('correcto', 'incorrecto');
        // Desactivar clics después de la selección
        opcion.style.pointerEvents = 'none';
        if (i === indiceOpcionCorrecta) {
            opcion.classList.add('correcto');
            if (i === indiceSeleccionado) {
                cantidadRespuestasCorrectas++;
            }
        } else if (i === indiceSeleccionado) {
            opcion.classList.add('incorrecto');
        }
    });

    document.getElementById('botonSiguiente').classList.remove('oculto');
}

// ... (el resto de las funciones permanecen iguales)

function mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function siguientePregunta() {
    const esUltimaPregunta = indicePreguntaActual === preguntas.length - 1;
    if (esUltimaPregunta) {
        mostrarResultados();
    } else {
        indicePreguntaActual++;
        cargarPregunta(indicePreguntaActual);
    }

    document.getElementById('botonSiguiente').classList.add('oculto');
}

function empezarTest() {
    document.getElementById('titulo').classList.add('oculto');
    document.getElementById('botonEmpezar').classList.add('oculto');
    document.getElementById('instrucciones').classList.add('oculto');
    document.getElementById('contenedorTest').classList.remove('oculto');
    cargarPregunta(indicePreguntaActual);
}

function volverEmpezarTest() {
    indicePreguntaActual = 0;
    cantidadRespuestasCorrectas = 0;

    const contenedorTest = document.getElementById('contenedorTest');
    contenedorTest.innerHTML = '';

    const estado = document.createElement('div');
    estado.id = 'estado';
    contenedorTest.appendChild(estado);

    const pregunta = document.createElement('div');
    pregunta.id = 'pregunta';
    contenedorTest.appendChild(pregunta);

    const alternativas = document.createElement('div');
    alternativas.id = 'alternativas';
    contenedorTest.appendChild(alternativas);

    cargarPreguntas().then(() => {
        cargarPregunta(indicePreguntaActual);
        document.getElementById('botonVolverEmpezar').classList.add('oculto');
        document.getElementById('botonSiguiente').classList.add('oculto');
    });
}

function mostrarResultados() {
    const contenedorTest = document.getElementById('contenedorTest');
    contenedorTest.innerHTML = `<div class="resultado">Has acertado ${cantidadRespuestasCorrectas} de ${preguntas.length} preguntas</div>`;
    document.getElementById('botonSiguiente').classList.add('oculto');
    document.getElementById('botonVolverEmpezar').classList.remove('oculto');
}

function actualizarEstado() {
    document.getElementById('estado').textContent = `${indicePreguntaActual + 1}/${preguntas.length}`;
}

cargarPreguntas();