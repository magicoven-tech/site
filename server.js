/**
 * Magic Oven CMS - Backend Server
 * Servidor Express com autenticação e API REST
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de CORS
app.use(cors({
    origin: function (origin, callback) {
        // Permite localhost e o domínio em produção
        const allowedOrigins = [
            'http://localhost:3000',
            'https://magicoven.tech',
            'https://www.magicoven.tech'
        ];

        // Permite requisições sem origin (mobile apps, curl, etc)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração de sessão
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'magic-oven-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    name: 'magicoven.sid', // Nome customizado do cookie
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true em produção (HTTPS)
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' para cross-origin
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        path: '/' // Disponível em todas as rotas
    }
};

// Log da configuração (apenas em dev)
if (process.env.NODE_ENV !== 'production') {
    console.log('📋 Configuração de sessão:', sessionConfig);
}

app.use(session(sessionConfig));


// Servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// Caminhos dos arquivos de dados
const BLOG_FILE = path.join(__dirname, 'data', 'blog.json');
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// ============================================
// HELPERS - Leitura/Escrita de Arquivos
// ============================================

async function readJSON(filepath) {
    try {
        const data = await fs.readFile(filepath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erro ao ler ${filepath}:`, error);
        return null;
    }
}

async function writeJSON(filepath, data) {
    try {
        await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Erro ao escrever ${filepath}:`, error);
        return false;
    }
}

// ============================================
// MIDDLEWARE - Autenticação
// ============================================

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Não autenticado' });
    }
}

// ============================================
// ROTAS - Autenticação
// ============================================

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    const usersData = await readJSON(USERS_FILE);
    if (!usersData || !usersData.users) {
        return res.status(500).json({ error: 'Erro ao carregar usuários' });
    }

    const user = usersData.users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verifica senha
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Cria sessão
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
        success: true,
        user: {
            id: user.id,
            username: user.username,
            name: user.name
        }
    });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao fazer logout' });
        }
        res.json({ success: true });
    });
});

// Verificar autenticação
app.get('/api/auth/check', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            authenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// ============================================
// ROTAS - Blog Posts
// ============================================

// Listar todos os posts
app.get('/api/blog', async (req, res) => {
    const data = await readJSON(BLOG_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Erro ao carregar posts' });
    }
    res.json(data);
});

// Obter post por ID
app.get('/api/blog/:id', async (req, res) => {
    const data = await readJSON(BLOG_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Erro ao carregar posts' });
    }

    const post = data.posts.find(p => p.id === req.params.id);
    if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
    }

    res.json(post);
});

// Criar novo post (protegido)
app.post('/api/blog', requireAuth, async (req, res) => {
    const data = await readJSON(BLOG_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Erro ao carregar posts' });
    }

    const newPost = {
        id: String(Date.now()),
        ...req.body,
        date: new Date().toISOString().split('T')[0]
    };

    data.posts.unshift(newPost);
    const success = await writeJSON(BLOG_FILE, data);

    if (!success) {
        return res.status(500).json({ error: 'Erro ao salvar post' });
    }

    res.json({ success: true, post: newPost });
});

// Atualizar post (protegido)
app.put('/api/blog/:id', requireAuth, async (req, res) => {
    const data = await readJSON(BLOG_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Erro ao carregar posts' });
    }

    const index = data.posts.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Post não encontrado' });
    }

    data.posts[index] = {
        ...data.posts[index],
        ...req.body,
        id: req.params.id // Mantém o ID original
    };

    const success = await writeJSON(BLOG_FILE, data);
    if (!success) {
        return res.status(500).json({ error: 'Erro ao atualizar post' });
    }

    res.json({ success: true, post: data.posts[index] });
});

// Deletar post (protegido)
app.delete('/api/blog/:id', requireAuth, async (req, res) => {
    const data = await readJSON(BLOG_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Erro ao carregar posts' });
    }

    const index = data.posts.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Post não encontrado' });
    }

    data.posts.splice(index, 1);
    const success = await writeJSON(BLOG_FILE, data);

    if (!success) {
        return res.status(500).json({ error: 'Erro ao deletar post' });
    }

    res.json({ success: true });
});

// ============================================
// ROTAS - Projetos
// ============================================

// Listar todos os projetos
app.get('/api/projects', async (req, res) => {
    const data = await readJSON(PROJECTS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Erro ao carregar projetos' });
    }
    res.json(data);
});

// Obter projeto por ID
app.get('/api/projects/:id', async (req, res) => {
    const data = await readJSON(PROJECTS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Erro ao carregar projetos' });
    }

    const project = data.projects.find(p => p.id === req.params.id);
    if (!project) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json(project);
});

// Criar novo projeto (protegido)
app.post('/api/projects', requireAuth, async (req, res) => {
    const data = await readJSON(PROJECTS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Erro ao carregar projetos' });
    }

    const newProject = {
        id: String(Date.now()),
        ...req.body,
        number: '0' + (data.projects.length + 1)
    };

    data.projects.unshift(newProject);
    const success = await writeJSON(PROJECTS_FILE, data);

    if (!success) {
        return res.status(500).json({ error: 'Erro ao salvar projeto' });
    }

    res.json({ success: true, project: newProject });
});

// Atualizar projeto (protegido)
app.put('/api/projects/:id', requireAuth, async (req, res) => {
    const data = await readJSON(PROJECTS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Erro ao carregar projetos' });
    }

    const index = data.projects.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    data.projects[index] = {
        ...data.projects[index],
        ...req.body,
        id: req.params.id
    };

    const success = await writeJSON(PROJECTS_FILE, data);
    if (!success) {
        return res.status(500).json({ error: 'Erro ao atualizar projeto' });
    }

    res.json({ success: true, project: data.projects[index] });
});

// Deletar projeto (protegido)
app.delete('/api/projects/:id', requireAuth, async (req, res) => {
    const data = await readJSON(PROJECTS_FILE);
    if (!data) {
        return res.status(500).json({ error: 'Erro ao carregar projetos' });
    }

    const index = data.projects.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    data.projects.splice(index, 1);
    const success = await writeJSON(PROJECTS_FILE, data);

    if (!success) {
        return res.status(500).json({ error: 'Erro ao deletar projeto' });
    }

    res.json({ success: true });
});

// ============================================
// INICIALIZAÇÃO
// ============================================

// Criar usuário admin padrão se não existir
async function initializeUsers() {
    try {
        await fs.access(USERS_FILE);
    } catch {
        // Arquivo não existe, criar com usuário padrão
        const defaultPassword = await bcrypt.hash('admin123', 10);
        const usersData = {
            users: [
                {
                    id: '1',
                    username: 'admin',
                    password: defaultPassword,
                    name: 'Administrador',
                    email: 'admin@magicoven.tech'
                }
            ]
        };
        await writeJSON(USERS_FILE, usersData);
        console.log('✅ Usuário admin criado (username: admin, password: admin123)');
        console.log('⚠️  ALTERE A SENHA EM PRODUÇÃO!');
    }
}

// Iniciar servidor
app.listen(PORT, async () => {
    await initializeUsers();
    console.log(`
╔══════════════════════════════════════╗
║   Magic Oven CMS Backend Server      ║
╚══════════════════════════════════════╝

🚀 Servidor rodando em: http://localhost:${PORT}
📝 Admin CMS: http://localhost:${PORT}/admin/
🔐 Login padrão: admin / admin123

⚠️  Altere a senha padrão em produção!
    `);
});
