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
        this.setupImageUpload();
        this.setupLogout();
    },

    /**
     * Verifica autenticação
     */
    async checkAuth() {
        try {
            const response = await apiRequest('/api/auth/check');
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
                    // Limpa o token JWT
                    clearAuthToken();
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
            const response = await apiRequest('/api/blog', {
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
            const response = await apiRequest('/api/projects', {
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

        // Toolbar do Editor (Blog)
        this.setupEditorToolbar();

        // Menu de Formatação (Seleção)
        this.setupFormattingMenu();
    },

    /**
     * Configura o menu de formatação de texto (seleção)
     */
    setupFormattingMenu() {
        const textarea = document.getElementById('blog-content');
        const menu = document.getElementById('formatting-menu');

        if (!textarea || !menu) return;

        // Mostrar menu na seleção
        textarea.addEventListener('mouseup', (e) => this.handleTextSelection(e, textarea, menu));
        textarea.addEventListener('keyup', (e) => {
            if (e.key === 'Shift' || e.key.startsWith('Arrow')) {
                this.handleTextSelection(e, textarea, menu);
            }
        });

        // Esconder menu ao clicar fora
        document.addEventListener('mousedown', (e) => {
            if (!menu.contains(e.target) && e.target !== textarea) {
                menu.classList.remove('active');
            }
        });

        // Ações de formatação
        menu.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const format = btn.dataset.format;
                this.applyFormat(format, textarea);
                menu.classList.remove('active');
            });
        });
    },

    /**
     * Lida com a seleção de texto e posicionamento do menu
     */
    handleTextSelection(e, textarea, menu) {
        // Pequeno delay para garantir que a seleção foi atualizada
        setTimeout(() => {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            if (start !== end) {
                // Há texto selecionado
                // Calcular posição
                // Como textarea não dá coordenadas X/Y do cursor facilmente,
                // vamos posicionar próximo ao mouse (mouseup) ou centralizado (fallback)

                let top, left;

                if (e.type === 'mouseup') {
                    top = e.clientY - 50;
                    left = e.clientX;
                } else {
                    // Fallback para seleção via teclado: centralizado na textarea (aproximado)
                    const rect = textarea.getBoundingClientRect();
                    top = rect.top + (rect.height / 2); // Apenas um fallback visual
                    left = rect.left + (rect.width / 2);
                }

                // Ajustes de limites da tela
                if (left < 0) left = 10;
                if (top < 0) top = 10;

                menu.style.top = `${top + window.scrollY}px`;
                menu.style.left = `${left + window.scrollX}px`;

                // Centralizar o menu no ponto X
                menu.style.transform = 'translate(-50%, 0)';

                menu.classList.add('active');
            } else {
                menu.classList.remove('active');
            }
        }, 10);
    },

    /**
     * Aplica a formatação selecionada ao texto
     */
    applyFormat(format, textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';
        let cursorOffset = 0;

        switch (format) {
            case 'bold':
                replacement = `**${selectedText}**`;
                cursorOffset = 2; // Move cursor para dentro se não houver texto selecionado (futuro)
                break;
            case 'italic':
                replacement = `*${selectedText}*`;
                break;
            case 'link':
                const url = prompt('URL do link:', 'https://');
                if (url) {
                    replacement = `[${selectedText}](${url})`;
                } else {
                    return; // Cancelado
                }
                break;
            case 'h2':
                // Remove # existetes se houver
                const cleanH2 = selectedText.replace(/^#+\s*/, '');
                replacement = `\n## ${cleanH2}`;
                break;
            case 'h3':
                const cleanH3 = selectedText.replace(/^#+\s*/, '');
                replacement = `\n### ${cleanH3}`;
                break;
            case 'quote':
                const cleanQuote = selectedText.replace(/^>\s*/, '');
                replacement = `\n> ${cleanQuote}`;
                break;
        }

        // Aplicar substituição
        textarea.setRangeText(replacement, start, end, 'select');

        // Focar de volta e ajustar cursor se necessário
        textarea.focus();
    },

    /**
     * Configura a toolbar do editor
     */
    setupEditorToolbar() {
        const toggleBtn = document.getElementById('toolbar-toggle');
        const toolbar = document.querySelector('.editor-toolbar');
        const blogImageInput = document.getElementById('blog-image-input');

        if (!toggleBtn || !toolbar) return;

        // Toggle do menu
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Evita submit do form se estiver dentro dele
            toolbar.classList.toggle('active');
            toggleBtn.textContent = toolbar.classList.contains('active') ? '×' : '+';
        });

        // Opção de Imagem
        document.getElementById('toolbar-image').addEventListener('click', () => {
            blogImageInput.click();
        });

        blogImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file, (url) => {
                    const markdown = `\n![Legenda da Imagem](${url})\n`;
                    this.insertAtCursor('blog-content', markdown);
                    toolbar.classList.remove('active');
                    toggleBtn.textContent = '+';
                    // Scroll para o fim da inserção se necessário ou foco
                });
            }
        });

        // Opção de Vídeo
        document.getElementById('toolbar-video').addEventListener('click', () => {
            const code = `\n<div class="video-container">\n  <iframe src="URL_DO_VIDEO_AQUI" title="Video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n</div>\n`;
            this.insertAtCursor('blog-content', code);
            toolbar.classList.remove('active');
            toggleBtn.textContent = '+';
        });

        // Opção de Código
        document.getElementById('toolbar-code').addEventListener('click', () => {
            const code = `\n\`\`\`javascript\n// Seu código aqui\n\`\`\`\n`;
            this.insertAtCursor('blog-content', code);
            toolbar.classList.remove('active');
            toggleBtn.textContent = '+';
        });

        // Opção de Divisor
        document.getElementById('toolbar-divider').addEventListener('click', () => {
            this.insertAtCursor('blog-content', '\n---\n');
            toolbar.classList.remove('active');
            toggleBtn.textContent = '+';
        });

        // Opção de Embed/Link
        document.getElementById('toolbar-embed').addEventListener('click', () => {
            this.insertAtCursor('blog-content', '\n[Texto do Link](https://exemplo.com)\n');
            toolbar.classList.remove('active');
            toggleBtn.textContent = '+';
        });
    },

    /**
     * Insere texto na posição do cursor em um textarea
     */
    insertAtCursor(fieldId, text) {
        const textarea = document.getElementById(fieldId);
        if (!textarea) return;

        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const scrollTop = textarea.scrollTop;

        textarea.value = textarea.value.substring(0, startPos) + text + textarea.value.substring(endPos, textarea.value.length);

        textarea.focus();
        textarea.selectionStart = startPos + text.length;
        textarea.selectionEnd = startPos + text.length;
        textarea.scrollTop = scrollTop;
    },

    /**
     * Configura upload de imagem com drag and drop
     */
    setupImageUpload() {
        const dropzone = document.getElementById('project-image-dropzone');
        const input = document.getElementById('project-image-input');
        const previewImg = document.getElementById('image-preview');
        const previewContainer = document.getElementById('image-preview-container');
        const clearBtn = document.getElementById('clear-image');
        const urlInput = document.getElementById('project-image-url');

        if (!dropzone || !input) return;

        // Clique no dropzone abre o seletor de arquivo
        dropzone.addEventListener('click', (e) => {
            if (e.target !== clearBtn) {
                input.click();
            }
        });

        // Eventos de drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'));
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'));
        });

        // Drop de arquivo
        dropzone.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file) this.handleImageUpload(file, (url) => this.showImagePreview(url));
        });

        // Seleção de arquivo via input
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleImageUpload(file, (url) => this.showImagePreview(url));
        });

        // Limpar imagem
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearImagePreview();
        });
    },

    /**
     * Faz upload da imagem para o servidor
     * @param {File} file Arquivo de imagem
     * @param {Function} onSuccess Callback chamado com a URL da imagem em caso de sucesso
     */
    async handleImageUpload(file, onSuccess) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            // Feedback visual genérico se possível, se não apenas alert
            const dropzoneText = document.querySelector('.dropzone-text');
            let originalText = '';
            if (dropzoneText) {
                originalText = dropzoneText.textContent;
                dropzoneText.textContent = 'Enviando...';
            }

            const response = await apiRequest('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (dropzoneText) {
                dropzoneText.textContent = originalText;
            }

            if (response.ok && data.url) {
                if (onSuccess) onSuccess(data.url);
            } else {
                alert('Erro ao fazer upload: ' + (data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Erro ao fazer upload da imagem.');
        }
    },

    /**
     * Mostra preview da imagem
     */
    showImagePreview(url) {
        const previewImg = document.getElementById('image-preview');
        const previewContainer = document.getElementById('image-preview-container');
        const clearBtn = document.getElementById('clear-image');
        const urlInput = document.getElementById('project-image-url');
        const dropzoneText = document.querySelector('.dropzone-text');

        const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.baseURL}${url}`;

        previewImg.src = fullUrl;
        previewContainer.style.display = 'block';
        clearBtn.style.display = 'flex';
        urlInput.value = url;
        dropzoneText.style.display = 'none';
    },

    /**
     * Limpa preview da imagem
     */
    clearImagePreview() {
        const previewImg = document.getElementById('image-preview');
        const previewContainer = document.getElementById('image-preview-container');
        const clearBtn = document.getElementById('clear-image');
        const urlInput = document.getElementById('project-image-url');
        const dropzoneText = document.querySelector('.dropzone-text');
        const input = document.getElementById('project-image-input');

        previewImg.src = '';
        previewContainer.style.display = 'none';
        clearBtn.style.display = 'none';
        urlInput.value = '';
        dropzoneText.style.display = 'block';
        input.value = ''; // Reseta input de arquivo
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

            const response = await apiRequest(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
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
                console.log('✅ Artigo salvo com sucesso!');
                alert('✅ Artigo salvo com sucesso!');
                cancelForm(); // Removido 'this.'
                await this.loadBlogPosts();
            } else {
                // Mensagens de erro mais específicas
                console.error('❌ Erro do servidor:', data);
                if (response.status === 401) {
                    alert('❌ Sessão expirada. Faça login novamente.');
                    window.location.href = '/admin/login.html';
                } else {
                    alert('❌ Erro ao salvar artigo: ' + (data.error || 'Erro desconhecido'));
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
            image: document.getElementById('project-image-url').value || '',
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

            const response = await apiRequest(apiUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
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
            const response = await apiRequest(`/api/${type}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
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

            // Preview da imagem se existir
            if (item.image) {
                this.showImagePreview(item.image);
            } else {
                this.clearImagePreview();
            }

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
            const response = await apiRequest(`/api/${type}/${id}`, {
                method: 'DELETE',
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
    AdminCMS.clearImagePreview();
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminCMS.init());
} else {
    AdminCMS.init();
}

// Exporta para uso global
window.AdminCMS = AdminCMS;
