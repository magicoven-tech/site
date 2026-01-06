/**
 * Glitch Text Effect
 * Controlador reutilizável para efeito de glitch em textos e logo
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
            const nextTime = Math.random() * 3000 + 1000;
            setTimeout(triggerRandomGlitch, nextTime);
        }, 200 + Math.random() * 300);
    }

    // Inicia o ciclo
    triggerRandomGlitch();
}

/**
 * Efeito de glitch no logo
 */
function initLogoGlitch() {
    const logos = document.querySelectorAll('.logo');

    logos.forEach(logo => {
        // Glitch inicial no load
        logo.classList.add('glitch-active');

        // Remove após um tempo
        setTimeout(() => {
            logo.classList.remove('glitch-active');

            // Glitch randômico no logo também
            const triggerMore = () => {
                setTimeout(() => {
                    logo.classList.add('glitch-active');
                    setTimeout(() => {
                        logo.classList.remove('glitch-active');
                        triggerMore();
                    }, 150 + Math.random() * 200);
                }, Math.random() * 10000 + 5000);
            };
            triggerMore();
        }, 800);
    });
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initGlitchEffect();
    initLogoGlitch();
});
