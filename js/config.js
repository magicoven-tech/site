/**
 * Template Global Configuration
 * Define all global variables, API endpoints, and template settings here.
 */

const TEMPLATE_CONFIG = {
    // General Site Information
    site: {
        name: "Meu Portfólio", // Replaces {{SITE_NAME}}
        author: "Nome do Autor",
        description: "Estúdio digital criamos experiências incríveis através de web design e desenvolvimento.",
        year: new Date().getFullYear(),
        logoText: "MEU_PORTFOLIO", // Opcional, se usar texto no lugar de SVG
    },

    // Contact & Social Media Links
    contact: {
        email: "seu.email@exemplo.com", // Replaces {{AUTHOR_EMAIL}}
        instagramUrl: "https://instagram.com/seu.perfil", // Replaces {{INSTAGRAM_URL}}
        instagramHandle: "@seu.perfil", // Replaces {{INSTAGRAM_HANDLE}}
        linkedinUrl: "https://linkedin.com/in/seu-perfil", // Replaces {{LINKEDIN_URL}}
        websiteUrl: "seusite.com" // Replaces {{SITE_URL}}
    },

    // API Configuration
    api: {
        // URL base da API
        baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000'  // Desenvolvimento local
            : 'https://seu-backend-url.onrender.com', // Produção (Substitua pela sua URL)

        // Endpoints
        endpoints: {
            auth: {
                login: '/api/auth/login',
                logout: '/api/auth/logout',
                check: '/api/auth/check'
            },
            blog: '/api/blog',
            projects: '/api/projects'
        }
    },

    // Database / KVDB Initialization Config
    db: {
        kvdbBucketId: "" // Provide instructions on how to set this up in README
    }
};

// Aliasing API_CONFIG for backwards compatibility with existing scripts
const API_CONFIG = TEMPLATE_CONFIG.api;

// ============================================
// HELPERS JWT
// ============================================

// Salvar token
window.setAuthToken = function (token) {
    localStorage.setItem('template_auth_token', token);
};

// Obter token
window.getAuthToken = function () {
    return localStorage.getItem('template_auth_token');
};

// Remover token
window.clearAuthToken = function () {
    localStorage.removeItem('template_auth_token');
};

// Verificar se está autenticado
window.isAuthenticated = function () {
    return !!window.getAuthToken();
};

// Função helper para fazer requests COM autenticação
window.apiRequest = async function (endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const token = window.getAuthToken();

    // Inicia headers padrão
    const headers = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // Só adiciona Content-Type se não for FormData e se não foi passado nos options
    if (!(options.body instanceof FormData) && (!options.headers || !options.headers['Content-Type'])) {
        headers['Content-Type'] = 'application/json';
    }

    const finalOptions = {
        ...options,
        headers: {
            ...headers,
            ...(options.headers || {})
        }
    };

    const response = await fetch(url, finalOptions);
    return response;
};

// Exporta para uso global
window.TEMPLATE_CONFIG = TEMPLATE_CONFIG;
window.API_CONFIG = API_CONFIG;

// Template Init script (auto-replaces constants in DOM)
document.addEventListener('DOMContentLoaded', () => {

    // Dictionary of strings to replace
    const replacements = {
        '{{SITE_NAME}}': TEMPLATE_CONFIG.site.name,
        '{{AUTHOR_EMAIL}}': TEMPLATE_CONFIG.contact.email,
        '{{INSTAGRAM_URL}}': TEMPLATE_CONFIG.contact.instagramUrl,
        '{{INSTAGRAM_HANDLE}}': TEMPLATE_CONFIG.contact.instagramHandle,
        '{{LINKEDIN_URL}}': TEMPLATE_CONFIG.contact.linkedinUrl,
        '{{SITE_URL}}': TEMPLATE_CONFIG.contact.websiteUrl
    };

    const performReplacements = (text) => {
        let newText = text;
        for (const [key, value] of Object.entries(replacements)) {
            if (newText.includes(key)) {
                // Use Split/Join to replace all occurrences efficiently without regex escaping issues
                newText = newText.split(key).join(value);
            }
        }
        return newText;
    };

    // Update Title
    document.title = performReplacements(document.title);

    // Recursive dom walker
    const walkDOM = (node) => {
        if (node.nodeType === 3) { // Text node
            if (node.nodeValue.includes('{{')) {
                node.nodeValue = performReplacements(node.nodeValue);
            }
        } else if (node.nodeType === 1 && node.nodeName !== "SCRIPT" && node.nodeName !== "STYLE") { // Element node
            // Check attributes (like href, alt, title, content)
            Array.from(node.attributes).forEach(attr => {
                if (attr.value.includes('{{')) {
                    attr.value = performReplacements(attr.value);
                }
            });

            for (let i = 0; i < node.childNodes.length; i++) {
                walkDOM(node.childNodes[i]);
            }
        }
    };

    walkDOM(document.body);

    // For meta tags in head
    document.head.querySelectorAll('meta').forEach(meta => {
        if (meta.content.includes('{{')) {
            meta.content = performReplacements(meta.content);
        }
    });
});
