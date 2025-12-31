/**
 * Configuração da API
 * Define a URL base da API dependendo do ambiente
 */

const API_CONFIG = {
    // URL base da API
    baseURL: window.location.hostname === 'localhost'
        ? 'http://localhost:3000'  // Desenvolvimento local
        : 'https://magicoven-backend.onrender.com', // Produção - Render

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
};

// Função helper para fazer requests
window.apiRequest = async function (endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    return response;
};

// Exporta para uso global
window.API_CONFIG = API_CONFIG;
