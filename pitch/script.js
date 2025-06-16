let currentSlide = 0;
let slidesData = []; // Will be loaded from JSON
const presentationContainer = document.getElementById('presentationContainer');
const slideCounter = document.getElementById('slideCounter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

async function loadSlides() {
    try {
        const response = await fetch('slides.json');
        slidesData = await response.json();
        showSlide(currentSlide);
    } catch (error) {
        console.error('Erro ao carregar os slides:', error);
        // Display an error message to the user or a fallback
        presentationContainer.innerHTML = '<div class="slide active"><h1>Erro ao Carregar Apresentação</h1><p>Por favor, verifique o arquivo slides.json.</p></div>';
    }
}

function renderSlide(slide) {
    let content = '';
    if (slide.type === 'title') {
        content = `
            <h1>${slide.title}</h1>
            <p>${slide.subtitle}</p>
            <p>${slide.description}</p>
        `;
    } else if (slide.type === 'problem' || slide.type === 'solution' || slide.type === 'market-opportunity') {
        content = `
            <h2>${slide.title}</h2>
            <div class="value-grid">
                ${slide.items.map((item, index) => `
                    <div class="value-item">
                        <h3>${item.heading}</h3>
                        <p>${item.description}</p>
                        ${item.source ? `<p class="source-info" data-source-id="${slide.type}-${index}">Carregando fonte...</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } else if (slide.type === 'revenue-model') {
        content = `
            <h2>${slide.title}</h2>
            <div class="value-grid revenue-model-grid">
                ${slide.items.map((item, index) => `
                    <div class="value-item">
                        <h3>${item.heading}</h3>
                        <p>${item.description}</p>
                        ${item.source ? `<p class="source-info" data-source-id="${slide.type}-${index}">Carregando fonte...</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } else if (slide.type === 'long-content') {
        content = `
            <h2>${slide.title}</h2>
            <div class="value-grid long-content-grid">
                ${slide.items.map(item => `
                    <div class="value-item">
                        <h3>${item.heading}</h3>
                        <p>${item.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (slide.type === 'founders') {
        content = `
            <h2>${slide.title}</h2>
            <div class="founders-grid">
                ${slide.founders.map(founder => `
                    <div class="founder-card">
                        <h4>${founder.name}</h4>
                        <p>${founder.role}</p>
                        <p>${founder.description}</p>
                    </div>
                `).join('')}
            </div>
            <p>${slide.closing}</p>
        `;
    } else if (slide.type === 'next-steps') {
        content = `
            <h2>${slide.title}</h2>
            <div class="value-grid">
                ${slide.items.map(item => `
                    <div class="value-item">
                        <h3>${item.heading}</h3>
                        <p>${item.description}</p>
                    </div>
                `).join('')}
            </div>
            <h3 style="margin-top: 2rem;">${slide.callToAction}</h3>
        `;
    } else if (slide.type === 'thank-you') {
        content = `
            <h1>${slide.title}</h1>
            <h3 style="margin-top: 2rem;">${slide.callToAction}</h3>
            <p><a href="mailto:${slide.contactEmail}" style="color: #8d8aff; text-decoration: none; font-weight: 600; font-size: 1.5em;">${slide.contactEmail}</a></p>
            ${slide.qrCode ? `<img src="${slide.qrCode}" alt="QR Code para contato" style="width: 200px; height: 200px; margin-top: 0.5rem; border-radius: 8px;">` : ''}
        `;
    }
    return `<div class="slide">${content}</div>`;
}

function updateSlideCounter() {
    slideCounter.textContent = `${currentSlide + 1} / ${slidesData.length}`;
}

function updateNavigation() {
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === slidesData.length - 1;
}

function showSlide(n) {
    if (!slidesData || !slidesData[n]) {
        console.error('Erro: Dados do slide para o índice', n, 'estão faltando ou são inválidos.');
        // Opcional: exibir uma mensagem de erro no container da apresentação
        presentationContainer.innerHTML = '<div class="slide active"><h1>Erro no Slide</h1><p>Desculpe, não foi possível carregar este slide.</p></div>';
        return;
    }
    presentationContainer.innerHTML = renderSlide(slidesData[n]);
    const newSlide = presentationContainer.querySelector('.slide');
    setTimeout(() => {
        newSlide.classList.add('active');
    }, 50);
    
    // After the slide is active, inject the source HTML
    if (slidesData[n].type === 'market-opportunity') {
        slidesData[n].items.forEach((item, index) => {
            if (item.source) {
                const sourceElement = newSlide.querySelector(`[data-source-id="${slidesData[n].type}-${index}"]`);
                if (sourceElement) {
                    sourceElement.innerHTML = `Fonte: ${item.source}`;
                }
            }
        });
    }

    updateSlideCounter();
    updateNavigation();
}

function nextSlide() {
    if (currentSlide < slidesData.length - 1) {
        const current = presentationContainer.querySelector('.slide');
        current.classList.remove('active');
        current.classList.add('prev');
        setTimeout(() => {
            currentSlide++;
            showSlide(currentSlide);
        }, 500); // Wait for transition to finish
    }
}

function previousSlide() {
    if (currentSlide > 0) {
        const current = presentationContainer.querySelector('.slide');
        current.classList.remove('active');
        // No need to add 'prev' class for previous slide animation, it's handled by showSlide
        setTimeout(() => {
            currentSlide--;
            showSlide(currentSlide);
        }, 500); // Wait for transition to finish
    }
}

// Event Listeners
prevBtn.addEventListener('click', previousSlide);
nextBtn.addEventListener('click', nextSlide);

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousSlide();
    }
});

// Touch/swipe navigation for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
        nextSlide();
    } else if (touchEndX - touchStartX > 50) {
        previousSlide();
    }
});

// Initialize
// showSlide(0); // Removed, now called after JSON load
loadSlides(); 