/**
 * CMS Data Loader - Magic Oven
 * Sistema para carregar e renderizar conteúdo dinâmico do CMS
 */

const CMS = {
    // Cache de dados
    cache: {
        blog: null,
        projects: null
    },

    /**
     * Carrega dados do blog
     */
    async loadBlogPosts() {
        if (this.cache.blog) return this.cache.blog;

        try {
            const apiBase = window.API_CONFIG ? window.API_CONFIG.baseURL : '';
            const response = await fetch(`${apiBase}/api/blog`);
            const data = await response.json();
            this.cache.blog = data.posts;
            return data.posts;
        } catch (error) {
            console.error('Erro ao carregar posts do blog:', error);
            return [];
        }
    },

    /**
     * Carrega dados dos projetos
     */
    async loadProjects() {
        if (this.cache.projects) return this.cache.projects;

        try {
            const apiBase = window.API_CONFIG ? window.API_CONFIG.baseURL : '';
            const response = await fetch(`${apiBase}/api/projects`);
            const data = await response.json();
            this.cache.projects = data.projects;
            return data.projects;
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            return [];
        }
    },

    /**
     * Filtra posts publicados
     */
    getPublishedPosts(posts) {
        return posts.filter(post => post.published);
    },

    /**
     * Filtra projetos publicados
     */
    getPublishedProjects(projects) {
        return projects.filter(project => project.published);
    },

    /**
     * Obtém posts em destaque
     */
    getFeaturedPosts(posts, limit = 3) {
        return posts
            .filter(post => post.featured && post.published)
            .slice(0, limit);
    },

    /**
     * Obtém projetos em destaque
     */
    getFeaturedProjects(projects, limit = 3) {
        return projects
            .filter(project => project.featured && project.published)
            .slice(0, limit);
    },

    /**
     * Formata data para exibição
     */
    formatDate(dateString) {
        const months = [
            'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
            'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
        ];

        const date = new Date(dateString);
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    },

    /**
     * Renderiza um card de blog
     */
    renderBlogCard(post, delay = 0) {
        return `
            <article class="blog-card" data-aos="fade-up" data-aos-delay="${delay}">
                <div class="blog-meta">
                    <span class="blog-date">${this.formatDate(post.date)}</span>
                    <span class="blog-category">${post.category}</span>
                </div>
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-excerpt">
                    ${post.excerpt}
                </p>
                <a href="blog-post.html?slug=${post.slug}" class="blog-link">LER MAIS →</a>
            </article>
        `;
    },

    /**
     * Renderiza um card de projeto
     */
    renderProjectCard(project, delay = 0) {
        let imageHTML = `
            <div class="project-image-placeholder" style="background: ${project.imageGradient || 'var(--gradient-primary)'};">
            </div>
        `;

        if (project.image && project.image.trim() !== '') {
            imageHTML = `<img src="${project.image}" alt="${project.title}">`;
        }

        return `
            <article class="project-card" data-aos="fade-up" data-aos-delay="${delay}">
                <div class="project-image">
                    ${imageHTML}
                </div>
                <div class="project-info">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-category">${project.category}</p>
                    <p class="project-description">
                        ${project.description}
                    </p>
                    <a href="project.html?slug=${project.slug}" class="project-link">VER PROJETO →</a>
                </div>
            </article>
        `;
    },

    /**
     * Renderiza lista de posts do blog
     */
    async renderBlogList(containerId, limit = null) {
        console.log('🔍 renderBlogList chamado para:', containerId);
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Container não encontrado:', containerId);
            return;
        }

        console.log('✅ Container encontrado');
        const posts = await this.loadBlogPosts();
        console.log('📦 Posts carregados:', posts);

        const publishedPosts = this.getPublishedPosts(posts);
        console.log('📝 Posts publicados:', publishedPosts);

        const postsToRender = limit ? publishedPosts.slice(0, limit) : publishedPosts;
        console.log('🎯 Posts para renderizar:', postsToRender);

        container.innerHTML = postsToRender
            .map((post, index) => this.renderBlogCard(post, index * 100))
            .join('');

        console.log('✅ Posts renderizados no DOM');

        // Re-inicializa animações AOS se disponível
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        } else {
            // Se AOS não estiver disponível, garante que os elementos fiquem visíveis
            const cards = container.querySelectorAll('[data-aos]');
            cards.forEach(card => {
                card.style.opacity = '1';
                card.style.transform = 'none';
            });
        }
    },

    /**
     * Renderiza lista de projetos
     */
    async renderProjectsList(containerId, limit = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const projects = await this.loadProjects();
        const publishedProjects = this.getPublishedProjects(projects);
        const projectsToRender = limit ? publishedProjects.slice(0, limit) : publishedProjects;

        container.innerHTML = projectsToRender
            .map((project, index) => this.renderProjectCard(project, index * 100))
            .join('');

        // Re-inicializa animações AOS se disponível
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        } else {
            // Se AOS não estiver disponível, garante que os elementos fiquem visíveis
            const cards = container.querySelectorAll('[data-aos]');
            cards.forEach(card => {
                card.style.opacity = '1';
                card.style.transform = 'none';
            });
        }
    },

    /**
     * Busca post por slug
     */
    async getPostBySlug(slug) {
        const posts = await this.loadBlogPosts();
        return posts.find(post => post.slug === slug);
    },

    /**
     * Busca projeto por slug
     */
    async getProjectBySlug(slug) {
        const projects = await this.loadProjects();
        return projects.find(project => project.slug === slug);
    },

    /**
     * Inicializa o CMS na página
     */
    async init() {
        // Renderiza posts em destaque na home
        if (document.getElementById('featured-blog')) {
            await this.renderBlogList('featured-blog', 3);
        }

        // Renderiza projetos em destaque na home
        if (document.getElementById('featured-projects')) {
            await this.renderProjectsList('featured-projects', 3);
        }

        // Renderiza todos os posts na página de blog
        if (document.getElementById('blog-list')) {
            await this.renderBlogList('blog-list');
        }

        // Renderiza todos os projetos na página de portfolio
        if (document.getElementById('projects-list')) {
            await this.renderProjectsList('projects-list');
        }
    }
};

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CMS.init());
} else {
    CMS.init();
}

// Exporta para uso global
window.CMS = CMS;
