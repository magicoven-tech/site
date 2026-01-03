/**
 * Glitch Text Effect
 * Controlador reutilizável para efeito de glitch em textos
 * 
 * Uso: Adicione a classe .glitch-text e o atributo data-text="TEXTO" ao elemento.
 */

function initGlitchEffect() {
    // Seleciona elementos com a classe glitch-text
    const glitchElements = document.querySelectorAll('.glitch-text');

    if (glitchElements.length === 0) return;

    function triggerRandomGlitch() {
        // Escolhe um elemento aleatório
        const el = glitchElements[Math.floor(Math.random() * glitchElements.length)];

        el.classList.add('glitch-active');

        setTimeout(() => {
            el.classList.remove('glitch-active');

            // Próximo glitch
            const nextTime = Math.random() * 3000 + 1000; // 1 a 4 segundos
            setTimeout(triggerRandomGlitch, nextTime);
        }, 200 + Math.random() * 300); // 200ms a 500ms de duração
    }

    // Inicia o ciclo
    triggerRandomGlitch();
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlitchEffect);
} else {
    initGlitchEffect();
}
