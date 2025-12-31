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
    // Formulário usa Formspree (configurado no HTML)

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
