/**
 * Magic Oven CMS - Backend Server
 * Servidor Express com autenticação JWT e API REST
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'magic-oven-jwt-secret-change-in-production';


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

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ============================================
// ROTAS - Health Check
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
        // Se o arquivo não existir, retorna null silenciosamente
        if (error.code === 'ENOENT') {
            return null;
        }
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
// MIDDLEWARE JWT
// ============================================

// Middleware para verificar token JWT
function verifyToken(req, res, next) {
    // Busca token no header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
}

// Função para gerar token
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}


// ============================================
// MIDDLEWARE - Autenticação
// ============================================

// Middleware requireAuth agora usa JWT (alias para verifyToken)
const requireAuth = verifyToken;


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

    // Gera token JWT
    const token = generateToken(user);

    res.json({
        success: true,
        token: token,
        user: {
            id: user.id,
            username: user.username,
            name: user.name
        }
    });
});


// Logout
app.post('/api/auth/logout', (req, res) => {
    // Com JWT, o logout é feito no frontend
    res.json({ success: true });
});

// Verificar autenticação
app.get('/api/auth/check', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.json({ authenticated: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            authenticated: true,
            user: {
                id: decoded.id,
                username: decoded.username,
                name: decoded.name
            }
        });
    } catch (error) {
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
                    email: 'magicoven.tech@gmail.com'
                }
            ]
        };
        await writeJSON(USERS_FILE, usersData);
        console.log('✅ Usuário admin criado (username: admin, password: admin123)');
        console.log('⚠️  ALTERE A SENHA EM PRODUÇÃO!');
    }
}


// Servir arquivos estáticos (Fallback para SPA/Arquivos)
// Colocado após as APIs para garantir que rotas da API tenham prioridade
app.use(express.static(path.join(__dirname)));

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
