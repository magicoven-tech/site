/**
 * CMS Admin Panel - Magic Oven
 * Sistema de administração com API REST e autenticação
 */

const AdminCMS = {
    currentTab: 'blog',
    editingId: null,
    currentData: {
        blog: null,
        projects: null
    },

    /**
     * Inicializa o painel admin
     */
    async init() {
        // Verifica autenticação
        const isAuth = await this.checkAuth();
        if (!isAuth) {
            window.location.href = '/admin/login.html';
            return;
        }

        // Carrega dados
        await this.loadBlogPosts();
        await this.loadProjects();
        this.setupForms();
        this.setupLogout();
    },

    /**
     * Verifica autenticação
     */
    async checkAuth() {
        try {
            const response = await fetch('/api/auth/check', {
                credentials: 'include'
            });
            const data = await response.json();
            return data.authenticated;
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            return false;
        }
    },

    /**
     * Configurar logout
     */
    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    window.location.href = '/admin/login.html';
                } catch (error) {
                    console.error('Erro no logout:', error);
                }
            });
        }
    },

    /**
     * Carrega posts do blog via API
     */
    async loadBlogPosts() {
        try {
            const response = await fetch('/api/blog', {
                credentials: 'include'
            });
            const data = await response.json();
            this.currentData.blog = data.posts;
            this.renderBlogList(data.posts);
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            this.renderEmptyState('blog-list', '📝', 'Erro ao carregar posts');
        }
    },

    /**
     * Carrega projetos via API
     */
    async loadProjects() {
        try {
            const response = await fetch('/api/projects', {
                credentials: 'include'
            });
            const data = await response.json();
            this.currentData.projects = data.projects;
            this.renderProjectsList(data.projects);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            this.renderEmptyState('projects-list', '🎨', 'Erro ao carregar projetos');
        }
    },

    /**
     * Renderiza lista de posts
     */
    renderBlogList(posts) {
        const container = document.getElementById('blog-list');

        if (!posts || posts.length === 0) {
            this.renderEmptyState('blog-list', '📝', 'Nenhum post cadastrado ainda');
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="item-card">
                <div class="item-info">
                    <h3>
                        <span class="status-indicator status-${post.published ? 'published' : 'draft'}"></span>
                        ${post.title}
                    </h3>
                    <div class="item-meta">
                        <span class="badge badge-${post.published ? 'published' : 'draft'}">
                            ${post.published ? 'Publicado' : 'Rascunho'}
                        </span>
                        ${post.featured ? '<span class="badge badge-featured">Destaque</span>' : ''}
                        <span>${post.category}</span>
                        <span>•</span>
                        <span>${this.formatDate(post.date)}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-icon btn-toggle" onclick="AdminCMS.togglePublish('blog', '${post.id}')" title="Alternar publicação">
                        ${post.published ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button class="btn-icon btn-edit" onclick="AdminCMS.editItem('blog', '${post.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete" onclick="AdminCMS.deleteItem('blog', '${post.id}')" title="Excluir">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Renderiza lista de projetos
     */
    renderProjectsList(projects) {
        const container = document.getElementById('projects-list');

        if (!projects || projects.length === 0) {
            this.renderEmptyState('projects-list', '🎨', 'Nenhum projeto cadastrado ainda');
            return;
        }

        container.innerHTML = projects.map(project => `
            <div class="item-card">
                <div class="item-info">
                    <h3>
                        <span class="status-indicator status-${project.published ? 'published' : 'draft'}"></span>
                        ${project.title}
                    </h3>
                    <div class="item-meta">
                        <span class="badge badge-${project.published ? 'published' : 'draft'}">
                            ${project.published ? 'Publicado' : 'Rascunho'}
                        </span>
                        ${project.featured ? '<span class="badge badge-featured">Destaque</span>' : ''}
                        <span>${project.category}</span>
                        <span>•</span>
                        <span>${project.year || 'Sem ano'}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-icon btn-toggle" onclick="AdminCMS.togglePublish('projects', '${project.id}')" title="Alternar publicação">
                        ${project.published ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button class="btn-icon btn-edit" onclick="AdminCMS.editItem('projects', '${project.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete" onclick="AdminCMS.deleteItem('projects', '${project.id}')" title="Excluir">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Renderiza estado vazio
     */
    renderEmptyState(containerId, icon, message) {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Formata data
     */
    formatDate(dateString) {
        if (!dateString) return 'Sem data';

        const months = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];

        const date = new Date(dateString);
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    },

    /**
     * Configura formulários
     */
    setupForms() {
        // Form de blog
        const blogForm = document.getElementById('blogPostForm');
        if (blogForm) {
            blogForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveBlogPost();
            });
        }

        // Form de projetos
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProject();
            });
        }
    },

    /**
     * Salva post do blog via API
     */
    async saveBlogPost() {
        const title = document.getElementById('blog-title').value;
        const category = document.getElementById('blog-category').value;
        const excerpt = document.getElementById('blog-excerpt').value;
        const content = document.getElementById('blog-content').value;
        const tags = document.getElementById('blog-tags').value.split(',').map(t => t.trim()).filter(t => t);
        const featured = document.getElementById('blog-featured').checked;
        const published = document.getElementById('blog-published').checked;

        const postData = {
            title,
            slug: this.createSlug(title),
            category: category.toUpperCase(),
            excerpt,
            content: content || '<p>Conteúdo em breve...</p>',
            author: 'Magic Oven',
            tags,
            featured,
            published
        };

        console.log('📤 Enviando post:', postData);

        try {
            const url = this.editingId ? `/api/blog/${this.editingId}` : '/api/blog';
            const method = this.editingId ? 'PUT' : 'POST';

            console.log(`📡 Request: ${method} ${url}`);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(postData)
            });

            console.log('📥 Response status:', response.status);
            console.log('📥 Response ok:', response.ok);

            let data;
            try {
                data = await response.json();
                console.log('📥 Response data:', data);
            } catch (jsonError) {
                console.error('❌ Erro ao parsear JSON da resposta:', jsonError);
                alert('❌ Servidor retornou resposta inválida');
                return;
            }

            if (response.ok && data.success) {
                console.log('✅ Post salvo com sucesso!');
                alert('✅ Post salvo com sucesso!');
                cancelForm(); // Removido 'this.'
                await this.loadBlogPosts();
            } else {
                // Mensagens de erro mais específicas
                console.error('❌ Erro do servidor:', data);
                if (response.status === 401) {
                    alert('❌ Sessão expirada. Faça login novamente.');
                    window.location.href = '/admin/login.html';
                } else {
                    alert('❌ Erro ao salvar post: ' + (data.error || 'Erro desconhecido'));
                }
            }
        } catch (error) {
            console.error('❌ Erro capturado no catch:', error);
            console.error('❌ Erro nome:', error.name);
            console.error('❌ Erro mensagem:', error.message);
            console.error('❌ Stack trace:', error.stack);
            alert('❌ Erro de conexão: ' + error.message + '\n\nVerifique o console (F12) para mais detalhes.');
        }
    },

    /**
     * Salva projeto via API
     */
    async saveProject() {
        const title = document.getElementById('project-title').value;
        const category = document.getElementById('project-category').value;
        const description = document.getElementById('project-description').value;
        const fullDescription = document.getElementById('project-full-description').value;
        const client = document.getElementById('project-client').value;
        const year = document.getElementById('project-year').value;
        const gradient = document.getElementById('project-gradient').value;
        const url = document.getElementById('project-url').value;
        const featured = document.getElementById('project-featured').checked;
        const published = document.getElementById('project-published').checked;

        const projectData = {
            title: title.toUpperCase(),
            slug: this.createSlug(title),
            category,
            description,
            fullDescription: fullDescription || '<p>Descrição completa em breve...</p>',
            client: client || 'Cliente',
            year: year || new Date().getFullYear().toString(),
            services: [],
            technologies: [],
            image: '',
            imageGradient: gradient || 'linear-gradient(135deg, #27FF2B 0%, #1ed923 100%)',
            featured,
            published,
            gallery: [],
            url: url || '',
            tags: []
        };

        try {
            const apiUrl = this.editingId ? `/api/projects/${this.editingId}` : '/api/projects';
            const method = this.editingId ? 'PUT' : 'POST';

            const response = await fetch(apiUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(projectData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('✅ Projeto salvo com sucesso!');
                cancelForm(); // Removido 'this.'
                await this.loadProjects();
            } else {
                alert('❌ Erro ao salvar projeto: ' + (data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao salvar projeto:', error);
            alert('❌ Erro ao salvar projeto. Verifique se o servidor está rodando.');
        }
    },

    /**
     * Cria slug a partir do título
     */
    createSlug(title) {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    },

    /**
     * Alterna publicação
     */
    async togglePublish(type, id) {
        const dataArray = type === 'blog' ? this.currentData.blog : this.currentData.projects;
        const item = dataArray.find(i => i.id === id);

        if (!item) {
            alert('Item não encontrado');
            return;
        }

        const updatedItem = {
            ...item,
            published: !item.published
        };

        try {
            const response = await fetch(`/api/${type}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updatedItem)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Recarrega dados
                if (type === 'blog') {
                    await this.loadBlogPosts();
                } else {
                    await this.loadProjects();
                }
            } else {
                alert('Erro ao alternar publicação');
            }
        } catch (error) {
            console.error('Erro ao alternar publicação:', error);
            alert('Erro ao alternar publicação');
        }
    },

    /**
     * Edita item
     */
    async editItem(type, id) {
        this.editingId = id;

        const dataArray = type === 'blog' ? this.currentData.blog : this.currentData.projects;
        const item = dataArray.find(i => i.id === id);

        if (!item) {
            alert('Item não encontrado');
            return;
        }

        if (type === 'blog') {
            // Preenche formulário de blog
            document.getElementById('blog-title').value = item.title;
            document.getElementById('blog-category').value = item.category;
            document.getElementById('blog-excerpt').value = item.excerpt;
            document.getElementById('blog-content').value = item.content || '';
            document.getElementById('blog-tags').value = item.tags ? item.tags.join(', ') : '';
            document.getElementById('blog-featured').checked = item.featured;
            document.getElementById('blog-published').checked = item.published;

            document.getElementById('blog-form').style.display = 'block';
            document.getElementById('blog-form').scrollIntoView({ behavior: 'smooth' });
        } else {
            // Preenche formulário de projetos
            document.getElementById('project-title').value = item.title;
            document.getElementById('project-category').value = item.category;
            document.getElementById('project-description').value = item.description;
            document.getElementById('project-full-description').value = item.fullDescription || '';
            document.getElementById('project-client').value = item.client || '';
            document.getElementById('project-year').value = item.year || '';
            document.getElementById('project-gradient').value = item.imageGradient || '';
            document.getElementById('project-url').value = item.url || '';
            document.getElementById('project-featured').checked = item.featured;
            document.getElementById('project-published').checked = item.published;

            document.getElementById('project-form').style.display = 'block';
            document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
        }
    },

    /**
     * Deleta item
     */
    async deleteItem(type, id) {
        if (!confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const response = await fetch(`/api/${type}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('✅ Item excluído com sucesso!');
                // Recarrega dados
                if (type === 'blog') {
                    await this.loadBlogPosts();
                } else {
                    await this.loadProjects();
                }
            } else {
                alert('❌ Erro ao excluir item: ' + (data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao excluir item:', error);
            alert('❌ Erro ao excluir item. Verifique se o servidor está rodando.');
        }
    }
};

/**
 * Troca de aba
 */
function switchTab(tab) {
    // Atualiza botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Atualiza conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');

    AdminCMS.currentTab = tab;
}

/**
 * Mostra formulário de criação
 */
function showCreateForm() {
    AdminCMS.editingId = null;

    if (AdminCMS.currentTab === 'blog') {
        document.getElementById('blog-form').style.display = 'block';
        document.getElementById('blogPostForm').reset();
        document.getElementById('blog-form').scrollIntoView({ behavior: 'smooth' });
    } else {
        document.getElementById('project-form').style.display = 'block';
        document.getElementById('projectForm').reset();
        document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Cancela formulário
 */
function cancelForm() {
    document.getElementById('blog-form').style.display = 'none';
    document.getElementById('project-form').style.display = 'none';
    AdminCMS.editingId = null;
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminCMS.init());
} else {
    AdminCMS.init();
}

// Exporta para uso global
window.AdminCMS = AdminCMS;
