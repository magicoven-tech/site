// ============================================
// MAGIC OVEN - Main JavaScript
// Handles interactions and animations
// ============================================

// ============================================
// NAVIGATION
// ============================================
class Navigation {
    constructor() {
        this.nav = document.getElementById('mainNav');
        this.menuToggle = document.getElementById('menuToggle');
        this.navMenu = document.getElementById('navMenu');
        this.lastScroll = 0;
        this.init();
    }

    init() {
        // Mobile menu toggle
        if (this.menuToggle && this.navMenu) {
            this.menuToggle.addEventListener('click', () => this.toggleMenu());
        }

        // Hide nav on scroll down, show on scroll up
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

        // Close mobile menu on link click
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.nav.contains(e.target) && this.navMenu.classList.contains('active')) {
                this.closeMenu();
            }
        });

        // Set active link based on current page
        this.setActiveLink();
    }

    toggleMenu() {
        this.menuToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    }

    closeMenu() {
        this.menuToggle.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleScroll() {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 100) {
            this.nav.classList.remove('nav-hidden');
            return;
        }

        if (currentScroll > this.lastScroll && currentScroll > 200) {
            // Scrolling down
            this.nav.classList.add('nav-hidden');
            this.closeMenu();
        } else {
            // Scrolling up
            this.nav.classList.remove('nav-hidden');
        }

        this.lastScroll = currentScroll;
    }

    setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// ============================================
// SCROLL ANIMATIONS (AOS-like)
// ============================================
class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('[data-aos]');
        this.init();
    }

    init() {
        if (this.elements.length === 0) return;

        // Create observer
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all elements
        this.elements.forEach(el => {
            this.observer.observe(el);
        });
    }
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const offset = 80; // Nav height
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ============================================
// CURSOR GLOW EFFECT (Optional)
// ============================================
class CursorGlow {
    constructor() {
        this.cursor = null;
        this.init();
    }

    init() {
        // Only on desktop
        if (window.innerWidth < 1024) return;

        // Create cursor element
        this.cursor = document.createElement('div');
        this.cursor.className = 'cursor-glow';
        this.cursor.style.cssText = `
            position: fixed;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(79, 172, 254, 0.15) 0%, transparent 70%);
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s;
            opacity: 0;
        `;
        document.body.appendChild(this.cursor);

        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
            this.cursor.style.opacity = '1';
        });

        // Hide when mouse leaves
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
        });
    }
}

// ============================================
// PAGE TRANSITION EFFECTS
// ============================================
class PageTransitions {
    constructor() {
        this.init();
    }

    init() {
        // Fade in on page load
        document.body.style.opacity = '0';
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.5s ease-in';
                document.body.style.opacity = '1';
            }, 100);
        });

        // Optional: Add page transition on link clicks
        // This would require additional setup with your routing
    }
}

// ============================================
// UTILITIES
// ============================================
const Utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// ============================================
// FORM HANDLING (for contact page)
// ============================================
class FormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Add validation feedback
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate all fields
        const inputs = this.form.querySelectorAll('input, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) return;

        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerText : 'ENVIAR';

        try {
            if (submitBtn) {
                submitBtn.innerText = 'ENVIANDO...';
                submitBtn.disabled = true;
            }

            const baseURL = window.API_CONFIG ? window.API_CONFIG.baseURL : '';
            const response = await fetch(`${baseURL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
                this.form.reset();
            } else {
                throw new Error(result.error || 'Erro ao enviar mensagem');
            }
        } catch (error) {
            console.error('Erro no envio:', error);
            this.showMessage('Ocorreu um erro ao enviar sua mensagem. Tente novamente.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        // Required field check
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            this.showFieldError(field, 'Este campo é obrigatório');
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                this.showFieldError(field, 'Por favor, insira um email válido');
            }
        }

        if (isValid) {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);

        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #ff6b6b; font-size: 0.875rem; margin-top: 0.25rem;';
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const error = field.parentNode.querySelector('.field-error');
        if (error) {
            error.remove();
        }
    }

    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 8px;
            background: ${type === 'success' ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 107, 107, 0.1)'};
            color: ${type === 'success' ? '#4ecdc4' : '#ff6b6b'};
            text-align: center;
        `;

        this.form.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// ============================================
// PARALLAX EFFECTS (Optional)
// ============================================
class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('[data-parallax]');
        if (this.elements.length > 0) {
            this.init();
        }
    }

    init() {
        window.addEventListener('scroll', Utils.throttle(() => {
            this.update();
        }, 10), { passive: true });
    }

    update() {
        const scrolled = window.pageYOffset;

        this.elements.forEach(el => {
            const speed = el.dataset.parallax || 0.5;
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Core features
    new Navigation();
    new ScrollAnimations();
    new SmoothScroll();
    new PageTransitions();

    // Optional features (uncomment if needed)
    // new CursorGlow();
    // new ParallaxEffect();

    // Initialize contact form if it exists
    new FormHandler('contactForm');

    const form = document.getElementById("contactForm");

    async function handleSubmit(event) {
        event.preventDefault();
        const status = document.querySelector(".form-submit"); // Vamos mudar o texto do botão
        const originalBtnText = status.innerHTML;
        const data = new FormData(event.target);

        // Feedback visual de carregamento
        status.innerHTML = "Enviando...";
        status.disabled = true;
        status.style.opacity = "0.7";

        try {
            const response = await fetch(event.target.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Sucesso!
                status.innerHTML = "Mensagem Enviada! ✨";
                status.style.backgroundColor = "var(--color-accent-secondary)"; // Opcional: cor de sucesso
                form.reset(); // Limpa o formulário

                // Volta o botão ao normal após 3 segundos
                setTimeout(() => {
                    status.innerHTML = originalBtnText;
                    status.disabled = false;
                    status.style.opacity = "1";
                    status.style.backgroundColor = "";
                }, 3000);
            } else {
                // Erro do servidor
                const data = await response.json();
                if (Object.hasOwn(data, 'errors')) {
                    status.innerHTML = "Erro nos dados. Verifique e tente novamente.";
                } else {
                    status.innerHTML = "Oops! Algo deu errado.";
                }
                setTimeout(() => {
                    status.innerHTML = originalBtnText;
                    status.disabled = false;
                }, 3000);
            }
        } catch (error) {
            // Erro de rede
            status.innerHTML = "Erro de conexão.";
            setTimeout(() => {
                status.innerHTML = originalBtnText;
                status.disabled = false;
            }, 3000);
        }
    }

    form.addEventListener("submit", handleSubmit);

    console.log('🧙‍♂️ Magic Oven initialized ✨');
});

// ============================================
// EXPORT FOR MODULE USAGE (if needed)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Navigation,
        ScrollAnimations,
        SmoothScroll,
        CursorGlow,
        FormHandler,
        Utils
    };
}
