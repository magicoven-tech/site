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

// ============================================
// HELPERS JWT
// ============================================

// Salvar token
window.setAuthToken = function (token) {
    localStorage.setItem('magicoven_token', token);
};

// Obter token
window.getAuthToken = function () {
    return localStorage.getItem('magicoven_token');
};

// Remover token
window.clearAuthToken = function () {
    localStorage.removeItem('magicoven_token');
};

// Verificar se está autenticado
window.isAuthenticated = function () {
    return !!window.getAuthToken();
};

// Função helper para fazer requests COM autenticação
window.apiRequest = async function (endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const token = window.getAuthToken();

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };

    const response = await fetch(url, finalOptions);
    return response;
};

// Exporta para uso global
window.API_CONFIG = API_CONFIG;
