var textos;
var inputRespuesta, respuestaCorrecta;
var indiceActual;
var nombreAudioActual;
var btnReanudarAudio, btnAnterior, btnPosterior, btnReducirVelocidad, btnAumentarVelocidad, btnVelocidadAudio, btnMarcas, btnTranscripciones;
var velocidadAudio = 1;
var marcasActivadas = true;
var transcripcionesActivadas = false;
var audioActual = null;

async function cargarTextos() {

    try {
        let numTextosDesbloqueados;
        let referrer = document.referrer;
        if (referrer.includes("consonantes.html")) {
            jsonUrl = `../json/textos_consonantes.json`;
            numTextosDesbloqueados = sessionStorage.getItem("textosConsonantes");
        } else if (referrer.includes("vocales.html")) {
            jsonUrl = `../json/textos_vocales.json`;
            numTextosDesbloqueados = sessionStorage.getItem("textosVocales");
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
        btnReducirVelocidad = document.getElementById("btnReducirVelocidad");
        btnAumentarVelocidad = document.getElementById("btnAumentarVelocidad");
        btnVelocidadAudio = document.getElementById("btnVelocidadAudio");
        btnMarcas = document.getElementById("btnMarcas");
        btnTranscripciones = document.getElementById("btnTranscripciones");

        // Cogemos solo los textos desbloqueados
        textos = datos.textos.filter((texto, index) => index < numTextosDesbloqueados) || [];

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

    // Reiniciamos el texto del botón de las marcas y su variable
    btnMarcas.textContent = "🚀";
    marcasActivadas = true;

    // Verificar si se han recorrido todos los textos
    if (indiceActual < 0) indiceActual = textos.length - 1;
    if (indiceActual >= textos.length) indiceActual = 0;

    // Seleccionar el texto correspondiente al índice actual
    var textoActual = textos[indiceActual];

    // Actualizar el texto en el DOM
    const elementoNombreTexto = document.querySelector('#nombre');
    const elementoContenidoTexto = document.querySelector('#contenido');
    elementoNombreTexto.textContent = textoActual.titulo;
    var contenidoFinal;

    if (textoActual.contieneMarcas) {
        // Visibilizamos el botón de marcas
        btnMarcas.classList.remove('oculto');
        btnTranscripciones.classList.add('oculto');

        // Cargamos el texto con marcas
        contenidoFinal = textoActual.contenido.split('').map((char, index) => {
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
    } else {
        // Invisibilizamos el botón de marcas
        btnMarcas.classList.add('oculto');
        
        if (textoActual.contieneTranscripciones && transcripcionesActivadas) {
            btnTranscripciones.classList.remove('oculto');
            contenidoFinal = textoActual.contenidoTranscrito.replace(/\[([əɪɔɛaʌ])\]/g, (match, fonema) => {
                let clase = 'fonema ';

                switch (fonema) {
                    case 'ə':
                        clase += 'fonema-azul';
                        break;
                    case 'ɪ':
                        clase += 'fonema-rojo';
                        break;
                    case 'ɔ':
                        clase += 'fonema-naranja';
                        break;
                    case 'ɛ':
                        clase += 'fonema-verde';
                        break;
                    case 'a':
                        clase += 'fonema-rosa';
                        break;
                    case 'ʌ':
                        clase += 'fonema-morado';
                        break;
                    default:
                        clase += 'fonema-neutro'; // solo por seguridad
                }

                return `<span class="${clase}">[${fonema}]</span>`;
            })
            .replace(/([‖|])/g, '<span class="fonema fonema-rojo">$1</span>');
        }
        else { contenidoFinal = textoActual.contenido; }
    }


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
    elementoContenidoTexto.innerHTML = contenidoFinal;
}

function alternarMarcas() {
    marcasActivadas = !marcasActivadas;

    let marcas = document.querySelectorAll('.marca');

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

function alternarTranscripciones() {
    transcripcionesActivadas = !transcripcionesActivadas;
    cargarNuevoTexto(0); // Recargamos el texto actual para aplicar los cambios
    btnTranscripciones.textContent = transcripcionesActivadas ? "🔡" : "👄";
}

function cambiarVelocidadAudio(event, variacion) {
    // Prevenimos el comportamiento por defecto del botón
    event.preventDefault();

    // Modificamos la velocidad del audio actual
    if (variacion == 0) velocidadAudio = 1;
    else if (variacion == -1) velocidadAudio = 0.25;
    else if (variacion == 1) velocidadAudio = 2;
    else velocidadAudio += variacion;

    // Habilitamos los botones de velocidad
    btnReducirVelocidad.disabled = false;
    btnAumentarVelocidad.disabled = false;

    // Cambiamos la velocidad del audio
    if (audioActual) audioActual.playbackRate = velocidadAudio;

    // Deshabilitación en los extremos del rango
    if (velocidadAudio == 0.25) btnReducirVelocidad.disabled = true;
    else if (velocidadAudio == 2) btnAumentarVelocidad.disabled = true;

    // Cambiamos el tamaño del texto del botón si es número largo
    if (velocidadAudio == 0.25 || velocidadAudio == 0.75 || velocidadAudio == 1.25 || velocidadAudio == 1.75) {
        // Reducimos el tamaño del texto del botón
        btnVelocidadAudio.classList.add("minimizado");
    }
    else {
        // Restablecemos el tamaño normal del texto del botón
        btnVelocidadAudio.classList.remove("minimizado");
    }

    // Mostramos la velocidad actual en el botón
    btnVelocidadAudio.textContent = "x" + velocidadAudio;

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

        // Establecemos la velocidad inicial del audio
        audioActual.playbackRate = velocidadAudio;
    }

    btnReanudarAudio.textContent = "⏸️";
    audioActual.play().catch(() => {
        alert("No se puede reproducir el audio " + nombre + ".mp3");
        audioActual = null; // Libera la instancia en caso de fallo
    });
}

function reiniciarAudio() {
    if (audioActual) {
        audioActual.pause(); // Pausa el audio
        btnReanudarAudio.textContent = "▶️";
        audioActual.currentTime = 0; // Opcional: reinicia desde el principio
    }
}

function añadirAtajosTeclado() {
    document.addEventListener('keydown', function (event) {
        switch (event.key) {
            case 'ArrowLeft':
                btnAnterior.click();
                break;
            case 'ArrowRight':
                btnPosterior.click();
                break;
            case 'ArrowDown':
            case '-':
                btnReducirVelocidad.click();
                break;
            case 'ArrowUp':
            case '+':
                btnAumentarVelocidad.click();
                break;
            case 'm':
                btnMarcas.click();
                break;
            case 'r':
            case 's':
            case 'p':
                btnReanudarAudio.click();
                break;
            case 'Enter':
                btnReanudarAudio.click();
                break;
        }
    });
}

cargarTextos();
añadirAtajosTeclado();