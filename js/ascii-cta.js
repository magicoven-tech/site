/**
 * ASCII CTA Effect
 * Adaptação do efeito de ASCII e Glitch para a seção de CTA
 */

class AsciiGifConverter {
    constructor(gifUrl) {
        this.gifUrl = gifUrl;
        this.gif = null;
        this.asciiFrames = [];
        this.currentFrame = 0;
        this.chars = " o,.* ";
        this.frameDelay = 10;
        this.lastFrameTime = 0;
        this.renderWidth = 0;
        this.renderHeight = 0;
        this.scaleFactor = 0.15; // Reduzido para melhor performance e densidade
        this.isProcessing = false;
        // Para armazenar deslocamentos animados dos caracteres
        this.charOffsets = [];
    }

    preload() {
        this.isProcessing = true;
        this.gif = loadImage(this.gifUrl, () => {
            this.processGifFrames();
            this.isProcessing = false;
        }, (err) => {
            console.error('Erro ao carregar GIF:', err);
        });
    }

    processGifFrames() {
        if (!this.gif) return;

        this.gif.play();
        this.gif.pause();
        this.asciiFrames = [];
        this.charOffsets = [];

        const scale = this.scaleFactor;
        const w = Math.floor(this.gif.width * scale);
        const h = Math.floor(this.gif.height * scale);
        const frameStep = 3;

        // Garante que temos frames para processar
        let numFrames = 0;
        try {
            numFrames = this.gif.numFrames();
        } catch (e) {
            console.warn('Não foi possível obter número de frames, tentando fallback', e);
            // Fallback para imagem estática se não for gif animado ou erro
            this.processStaticFrame(w, h);
            return;
        }

        for (let i = 0; i < numFrames; i += frameStep) {
            this.gif.setFrame(i);
            let frame = this.gif.get();
            frame.resize(w, h);
            frame.loadPixels();

            let ascii = [];
            let offsets = [];

            for (let y = 0; y < frame.height; y++) {
                let row = "";
                let rowOffsets = [];
                for (let x = 0; x < frame.width; x++) {
                    const idx = 4 * (x + y * frame.width);
                    const r = frame.pixels[idx] || 0;
                    const g = frame.pixels[idx + 1] || 0;
                    const b = frame.pixels[idx + 2] || 0;

                    let bright = (r + g + b) / 3;
                    const charIdx = Math.floor(map(bright, 0, 255, this.chars.length - 1, 0));
                    row += this.chars[charIdx];
                    rowOffsets.push({ x: 0, y: 0 });
                }
                ascii.push(row);
                offsets.push(rowOffsets);
            }
            this.asciiFrames.push(ascii);
            this.charOffsets.push(offsets);
        }
        this.frameDelay = this.gif.frameDelay || 50;
    }

    // Fallback para caso não consiga processar como GIF animado
    processStaticFrame(w, h) {
        let frame = this.gif.get();
        frame.resize(w, h);
        frame.loadPixels();

        let ascii = [];
        let offsets = [];

        for (let y = 0; y < frame.height; y++) {
            let row = "";
            let rowOffsets = [];
            for (let x = 0; x < frame.width; x++) {
                const idx = 4 * (x + y * frame.width);
                const r = frame.pixels[idx] || 0;
                const g = frame.pixels[idx + 1] || 0;
                const b = frame.pixels[idx + 2] || 0;

                let bright = (r + g + b) / 3;
                const charIdx = Math.floor(map(bright, 0, 255, this.chars.length - 1, 0));
                row += this.chars[charIdx];
                rowOffsets.push({ x: 0, y: 0 });
            }
            ascii.push(row);
            offsets.push(rowOffsets);
        }
        this.asciiFrames.push(ascii);
        this.charOffsets.push(offsets);
        this.frameDelay = 100;
    }

