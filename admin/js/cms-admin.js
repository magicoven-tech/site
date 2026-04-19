/**
 * CMS Admin Panel - Magic Oven
 * Sistema de administração com API REST e autenticação
 */

const AdminCMS = {
    currentTab: 'blog',
    editingId: null,
    currentData: {
        blog: null,
        projects: null,
        messages: null
    },
    selectedItems: {
        blog: new Set(),
        projects: new Set(),
        messages: new Set()
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

        // Inicializa Turndown
        this.turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });

        // REGRA CUSTOM: Preservar blocos de código com quebras de linha
        this.turndownService.addRule('codeBlock', {
            filter: 'pre',
            replacement: function (content, node) {
                const firstCode = node.querySelector('code');
                const language = firstCode ? (firstCode.className.match(/language-(\w+)/) || [])[1] : '';
                
                // Converte <br> em \n e remove outras tags HTML mantendo o texto
                let code = node.innerHTML
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<\/p>/gi, '\n')
                    .replace(/<\/div>/gi, '\n')
                    .replace(/<[^>]+>/g, ''); // Remove tags HTML remanescentes
                
                // Decodifica entidades HTML básico
                code = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
                
                return '\n\n```' + (language || '') + '\n' + code.trim() + '\n```\n\n';
            }
        });

        // Carrega dados
        await this.loadBlogPosts();
        await this.loadProjects();
        await this.loadMessages();
        this.setupForms();
        this.setupImageUpload();
        this.setupLogout();
        this.setupModals();
        await this.setupProfile();
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
     * Carrega mensagens via API
     */
    async loadMessages() {
        try {
            const response = await apiRequest('/api/messages');
            const data = await response.json();
            this.currentData.messages = data.messages;
            this.updateUnreadCount(data.messages);
            this.renderMessagesList(data.messages);
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            this.renderEmptyState('messages-list', '📩', 'Erro ao carregar mensagens');
        }
    },

    /**
     * Atualiza o contador de mensagens não lidas
     */
    updateUnreadCount(messages) {
        const unreadCount = messages.filter(m => !m.read).length;
        const badge = document.getElementById('unread-count');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },

    /**
     * Renderiza a lista de mensagens
     */
    renderMessagesList(messages) {
        const container = document.getElementById('messages-list');
        if (!container) return;

        if (!messages || messages.length === 0) {
            document.getElementById('messages-select-all-container').style.display = 'none';
            this.renderEmptyState('messages-list', '📩', 'Nenhuma mensagem recebida');
            return;
        }

        document.getElementById('messages-select-all-container').style.display = 'flex';

        // Atualiza checkbox de selecionar todos
        const selectAllCheckbox = document.getElementById('messages-select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = this.selectedItems.messages.size === messages.length && messages.length > 0;
        }

        container.innerHTML = messages.map(msg => {
            const isSelected = this.selectedItems.messages.has(msg.id);
            return `
            <div class="message-card ${msg.read ? '' : 'unread'} ${isSelected ? 'selected' : ''}" id="msg-${msg.id}">
                <div class="item-checkbox">
                    <input type="checkbox" onchange="AdminCMS.toggleSelection('messages', '${msg.id}')" ${isSelected ? 'checked' : ''}>
                </div>
                <div class="message-info">
                    <div class="message-header">
                        <h3>
                            <span class="status-indicator status-${msg.read ? 'read' : 'unread'}"></span>
                            ${msg.name}
                            ${!msg.read ? '<span class="badge badge-unread" style="margin-left: 10px; font-size: 9px;">NOVA</span>' : ''}
                        </h3>
                        <div class="message-meta">
                            <span>${msg.email}</span>
                            <span>•</span>
                            <span>Projeto: ${msg.project}</span>
                        </div>
                    </div>
                    <div class="message-body">${msg.message}</div>
                    <div class="message-date-meta">
                        ${new Date(msg.date).toLocaleString('pt-BR')}
                    </div>
                </div>
                <div class="item-actions">
                    ${!msg.read ? `
                        <button class="btn-icon btn-toggle" onclick="AdminCMS.markMessageAsRead('${msg.id}')" title="Marcar como lida">
                            ✅
                        </button>
                    ` : ''}
                    <button class="btn-icon btn-delete" onclick="AdminCMS.deleteItem('messages', '${msg.id}')" title="Excluir">
                        🗑️
                    </button>
                </div>
            </div>
        `}).join('');
    },

    /**
     * Marca uma mensagem como lida
     */
    async markMessageAsRead(id) {
        try {
            const response = await apiRequest(`/api/messages/${id}/read`, {
                method: 'PUT'
            });
            if (response.ok) {
                await this.loadMessages(); // Recarrega para atualizar tudo
            }
        } catch (error) {
            console.error('Erro ao marcar mensagem como lida:', error);
            showModal('Erro', 'Não foi possível atualizar o status da mensagem.');
        }
    },

    /**
     * Exclui uma mensagem
     */
    async deleteMessage(id) {
        const confirmed = await showConfirmModal(
            'Excluir Mensagem',
            'Tem certeza que deseja excluir esta mensagem permanentemente?'
        );

        if (confirmed) {
            try {
                const response = await apiRequest(`/api/messages/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    await this.loadMessages();
                }
            } catch (error) {
                console.error('Erro ao excluir mensagem:', error);
                showModal('Erro', 'Não foi possível excluir a mensagem.');
            }
        }
    },

    /**
     * Renderiza lista de posts
     */
    renderBlogList(posts) {
        const container = document.getElementById('blog-list');

        if (!posts || posts.length === 0) {
            document.getElementById('blog-select-all-container').style.display = 'none';
            this.renderEmptyState('blog-list', '📝', 'Nenhum post cadastrado ainda');
            return;
        }

        document.getElementById('blog-select-all-container').style.display = 'flex';

        // Atualiza checkbox de selecionar todos
        const selectAllCheckbox = document.getElementById('blog-select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = this.selectedItems.blog.size === posts.length && posts.length > 0;
        }

        container.innerHTML = posts.map(post => {
            const isSelected = this.selectedItems.blog.has(post.id);
            return `
            <div class="item-card ${isSelected ? 'selected' : ''}">
                <div class="item-checkbox">
                    <input type="checkbox" onchange="AdminCMS.toggleSelection('blog', '${post.id}')" ${isSelected ? 'checked' : ''}>
                </div>
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
        `}).join('');
    },

    /**
     * Renderiza lista de projetos
     */
    renderProjectsList(projects) {
        const container = document.getElementById('projects-list');

        if (!projects || projects.length === 0) {
            document.getElementById('projects-select-all-container').style.display = 'none';
            this.renderEmptyState('projects-list', '🎨', 'Nenhum projeto cadastrado ainda');
            return;
        }

        document.getElementById('projects-select-all-container').style.display = 'flex';

        // Atualiza checkbox de selecionar todos
        const selectAllCheckbox = document.getElementById('projects-select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = this.selectedItems.projects.size === projects.length && projects.length > 0;
        }

        container.innerHTML = projects.map(project => {
            const isSelected = this.selectedItems.projects.has(project.id);
            return `
            <div class="item-card ${isSelected ? 'selected' : ''}">
                <div class="item-checkbox">
                    <input type="checkbox" onchange="AdminCMS.toggleSelection('projects', '${project.id}')" ${isSelected ? 'checked' : ''}>
                </div>
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
        `}).join('');
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

        // Toolbar do Editor
        this.setupEditorToolbar('blog-content', 'toolbar', 'blog-image-input');
        this.setupEditorToolbar('project-full-description', 'project-toolbar', 'project-full-description-image-input');

        // Menu de Formatação (Seleção)
        this.setupFormattingMenu('blog-content');
        this.setupFormattingMenu('project-full-description');

        // Menu de Imagem (Cursor)
        this.setupImageMenu('blog-content');
        this.setupImageMenu('project-full-description');

        // Paste Handling
        this.setupPasteHandling('blog-content');
        this.setupPasteHandling('project-full-description');
    },

    /**
     * Configura o menu de formatação de imagem (Tamanhos)
     */
    setupImageMenu(textareaId = 'blog-content') {
        const textarea = document.getElementById(textareaId);
        const menu = document.getElementById('image-menu');

        if (!textarea || !menu) return;

        // Detectar cursor em imagem
        const checkCursor = (e) => this.handleImageCursor(e, textarea, menu);

        textarea.addEventListener('mouseup', checkCursor);
        textarea.addEventListener('keyup', checkCursor);
        textarea.addEventListener('click', checkCursor);

        // Esconder menu ao clicar fora
        if (!menu.hasAttribute('data-listener')) {
            document.addEventListener('mousedown', (e) => {
                const isEditor = e.target.tagName === 'TEXTAREA' || e.target.closest('.editor-wrapper');
                if (!menu.contains(e.target) && !isEditor) {
                    menu.classList.remove('active');
                }
            });
            menu.setAttribute('data-listener', 'true');
        }

        // Ações de redimensionamento
        menu.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const size = btn.dataset.size;
                this.resizeImage(size, textarea);
                // Manter menu ativo ou atualizar posição?
                // checkCursor(); // Re-verifica para manter o menu
            });
        });
    },

    /**
     * Verifica se o cursor está dentro de uma imagem Markdown e mostra o menu
     */
    handleImageCursor(e, textarea, menu) {
        this.activeTextarea = textarea;
        
        const target = e.target;
        if (target.tagName === 'IMG') {
            this.activeImageElement = target;
            
            // Posicionar Menu em cima da imagem
            const rect = target.getBoundingClientRect();
            let top = rect.bottom + 10;
            let left = rect.left + (rect.width / 2);

            menu.style.top = `${top + window.scrollY}px`;
            menu.style.left = `${left + window.scrollX}px`;
            menu.style.transform = 'translate(-50%, 0)';

            // Esconder o menu de formatação de texto se estiver aberto
            document.getElementById('formatting-menu').classList.remove('active');
            menu.classList.add('active');
        } else {
            menu.classList.remove('active');
            this.activeImageElement = null;
        }
    },

    /**
     * Aplica o redimensionamento (hash) à imagem selecionada
     */
    resizeImage(size, textarea) {
        if (!this.activeImageElement) return;

        const img = this.activeImageElement;
        let url = img.src;

        // Remover hashes existentes
        url = url.replace(/#medium$/, '').replace(/#full$/, '');

        // Limpar classes existentes
        img.classList.remove('image-medium', 'image-full');

        // Adicionar novo hash e classe
        if (size === 'medium') {
            url += '#medium';
            img.classList.add('image-medium');
        } else if (size === 'full') {
            url += '#full';
            img.classList.add('image-full');
        }

        img.src = url;
    },

    /**
     * Lida com a seleção de texto e posicionamento do menu (Formatação)
     */
    setupFormattingMenu(textareaId = 'blog-content') {
        const textarea = document.getElementById(textareaId);
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
        if (!menu.hasAttribute('data-listener')) {
            document.addEventListener('mousedown', (e) => {
                const isEditor = e.target.tagName === 'TEXTAREA' || e.target.closest('.editor-wrapper');
                if (!menu.contains(e.target) && !isEditor) {
                    menu.classList.remove('active');
                }
            });
            menu.setAttribute('data-listener', 'true');
        }

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
        this.activeTextarea = textarea;
        // Pequeno delay para garantir que a seleção foi atualizada
        setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            if (selectedText.length > 0) {
                // Há texto selecionado
                const range = selection.getRangeAt(0);
                
                // Garantir que a seleção está dentro do editor
                if (!textarea.contains(range.commonAncestorContainer)) {
                    menu.classList.remove('active');
                    return;
                }

                const rect = range.getBoundingClientRect();

                let top = rect.top - 60;
                let left = rect.left + (rect.width / 2);

                // Ajustes de limites da tela
                if (left < 10) left = 10;
                if (top < 10) top = 10;

                menu.style.top = `${top + window.scrollY}px`;
                menu.style.left = `${left + window.scrollX}px`;
                menu.style.transform = 'translate(-50%, 0)';

                menu.classList.add('active');
            } else {
                menu.classList.remove('active');
            }
        }, 50); // Aumentar levemente o delay para estabilidade
    },

    /**
     * Aplica a formatação selecionada ao texto
     */
    applyFormat(format, textarea) {
        // No contenteditable, document.execCommand usa a seleção atual automaticamente
        switch (format) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'link':
                const url = prompt('URL do link:', 'https://');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
                break;
            case 'h2':
                document.execCommand('formatBlock', false, 'h2');
                break;
            case 'h3':
                document.execCommand('formatBlock', false, 'h3');
                break;
            case 'quote':
                document.execCommand('formatBlock', false, 'blockquote');
                break;
        }

        // Garantir que o editor mantém o foco
        if (textarea) textarea.focus();
    },

    /**
     * Configura a toolbar do editor
     */
    setupEditorToolbar(textareaId = 'blog-content', toolbarPrefix = 'toolbar', imageInputId = 'blog-image-input') {
        const toggleBtn = document.getElementById(`${toolbarPrefix}-toggle`);

        // Find the specific toolbar for this textarea
        const textarea = document.getElementById(textareaId);
        if (!textarea) return;

        const wrapper = textarea.closest('.editor-wrapper');
        const toolbar = wrapper ? wrapper.querySelector('.editor-toolbar') : document.querySelector('.editor-toolbar');
        const imageInput = document.getElementById(imageInputId);

        if (!toggleBtn || !toolbar) return;

        // Toggle do menu
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Evita submit do form se estiver dentro dele
            toolbar.classList.toggle('active');
            toggleBtn.textContent = toolbar.classList.contains('active') ? '×' : '+';
        });

        // Sync repositioning
        const updatePos = () => this.syncToolbarPosition(textareaId, toolbar);
        textarea.addEventListener('click', updatePos);
        textarea.addEventListener('keyup', updatePos);
        textarea.addEventListener('focus', updatePos);
        textarea.addEventListener('input', updatePos);

        // Handler para teclas especiais dentro de blocos de código
        textarea.addEventListener('keydown', (e) => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const pre = range.startContainer.parentElement.closest('pre');

            if (pre) {
                const codeNode = pre.querySelector('code');
                const isLanguageDraft = codeNode && codeNode.classList.contains('language-auto');

                if (e.key === 'Enter') {
                    e.preventDefault();
                    
                    if (isLanguageDraft) {
                        const lang = codeNode.innerText.trim();
                        codeNode.className = `language-${lang || 'text'}`;
                        codeNode.innerText = ''; // Limpa o nome da linguagem
                        // Força um pequeno atraso para que a limpeza do texto seja processada
                        setTimeout(() => {
                            document.execCommand('insertHTML', false, '<br>');
                        }, 0);
                    } else {
                        // Usar insertHTML com <br> é mais estável para manter a estrutura no contenteditable
                        document.execCommand('insertHTML', false, '<br>');
                    }
                    
                    // Scroll se necessário
                    setTimeout(() => {
                        const selection = window.getSelection();
                        if (!selection.rangeCount) return;
                        const range = selection.getRangeAt(0);
                        const cursorRect = range.getBoundingClientRect();
                        const preRect = pre.getBoundingClientRect();
                        if (cursorRect.bottom > preRect.bottom) {
                            pre.scrollTop += (cursorRect.bottom - preRect.bottom) + 20;
                        }
                    }, 0);
                } else if (e.key === 'Tab') {
                    e.preventDefault();
                    document.execCommand('insertText', false, '    ');
                }
            }
        });

        // Opção de Imagem
        const btnImage = document.getElementById(`${toolbarPrefix}-image`);
        if (btnImage && imageInput) {
            btnImage.addEventListener('click', () => {
                imageInput.click();
            });

            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImageUpload(file, (url) => {
                        const imgHtml = `<img src="${url}" alt="Imagem">`;
                        this.insertAtCursor(textareaId, imgHtml);
                        toolbar.classList.remove('active');
                        toggleBtn.textContent = '+';
                    });
                }
            });
        }

        // Opção de Vídeo (Adaptado para HTML)
        const btnVideo = document.getElementById(`${toolbarPrefix}-video`);
        if (btnVideo) {
            btnVideo.addEventListener('click', async () => {
                const url = await this.customPrompt('Inserir Vídeo', 'Digite a URL do vídeo (embed):');
                if (url) {
                   const html = `<div class="video-container"><iframe src="${url}" frameborder="0" allowfullscreen></iframe></div>`;
                   this.insertAtCursor(textareaId, html);
                }
                toolbar.classList.remove('active');
                toggleBtn.textContent = '+';
            });
        }

        // Opção de Código
        const btnCode = document.getElementById(`${toolbarPrefix}-code`);
        if (btnCode) {
            btnCode.addEventListener('click', () => {
                // Ao invés de prompt, inserimos um bloco com classe especial
                const html = `<pre><code class="language-auto"></code></pre><p><br></p>`;
                this.insertAtCursor(textareaId, html);
                toolbar.classList.remove('active');
                toggleBtn.textContent = '+';
            });
        }

        // Opção de Divisor
        const btnDivider = document.getElementById(`${toolbarPrefix}-divider`);
        if (btnDivider) {
            btnDivider.addEventListener('click', () => {
                this.insertAtCursor(textareaId, '<hr>');
                toolbar.classList.remove('active');
                toggleBtn.textContent = '+';
            });
        }

        // Opção de Embed/Link
        const btnEmbed = document.getElementById(`${toolbarPrefix}-embed`);
        if (btnEmbed) {
            btnEmbed.addEventListener('click', () => {
                const url = prompt('URL:');
                if (url) {
                   this.insertAtCursor(textareaId, `<a href="${url}">${url}</a>`);
                }
                toolbar.classList.remove('active');
                toggleBtn.textContent = '+';
            });
        }
    },

    /**
     * Insere HTML na posição do cursor em um contenteditable
     */
    insertAtCursor(fieldId, html) {
        const editor = document.getElementById(fieldId);
        if (!editor) return;

        editor.focus();
        
        // Se houver seleção, substitui. Se não, insere no cursor.
        document.execCommand('insertHTML', false, html);
    },

    /**
     * Configura limpeza de conteúdo colado
     */
    setupPasteHandling(fieldId) {
        const editor = document.getElementById(fieldId);
        if (!editor) return;

        editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    },

    /**
     * Sincroniza a posição do toolbar com o parágrafo atual
     */
    syncToolbarPosition(editorId, toolbar) {
        const editor = document.getElementById(editorId);
        if (!editor || !toolbar) return;

        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            let node = selection.anchorNode;
            if (!node) return;

            // Encontrar o elemento pai que seja um bloco direto do editor
            let block = node.nodeType === 3 ? node.parentNode : node;
            
            while (block && block.parentNode !== editor && block !== editor) {
                block = block.parentNode;
            }

            if (block && block.parentNode === editor) {
                // Posicionar verticalmente
                const offsetTop = block.offsetTop;
                toolbar.style.top = `${offsetTop}px`;
                
                // Visibilidade baseada em conteúdo (estilo Medium)
                // Um bloco é considerado vazio se não tem texto ou se tem apenas um <br>
                const isEmpty = block.innerText.trim() === "" && (block.childNodes.length === 0 || (block.childNodes.length === 1 && block.childNodes[0].tagName === 'BR'));

                if (isEmpty) {
                    toolbar.classList.add('visible');
                } else {
                    toolbar.classList.remove('visible');
                    toolbar.classList.remove('active');
                    const toggleBtn = document.getElementById(`${editorId === 'blog-content' ? 'toolbar' : 'project-toolbar'}-toggle`);
                    if (toggleBtn) toggleBtn.textContent = '+';
                }
            } else if (block === editor) {
                // Caso o editor esteja vazio
                toolbar.style.top = `0px`;
                toolbar.classList.add('visible');
            } else {
                toolbar.classList.remove('visible');
            }
        }, 0);
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
     * Faz upload da imagem para o servidor (com compressão automática se necessário)
     * @param {File} file Arquivo de imagem
     * @param {Function} onSuccess Callback chamado com a URL da imagem em caso de sucesso
     */
    async handleImageUpload(file, onSuccess) {
        if (!file.type.startsWith('image/')) {
            this.customAlert('Aviso', 'Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        const dropzoneText = document.querySelector('.dropzone-text');
        const dropzoneInfo = document.querySelector('.dropzone-info');
        let originalText = dropzoneText ? dropzoneText.textContent : 'Arraste uma imagem';
        let originalInfo = dropzoneInfo ? dropzoneInfo.textContent : '';

        let fileToUpload = file;
        const MAX_SIZE_MB = 5;

        // Verifica se precisa comprimir
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            try {
                if (dropzoneText) dropzoneText.textContent = 'Comprimindo...';
                if (dropzoneInfo) dropzoneInfo.textContent = 'Reduzindo tamanho para otimização';

                console.log(`[CMS] Iniciando compressão de ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

                const options = {
                    maxSizeMB: MAX_SIZE_MB,
                    maxWidthOrHeight: 4096, // Aumentado para 4K para manter mais detalhes
                    initialQuality: 0.9,     // Começa com qualidade muito alta
                    useWebWorker: true,
                    onProgress: (progress) => {
                        if (dropzoneText) dropzoneText.textContent = `Comprimindo (${progress}%)`;
                    }
                };

                fileToUpload = await imageCompression(file, options);
                console.log(`[CMS] Compressão concluída: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
                
            } catch (error) {
                console.error('Erro na compressão:', error);
                // Se falhar a compressão, avisa o usuário mas tenta subir o original (o servidor deve barrar se for > 5MB)
            }
        }

        if (dropzoneText) dropzoneText.textContent = 'Enviando...';
        if (dropzoneInfo) dropzoneInfo.textContent = 'Salvando no servidor';

        const formData = new FormData();
        formData.append('image', fileToUpload, file.name);

        try {
            const response = await apiRequest('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            // Restaura textos da UI
            if (dropzoneText) dropzoneText.textContent = originalText;
            if (dropzoneInfo) dropzoneInfo.textContent = originalInfo;

            if (response.ok) {
                let finalUrl = '';
                if (typeof data.url === 'string') {
                    finalUrl = data.url;
                } else if (data && typeof data === 'object') {
                    if (data.url && typeof data.url === 'string') finalUrl = data.url;
                    else if (data.path) finalUrl = data.path;
                    else if (data.file && data.file.path) finalUrl = data.file.path;
                    else if (data.location) finalUrl = data.location;
                    else {
                        console.error('Erro: URL não encontrada na resposta do upload', data);
                        this.customAlert('Aviso', 'Erro ao processar imagem. Tente novamente.');
                        return;
                    }
                } else {
                    finalUrl = String(data);
                }

                if (onSuccess) onSuccess(finalUrl);
            } else {
                this.customAlert('Aviso', 'Erro ao fazer upload: ' + (data.error || data.message || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            if (dropzoneText) dropzoneText.textContent = originalText;
            if (dropzoneInfo) dropzoneInfo.textContent = originalInfo;
            this.customAlert('Aviso', 'Erro ao fazer upload da imagem.');
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
        const contentHtml = document.getElementById('blog-content').innerHTML;
        const contentMarkdown = this.turndownService.turndown(contentHtml);
        const tags = document.getElementById('blog-tags').value.split(',').map(t => t.trim()).filter(t => t);
        const featured = document.getElementById('blog-featured').checked;
        const published = document.getElementById('blog-published').checked;

        const postData = {
            title,
            slug: this.createSlug(title),
            category: category.toUpperCase(),
            excerpt,
            content: contentMarkdown || 'Conteúdo em breve...',
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
                this.customAlert('Erro', 'Servidor retornou resposta inválida');
                return;
            }

            if (response.ok && data.success) {
                console.log('✅ Artigo salvo com sucesso!');
                this.customAlert('Sucesso', 'Artigo salvo com sucesso!');
                cancelForm(); // Removido 'this.'
                await this.loadBlogPosts();
            } else {
                // Mensagens de erro mais específicas
                console.error('❌ Erro do servidor:', data);
                if (response.status === 401) {
                    await this.customAlert('Erro', 'Sessão expirada. Faça login novamente.');
                    window.location.href = '/admin/login.html';
                } else {
                    this.customAlert('Erro', 'Erro ao salvar artigo: ' + (data.error || 'Erro desconhecido'));
                }
            }
        } catch (error) {
            console.error('❌ Erro capturado no catch:', error);
            console.error('❌ Erro nome:', error.name);
            console.error('❌ Erro mensagem:', error.message);
            console.error('❌ Stack trace:', error.stack);
            this.customAlert('Erro', 'Erro de conexão: ' + error.message + '\n\nVerifique o console (F12) para mais detalhes.');
        }
    },

    /**
     * Salva projeto via API
     */
    async saveProject() {
        const title = document.getElementById('project-title').value;
        const category = document.getElementById('project-category').value;
        const description = document.getElementById('project-description').value;
        // const fullDescription = document.getElementById('project-full-description').value; // Removido
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
            fullDescription: this.turndownService.turndown(document.getElementById('project-full-description').innerHTML) || 'Descrição completa em breve...',
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
                this.customAlert('Sucesso', 'Projeto salvo com sucesso!');
                cancelForm(); // Removido 'this.'
                await this.loadProjects();
            } else {
                this.customAlert('Erro', 'Erro ao salvar projeto: ' + (data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao salvar projeto:', error);
            this.customAlert('Erro', 'Erro ao salvar projeto. Verifique se o servidor está rodando.');
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
            this.customAlert('Aviso', 'Item não encontrado');
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
                this.customAlert('Aviso', 'Erro ao alternar publicação');
            }
        } catch (error) {
            console.error('Erro ao alternar publicação:', error);
            this.customAlert('Aviso', 'Erro ao alternar publicação');
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
            this.customAlert('Aviso', 'Item não encontrado');
            return;
        }

        if (type === 'blog') {
            // Preenche formulário de blog
            document.getElementById('blog-title').value = item.title;
            document.getElementById('blog-category').value = item.category;
            document.getElementById('blog-excerpt').value = item.excerpt;
            
            // Markdown to HTML
            document.getElementById('blog-content').innerHTML = marked.parse(item.content || '');
            
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
            
            // Markdown to HTML
            document.getElementById('project-full-description').innerHTML = marked.parse(item.fullDescription || '');
            
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
        const confirmed = await this.customConfirm('Excluir Item', 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.');
        if (!confirmed) {
            return;
        }

        try {
            const response = await apiRequest(`/api/${type}/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.customAlert('Sucesso', 'Item excluído com sucesso!');
                // Recarrega dados
                if (type === 'blog') {
                    await this.loadBlogPosts();
                } else if (type === 'projects') {
                    await this.loadProjects();
                } else if (type === 'messages') {
                    await this.loadMessages();
                }
            } else {
                this.customAlert('Erro', 'Erro ao excluir item: ' + (data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao excluir item:', error);
            this.customAlert('Erro', 'Erro ao excluir item. Verifique se o servidor está rodando.');
        }
    },

    /**
     * Alterna seleção para excluir em lote
     */
    toggleSelection(type, id) {
        if (this.selectedItems[type].has(id)) {
            this.selectedItems[type].delete(id);
        } else {
            this.selectedItems[type].add(id);
        }
        this.updateBatchUI(type);
        
        if(type === 'blog') {
            this.renderBlogList(this.currentData.blog);
        } else if (type === 'projects') {
            this.renderProjectsList(this.currentData.projects);
        } else {
            this.renderMessagesList(this.currentData.messages);
        }
    },

    /**
     * Seleciona ou remove seleção de todos os itens
     */
    toggleSelectAll(type, isChecked) {
        if (isChecked) {
            // Seleciona todos
            const items = this.currentData[type] || [];
            items.forEach(item => {
                this.selectedItems[type].add(item.id);
            });
        } else {
            // Limpa seleção
            this.selectedItems[type].clear();
        }

        this.updateBatchUI(type);

        if(type === 'blog') {
            this.renderBlogList(this.currentData.blog);
        } else if (type === 'projects') {
            this.renderProjectsList(this.currentData.projects);
        } else {
            this.renderMessagesList(this.currentData.messages);
        }
    },

    /**
     * Limpa seleção
     */
    clearSelection(type) {
        this.selectedItems[type].clear();
        this.updateBatchUI(type);
        
        if(type === 'blog' && this.currentData.blog) {
            this.renderBlogList(this.currentData.blog);
        } else if (type === 'projects' && this.currentData.projects) {
            this.renderProjectsList(this.currentData.projects);
        } else if (type === 'messages' && this.currentData.messages) {
            this.renderMessagesList(this.currentData.messages);
        }
    },

    /**
     * Atualiza UI de lote
     */
    updateBatchUI(type) {
        const count = this.selectedItems[type].size;
        const bar = document.getElementById(`${type}-batch-actions`);
        const countSpan = document.getElementById(`${type}-selected-count`);
        
        if (bar && countSpan) {
            countSpan.textContent = count;
            if (count > 0) {
                bar.classList.remove('hidden');
            } else {
                bar.classList.add('hidden');
            }
        }
    },

    /**
     * Exclui itens selecionados em lote
     */
    async batchDelete(type) {
        const ids = Array.from(this.selectedItems[type]);
        if (ids.length === 0) return;

        const confirmed = await this.customConfirm('Excluir Itens', `Tem certeza que deseja excluir os ${ids.length} itens selecionados?`);
        if (!confirmed) {
            return;
        }

        try {
            const response = await apiRequest(`/api/${type}/batch-delete`, {
                method: 'POST',
                body: JSON.stringify({ ids })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.customAlert('Sucesso', `${data.deletedCount} itens excluídos com sucesso!`);
                this.selectedItems[type].clear();
                this.updateBatchUI(type);
                
                // Recarrega dados
                if (type === 'blog') {
                    await this.loadBlogPosts();
                } else if (type === 'projects') {
                    await this.loadProjects();
                } else if (type === 'messages') {
                    await this.loadMessages();
                }
            } else {
                this.customAlert('Erro', 'Erro ao excluir itens: ' + (data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao excluir itens em lote:', error);
            this.customAlert('Erro', 'Erro ao excluir itens em lote. Verifique se o servidor está rodando.');
        }
    },

    setupModals() {
                this.customAlert = (title, msg) => {
            return new Promise(resolve => {
                const titleEl = document.getElementById('alert-modal-title');
                if(!titleEl) {
                    alert((title ? title + " - " : "") + msg);
                    resolve();
                    return;
                }
                const msgEl = document.getElementById('alert-modal-msg');
                const modal = document.getElementById('alert-modal');
                const okBtn = document.getElementById('alert-modal-ok');

                titleEl.textContent = title;
                msgEl.textContent = msg;
                modal.style.display = 'flex';

                const handleClick = () => {
                    modal.style.display = 'none';
                    okBtn.removeEventListener('click', handleClick);
                    resolve();
                };
                okBtn.addEventListener('click', handleClick);
            });
        };

        this.customConfirm = (title, msg) => {
            return new Promise(resolve => {
                document.getElementById('confirm-modal-title').textContent = title;
                document.getElementById('confirm-modal-msg').textContent = msg;
                const modal = document.getElementById('confirm-modal');
                modal.style.display = 'flex';
                
                const okBtn = document.getElementById('confirm-modal-ok');
                const cancelBtn = document.getElementById('confirm-modal-cancel');
                
                const cleanup = () => {
                    okBtn.onclick = null;
                    cancelBtn.onclick = null;
                    modal.style.display = 'none';
                }
                okBtn.onclick = () => { cleanup(); resolve(true); }
                cancelBtn.onclick = () => { cleanup(); resolve(false); }
            });
        };

        this.customPrompt = (title, msg, defaultValue = '') => {
            return new Promise(resolve => {
                const modal = document.getElementById('prompt-modal');
                const titleEl = document.getElementById('prompt-modal-title');
                const msgEl = document.getElementById('prompt-modal-msg');
                const inputEl = document.getElementById('prompt-modal-input');
                const okBtn = document.getElementById('prompt-modal-ok');
                const cancelBtn = document.getElementById('prompt-modal-cancel');

                if (!modal) {
                    const result = prompt(msg, defaultValue);
                    resolve(result);
                    return;
                }

                titleEl.textContent = title;
                msgEl.textContent = msg;
                inputEl.value = defaultValue;
                modal.style.display = 'flex';
                inputEl.focus();

                const cleanup = () => {
                    okBtn.onclick = null;
                    cancelBtn.onclick = null;
                    modal.style.display = 'none';
                }

                okBtn.onclick = () => {
                    const val = inputEl.value;
                    cleanup();
                    resolve(val);
                };

                cancelBtn.onclick = () => {
                    cleanup();
                    resolve(null);
                };
            });
        };
    },

    async setupProfile() {
        // Obter user atual
        try {
            const response = await apiRequest('/api/auth/check');
            const data = await response.json();
            const currentUser = data.user;

            const profileForm = document.getElementById('profileForm');
            const messageEl = document.getElementById('profile-message');
            const userSelect = document.getElementById('user-select');

            if (currentUser.username === 'admin') {
                document.getElementById('admin-user-selector').style.display = 'block';
                const usersResp = await apiRequest('/api/users');
                const users = await usersResp.json();
                
                userSelect.innerHTML = users.map(u => `<option value="${u.username}">${u.name} (${u.username})</option>`).join('');
            }

            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('profile-email').value;
                const newPassword = document.getElementById('profile-password').value;
                
                const body = {};
                if(email) body.email = email;
                if(newPassword) body.newPassword = newPassword;

                if(!body.email && !body.newPassword) {
                    messageEl.textContent = 'Preencha algum campo para alterar.';
                    messageEl.style.color = 'var(--color-error)';
                    messageEl.style.display = 'block';
                    return;
                }

                let url = '/api/auth/profile';
                if (currentUser.username === 'admin' && userSelect.value !== 'admin') {
                    url = `/api/users/${userSelect.value}`;
                }

                try {
                    const res = await apiRequest(url, {
                        method: 'PUT',
                        body: JSON.stringify(body)
                    });
                    const result = await res.json();

                    if (res.ok && result.success) {
                        messageEl.textContent = '✅ Perfil atualizado com sucesso!';
                        messageEl.style.color = '#4CAF50';
                        messageEl.style.display = 'block';
                        profileForm.reset();
                    } else {
                        messageEl.textContent = '❌ Erro: ' + (result.error || 'Falha ao atualizar');
                        messageEl.style.color = 'var(--color-error)';
                        messageEl.style.display = 'block';
                    }
                } catch(e) {
                    messageEl.textContent = '❌ Erro de conexão.';
                    messageEl.style.color = 'var(--color-error)';
                    messageEl.style.display = 'block';
                }
            });

        } catch(e) {
            console.error('Erro ao configurar perfil:', e);
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
        // Se o clique foi no badge, o event.target pode não ser o botão
        if (btn.contains(event.target) || btn === event.target) {
            btn.classList.add('active');
        }
    });

    // Atualiza conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');

    // Esconde o botão de "Nova publicação" se estiver em Perfil ou Mensagens
    const createBtn = document.querySelector('.main-nav .btn-primary');
    if (createBtn) {
        if (tab === 'profile' || tab === 'messages') {
            createBtn.style.display = 'none';
        } else {
            createBtn.style.display = 'block';
        }
    }

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
        document.getElementById('blog-content').innerHTML = ''; // Clear contenteditable
        document.getElementById('blog-form').scrollIntoView({ behavior: 'smooth' });
    } else if (AdminCMS.currentTab === 'projects') {
        document.getElementById('project-form').style.display = 'block';
        document.getElementById('projectForm').reset();
        document.getElementById('project-full-description').innerHTML = ''; // Clear contenteditable
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
    
    // Clear editors
    const blogEditor = document.getElementById('blog-content');
    const projectEditor = document.getElementById('project-full-description');
    if (blogEditor) blogEditor.innerHTML = '';
    if (projectEditor) projectEditor.innerHTML = '';
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminCMS.init());
} else {
    AdminCMS.init();
}

// Exporta para uso global
window.AdminCMS = AdminCMS;
