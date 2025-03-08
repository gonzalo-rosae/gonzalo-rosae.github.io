var textos;
var inputRespuesta, respuestaCorrecta;
var indiceActual;
var nombreAudioActual;
var btnReanudarAudio, btnAnterior, btnPosterior;
var marcasActivadas = true;
var audioActual = null;

async function cargarTextos() {

    try {
        let referrer = document.referrer;
        if (referrer.includes("consonantes.html")) {
            jsonUrl = `../json/textos_consonantes.json`;
        } else if (referrer.includes("vocales.html")) {
            jsonUrl = `../json/textos_vocales.json`;
        }

        const doc = await fetch(jsonUrl);
        if (!doc.ok) {
            throw new Error('Error al cargar el archivo JSON');
        }
        const datos = await doc.json();

        if (datos.titulo) {
            document.getElementById("titulo").textContent = datos.titulo;
        }

        btnReanudarAudio = document.getElementById("btnReanudarAudio");
        btnAnterior = document.getElementById("btnAnterior");
        btnPosterior = document.getElementById("btnPosterior");    

        textos = datos.textos || [];

        indiceActual = -1;
        cargarNuevoTexto(1);

    } catch (error) {
        document.querySelector('.envoltura').innerHTML = '<p>Error al cargar el texto: por favor, notifica a Gonzalo para que lo arregle.</p>';
    }
}

function cargarNuevoTexto(sentido) {
    // Si ya hay un audio reproduciéndose
    if (audioActual) {
        audioActual.pause(); // Pausa el audio
        btnReanudarAudio.textContent = "▶️";
        audioActual = null;
    }
    indiceActual += sentido;

    // Reiniciamos el texto del botón de las marcas
    btnMarcas.textContent = "🚀";

    // Verificar si se han recorrido todos los textos
    if (indiceActual < 0) indiceActual = textos.length - 1;
    if (indiceActual >= textos.length) indiceActual = 0;

    // Seleccionar el texto correspondiente al índice actual
    var textoActual = textos[indiceActual];

    // Actualizar el texto en el DOM
    const elementoNombreTexto = document.querySelector('#nombre');
    const elementoContenidoTexto = document.querySelector('#contenido');
    elementoNombreTexto.textContent = textoActual.titulo;
    const contenidoConMarcas = textoActual.contenido.split('').map((char, index) => {
        if (textoActual.marcas.includes(index)) {
            return `<span class="marca marcaNeutra">${char}</span>`;
        }
        else if (textoActual.marcasSordas.includes(index)) {
            return `<span class="marca marcaSorda">${char}</span>`;
        }
        else if (textoActual.marcasSonoras.includes(index)) {
            return `<span class="marca marcaSonora">${char}</span>`;
        }
        return char;
    }).join('');

    // Creamos el nombre del audio actual
    var nombreCorto = textoActual.nombreAudio.toLowerCase();
    if (nombreCorto == "") {
        btnReanudarAudio.textContent = "🔇";
        btnReanudarAudio.disabled = true;
    }
    else {
        btnReanudarAudio.textContent = "▶️";
        btnReanudarAudio.disabled = false;
    }
    var nombre = "texto_" + nombreCorto.replace(/\s+/g, "_");
    nombreAudioActual = `../audios/textos/${nombre}.mp3`;
    
    // Insertar el contenido con marcas como HTML
    elementoContenidoTexto.innerHTML = contenidoConMarcas;
}

function alternarMarcas() {
    marcasActivadas = !marcasActivadas;
    
    let marcas = document.querySelectorAll('.marca');
    let btnMarcas = document.getElementById('btnMarcas');

    if (marcasActivadas) {
        // Reactivamos las marcas eliminando la clase .desactivada
        marcas.forEach(marca => {
            marca.classList.remove('desactivada');
        });
        btnMarcas.textContent = "🚀";
    } else {
        // Desactivamos las marcas añadiendo la clase .desactivada
        marcas.forEach(marca => {
            marca.classList.add('desactivada');
        });
        btnMarcas.textContent = "🆘";
    }
}

function reanudarAudio() {
    // Si ya hay un audio reproduciéndose
    if (audioActual && !audioActual.paused) {
        audioActual.pause(); // Pausa el audio
        btnReanudarAudio.textContent = "▶️";
        return;
    }

    // Si no hay audio o está en pausa, crea/reanuda
    if (!audioActual) {
        audioActual = new Audio(nombreAudioActual);

        audioActual.addEventListener("error", () => {
            alert("No se ha encontrado el audio " + nombre + ".mp3");
            audioActual = null; // Libera la instancia en caso de error
        });

        // Escucha el evento `ended` para saber cuándo termina el audio
        audioActual.addEventListener("ended", () => {
            btnReanudarAudio.textContent = "▶️"; // Cambia el texto del botón a "play"
            audioActual = null; // Libera la instancia cuando termine
        });
    }

    btnReanudarAudio.textContent = "⏸️";
    audioActual.play().catch(() => {
        alert("No se puede reproducir el audio " + nombre + ".mp3");
        audioActual = null; // Libera la instancia en caso de fallo
    });
}

function recomenzarAudio() {
    audioActual.currentTime = 0; // Opcional: reinicia desde el principio
    audioActual = null; // Libera la instancia
}

function añadirAtajosTeclado() {
    document.addEventListener('keydown', function (event) {
        if (event.key == 'Enter' || event.key == 'ArrowUp' || event.key == 'ArrowDown') {
            btnReanudarAudio.click();
        }
        else if (event.key == 'ArrowLeft') {
            btnAnterior.click();
        }
        else if (event.key == 'ArrowRight') {
            btnPosterior.click();
        }
    });
}

cargarTextos();
añadirAtajosTeclado();