    draw() {
        if (this.isProcessing || this.asciiFrames.length === 0) return;

        clear();
        const currentAsciiFrame = this.asciiFrames[this.currentFrame];
        const currentOffsets = this.charOffsets[this.currentFrame];

        if (currentAsciiFrame) {
            textFont("monospace");

            const rows = currentAsciiFrame.length;
            const columns = currentAsciiFrame[0].length;

            // Ajusta o tamanho da fonte para preencher o container, mas mantendo proporção
            // Queremos que cubra tudo (cover)
            const textWidthVal = width / columns;
            const textHeightVal = height / rows;

            // Use o MAIOR valor para garantir que cubra a área (cover effect style)
            // Ou use um valor fixo que funcione bem visualmente
            const textSizeValue = Math.max(textWidthVal, textHeightVal) * 1.2;

            textSize(textSizeValue);
            textAlign(LEFT, TOP);
            noStroke();

            const asciiWidth = columns * textSizeValue;
            const asciiHeight = rows * textSizeValue;

            // Centraliza
            const startX = (width - asciiWidth) / 2;
            const startY = (height - asciiHeight) / 2;

            for (let row = 0; row < rows; row++) {
                // Otimização: Só desenha se estiver dentro ou perto da tela
                const charY = startY + row * textSizeValue;
                if (charY < -textSizeValue || charY > height + textSizeValue) continue;

                for (let col = 0; col < currentAsciiFrame[row].length; col++) {
                    const char = currentAsciiFrame[row][col];

                    // Repel effect (se o mouse/ponteiro estiver ativo)
                    const charX = startX + col * textSizeValue;

                    if (pointerActive) {
                        const dx = pointerX - charX;
                        const dy = pointerY - charY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        let targetOffsetX = 0, targetOffsetY = 0;
                        const repelRadius = 150;

                        if (dist < repelRadius) {
                            const falloff = Math.pow(1 - (dist / repelRadius), 2);
                            const angle = Math.atan2(dy, dx);
                            const repelDist = (repelRadius - dist) * 1.2 * falloff;
                            targetOffsetX = -Math.cos(angle) * repelDist;
                            targetOffsetY = -Math.sin(angle) * repelDist;
                        }

                        // Interpolação suave
                        let prevOffset = currentOffsets[row][col];
                        prevOffset.x = lerp(prevOffset.x, targetOffsetX, 0.2);
                        prevOffset.y = lerp(prevOffset.y, targetOffsetY, 0.2);
                        currentOffsets[row][col] = prevOffset; // Atualiza referência se for objeto
                    } else if (currentOffsets[row][col].x !== 0 || currentOffsets[row][col].y !== 0) {
                        // Retorna suavemente para 0 se não houver interação
                        let prevOffset = currentOffsets[row][col];
                        prevOffset.x = lerp(prevOffset.x, 0, 0.1);
                        prevOffset.y = lerp(prevOffset.y, 0, 0.1);
                    }

                    let offsetX = currentOffsets[row][col].x;
                    let offsetY = currentOffsets[row][col].y;

                    // Cor do ASCII - Tom cinza escuro para background
                    fill('#2A2A2A');
                    text(char, charX + offsetX, charY + offsetY);
                }
            }
        }
    }

    update() {
        if (this.isProcessing || this.asciiFrames.length === 0) return;

        const now = millis();
        if (now - this.lastFrameTime > this.frameDelay) {
            const nextFrame = (this.currentFrame + 1) % this.asciiFrames.length;

            // Copia offsets do frame atual para o próximo para continuidade da animação de repel
            // Se as dimensões forem iguais
            if (
                this.charOffsets[this.currentFrame] &&
                this.charOffsets[nextFrame] &&
                this.charOffsets[this.currentFrame].length === this.charOffsets[nextFrame].length
            ) {
                // Clone superficial dos offsets para manter estado visual entre frames do GIF
                // Isso é pesado, talvez possamos otimizar, mas para ASCII grid pequeno é ok
                // Uma abordagem melhor seria ter uma grid de offsets separada da grid de caracteres
                // Mas vamos manter a lógica original adaptada
            }

            this.currentFrame = nextFrame;
            this.lastFrameTime = now;
        }
    }
}

// Global Variables
let gifConverter;
let pointerX = 0;
let pointerY = 0;
let pointerActive = false;
let ctaObserver;
let ctaCanvas;

// Setup P5
function setup() {
    const container = document.getElementById('cta-canvas-container');
    const w = container.offsetWidth;
    const h = container.offsetHeight;

    ctaCanvas = createCanvas(w, h);
    ctaCanvas.parent('cta-canvas-container');

    frameRate(24);

    // Inicia IntersectionObserver para performance
    setupObserver();
}

function preload() {
    // Carrega o GIF da pasta de assets
    gifConverter = new AsciiGifConverter('assets/flames.gif');
    gifConverter.preload();
}

function draw() {
    background('#0e0e0e'); // Cor de fundo do site/seção
    if (gifConverter) {
        gifConverter.update();
        gifConverter.draw();
    }
}

function windowResized() {
    const container = document.getElementById('cta-canvas-container');
    if (container) {
        resizeCanvas(container.offsetWidth, container.offsetHeight);
    }
}

// Interaction handling
function mouseMoved() {
    pointerX = mouseX;
    pointerY = mouseY;
    pointerActive = true;
    // Reseta active após um tempo sem movimento
    clearTimeout(window.pointerTimer);
    window.pointerTimer = setTimeout(() => { pointerActive = false; }, 1000);
}

// function touchMoved() {
//     if (touches.length > 0) {
//         pointerX = touches[0].x;
//         pointerY = touches[0].y;
//         pointerActive = true;
//     }
//     // Removed return false to allow scrolling
//     // return false; 
// }

function touchEnded() {
    pointerActive = false;
}

// Performance Optimization
function setupObserver() {
    const ctaSection = document.getElementById('cta-section');

    ctaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loop(); // Inicia loop de renderização
            } else {
                noLoop(); // Pausa renderização quando fora da tela
            }
        });
    }, { threshold: 0.1 }); // 10% visível já ativa

    if (ctaSection) {
        ctaObserver.observe(ctaSection);
    }
}

