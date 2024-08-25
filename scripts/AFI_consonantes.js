const mapeoSimbolos = {
    'θ': 'th',
    'ð': 'dh',
    'ʃ': 'sh',
    'ʒ': 'zh',
    'tʃ': 'ch',
    'dʒ': 'j',
    'j': 'y',
    'ŋ': 'ng'
};

function escuchar(letra) {
    const nombreLatinizado = mapeoSimbolos[letra] || letra;
    const nombreAudio = `../audios/consonantes/${nombreLatinizado}.mp3`;
    new Audio(nombreAudio).play();
}

window.onload = function() {
    const botones = document.querySelectorAll('.btnConsonante');
    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            const sonido = btn.textContent;
            escuchar(sonido);
        });
    });
}