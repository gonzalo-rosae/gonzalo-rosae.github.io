const mapeoSimbolos = {
    'ɪj': 'ij',
    'ʉw': 'uw',
    'ɪ': 'i',
    'ɵ': 'o-',
    'oː': 'o.',
    'ɪː': 'i.',
    'əw': 'ew',
    'oj': 'oj',
    'ɛj': 'ej',
    'ə': 'schwa',
    'ɛ': 'e',
    'əː': 'schwa.',
    'ɔ': 'o',
    'ɛː': 'e.',
    'ʌ': 'v',
    'ɑː': 'a.',
    'a': 'a',
    'aw': 'aw',
    'ɑj': 'aj'
};

function escuchar(letra) {
    const nombreLatinizado = mapeoSimbolos[letra] || letra;
    const nombreAudio = `../audios/vocales/${nombreLatinizado}.mp3`;
    const audio = new Audio(nombreAudio);
    if (audio) audio.play();
    else alert("No se ha encontrado el audio " + nombreLatinizado + ".mp3");
}

window.onload = function() {
    const botonesVocales = document.querySelectorAll('.btnVocal');
    botonesVocales.forEach(btn => {
        btn.addEventListener('click', () => {
            const simbolo = btn.querySelector('.simbolo').textContent;
            escuchar(simbolo);
        });
    });
    
    const botonesFiltro = document.querySelectorAll('.filtro');
    botonesFiltro.forEach(btn => {
        console.log("exec!");
        btn.addEventListener('click', () => {
            const filtro = btn.classList[1];
            botonesVocales.forEach(vocalBtn => {
                if (filtro == "todos" || vocalBtn.classList.contains(filtro)) {
                    vocalBtn.classList.remove('oculto');
                } else {
                    vocalBtn.classList.add('oculto');
                }
            });
        });
    });
}