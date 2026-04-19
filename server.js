/**
 * Magic Oven CMS - Backend Server
 * Servidor Express com autenticação JWT e API REST
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const matter = require('gray-matter');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'magic-oven-jwt-secret-change-in-production';


// Middleware de CORS
app.use(cors({
    origin: function (origin, callback) {
        // Permite localhost, IP local e domínios ngrok
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://192.168.0.4:3000',
            'https://magicoven.tech',
            'https://www.magicoven.tech'
        ];

        const isNgrok = origin && origin.endsWith('.ngrok-free.app');

        // Permite requisições sem origin ou de origens permitidas
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || isNgrok) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos de upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do Multer para uploads de imagem
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Garante que a pasta de uploads exista
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5.5 * 1024 * 1024 }, // Pequena margem acima de 5MB para evitar erros de arredondamento
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        console.log(`[Multer] Validando upload: name=${file.originalname}, type=${file.mimetype}`);

        // Aceita se o mimetype for válido
        // O extname pode falhar se o arquivo for enviado sem extensão via Blob,
        // mas o mimetype é mais confiável. No entanto, mantemos a verificação de ambos como padrão.
        if (mimetype && (extname || file.originalname === 'blob' || !path.extname(file.originalname))) {
            return cb(null, true);
        }
        
        console.error(`❌ [Multer] Filtro falhou: mimetype=${mimetype}, extname=${extname}`);
        cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, webp, gif)'));
    }
});

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Emulação de envio se não houver configurações
async function sendEmail(to, subject, text, html) {
    if(!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('\n=============================================');
        console.log(`📧 E-MAIL SIMULADO PARA: ${to}`);
        console.log(`📌 ASSUNTO: ${subject}`);
        console.log(`💬 MENSAGEM: \n${text}`);
        console.log('=============================================\n');
        return true;
    }
    
    try {
        const info = await transporter.sendMail({
            from: `"CMS Magic Oven" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log('Email enviado: %s', info.messageId);
        return true;
    } catch(err) {
        console.error('Erro ao enviar email:', err);
        return false;
    }
}

// Armazenamento em memória para tokens de redefinição
const resetTokens = new Map(); // key: email, value: { code, expires }

// ============================================
// ROTAS - Health Check
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Caminhos dos arquivos de dados
const POSTS_DIR = path.join(__dirname, 'data', 'posts');
const PROJECTS_DIR = path.join(__dirname, 'data', 'projects');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Ensure posts and projects directories exist
fs.mkdir(POSTS_DIR, { recursive: true }).catch(console.error);
fs.mkdir(PROJECTS_DIR, { recursive: true }).catch(console.error);


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

// ============================================
// HELPERS - Git Sync
// ============================================

/**
 * Realiza o commit e push das alterações para o GitHub
 */
function gitSync(message) {
    // Para funcionar em produção (Render), você deve configurar GITHUB_TOKEN e GITHUB_REPO no painel.
    const gitToken = process.env.GITHUB_TOKEN;
    const gitRepo = process.env.GITHUB_REPO; // Formato: usuario/repositorio

    // ATENÇÃO: O Render faz o checkout em estado "Detached HEAD".
    // Precisamos forçar o push do commit atual (HEAD) para a branch remota 'main'.
    let pushCommand = 'git push origin HEAD:main';

    // Se tivermos as credenciais, usamos a URL autenticada
    if (gitToken && gitRepo) {
        pushCommand = `git push https://${gitToken}@github.com/${gitRepo}.git HEAD:main`;
    }

    // Configuração do Git via variáveis de ambiente para segurança
    const gitEmail = process.env.GIT_USER_EMAIL || "bot@magicoven.tech";
    const gitName = process.env.GIT_USER_NAME || "Magic Oven Bot";

    const setupUser = `git config --global user.email "${gitEmail}" && git config --global user.name "${gitName}"`;
    // Escapa aspas simples e coloca a mensagem entre aspas simples para proteger contra quebras no shell bash do Linux (Render)
    const safeMessage = message.replace(/'/g, "'\\''");
    const gitCommand = `${setupUser} && git add . && git commit -m '${safeMessage}' && ${pushCommand}`;

    console.log(`🚀 Iniciando sincronização Git: ${message}`);

    exec(gitCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Erro crítico no Git Sync: ${error.message}`);
            console.error(`🔍 STDERR: ${stderr}`);
            // Em caso de erro localmente, pode ser que o "origin main" não exista ou precise de push manual
            return;
        }
        if (stderr && !stderr.includes('Everything up-to-date') && !stderr.includes('remote:')) {
            console.warn(`⚠️ Git Warning: ${stderr}`);
        }
        console.log(`✅ Git Sync concluído com sucesso! \nDetalhes: ${stdout}`);
    });
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
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
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

    const requiresPasswordChange = password === 'admin123';

    // Gera token JWT
    const token = generateToken(user);

    res.json({
        success: true,
        token: token,
        requiresPasswordChange: requiresPasswordChange,
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email
        }
    });
});

app.post('/api/auth/change-first-password', requireAuth, async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });

    const usersData = await readJSON(USERS_FILE);
    const userIndex = usersData.users.findIndex(u => u.username === req.user.username);
    if (userIndex === -1) return res.status(404).json({ error: 'Usuário não encontrado' });

    usersData.users[userIndex].password = await bcrypt.hash(newPassword, 10);
    await writeJSON(USERS_FILE, usersData);
    
    // Envia email avisando mudança
    await sendEmail(
        usersData.users[userIndex].email,
        "Sua senha foi alterada ✅",
        "Você definiu uma nova senha de segurança com sucesso no CMS Magic Oven.",
        "<p>Prezado(a) <strong>" + req.user.name + "</strong>,</p><p>Você definiu uma nova senha de segurança com sucesso no CMS Magic Oven.</p>"
    );
    res.json({ success: true });
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { usernameOrEmail } = req.body;
    const usersData = await readJSON(USERS_FILE);
    const user = usersData.users.find(u => u.username === usernameOrEmail || u.email === usernameOrEmail);
    
    if (!user) {
        // Por segurança, pode não revelar que não encontrou, mas retornaremos erro para a UX pedida
        return res.status(404).json({ error: 'Usuário ou e-mail não encontrado' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetTokens.set(user.email, { code, expires: Date.now() + 15 * 60 * 1000, username: user.username });

    const sent = await sendEmail(
        user.email,
        "Código de Recuperação - Magic Oven",
        `Seu código é: ${code}`,
        `<p>Olá,</p><p>Você solicitou uma alteração de senha. Seu código é:</p><h2>${code}</h2><p>Válido por 15 minutos.</p>`
    );

    if (sent) res.json({ success: true, message: 'Código enviado para ' + user.email });
    else res.status(500).json({ error: 'Erro ao enviar email' });
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Dados inválidos' });

    const tokenData = resetTokens.get(email);
    if (!tokenData || tokenData.code !== code || Date.now() > tokenData.expires) {
        return res.status(401).json({ error: 'Código inválido ou expirado. Entre em contato com o admin.' });
    }

    const usersData = await readJSON(USERS_FILE);
    const userIndex = usersData.users.findIndex(u => u.email === email);
    if (userIndex === -1) return res.status(404).json({ error: 'Usuário não encontrado' });

    usersData.users[userIndex].password = await bcrypt.hash(newPassword, 10);
    await writeJSON(USERS_FILE, usersData);
    resetTokens.delete(email);

    await sendEmail(
        email,
        "Senha redefinida ✅",
        "Sua senha foi redefinida com sucesso com o código de segurança.",
        "<p>Prezado(a) <strong>" + usersData.users[userIndex].name + "</strong>,</p><p>Sua senha foi redefinida com sucesso.</p>"
    );

    res.json({ success: true });
});

// Editar Perfil próprio
app.put('/api/auth/profile', requireAuth, async (req, res) => {
    const { email, newPassword } = req.body;
    const usersData = await readJSON(USERS_FILE);
    const userIndex = usersData.users.findIndex(u => u.username === req.user.username);
    
    if (email) usersData.users[userIndex].email = email;
    if (newPassword && newPassword.length >= 6) {
        usersData.users[userIndex].password = await bcrypt.hash(newPassword, 10);
    }
    
    await writeJSON(USERS_FILE, usersData);
    res.json({ success: true });
});

// Admin editar qualquer usuário
app.get('/api/users', requireAuth, async (req, res) => {
    if (req.user.username !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
    const usersData = await readJSON(USERS_FILE);
    const usersSafe = usersData.users.map(u => ({ id: u.id, username: u.username, name: u.name, email: u.email }));
    res.json(usersSafe);
});

app.put('/api/users/:username', requireAuth, async (req, res) => {
    if (req.user.username !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
    const { email, newPassword } = req.body;
    const usersData = await readJSON(USERS_FILE);
    const userIndex = usersData.users.findIndex(u => u.username === req.params.username);
    
    if (userIndex === -1) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    if (email) usersData.users[userIndex].email = email;
    if (newPassword && newPassword.length >= 6) {
        usersData.users[userIndex].password = await bcrypt.hash(newPassword, 10);
    }
    
    await writeJSON(USERS_FILE, usersData);
    res.json({ success: true });
});

// Endpoint para Upload de Imagem (Protegido)
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Retorna a URL pública da imagem
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
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
// ROTAS - Blog Posts (Markdown based)
// ============================================

// Helper para ler todos os posts
async function getAllPosts() {
    try {
        const files = await fs.readdir(POSTS_DIR);
        const posts = await Promise.all(
            files
                .filter(file => file.endsWith('.md'))
                .map(async file => {
                    const content = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
                    const parsed = matter(content);
                    return {
                        ...parsed.data,
                        content: parsed.content,
                        slug: file.replace('.md', '')
                    };
                })
        );
        // Sort by date desc
        return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('Erro ao ler posts:', error);
        return [];
    }
}

// Listar todos os posts
app.get('/api/blog', async (req, res) => {
    const posts = await getAllPosts();
    res.json({ posts });
});

// Obter post por slug (antigo ID agora é slug na URL, mas mantemos compatibilidade de rota)
// Nota: O frontend pede por slug na query string ou ID na rota. 
// Vamos padronizar: se vier ID e não achar, tenta achar pelo slug se o ID parecer um slug.
app.get('/api/blog/:id', async (req, res) => {
    const posts = await getAllPosts();
    const post = posts.find(p => p.id === req.params.id || p.slug === req.params.id);

    if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
    }

    res.json(post);
});

// Criar novo post (protegido)
app.post('/api/blog', requireAuth, async (req, res) => {
    const { title, slug, content, ...otherData } = req.body;

    // Gera slug se não vier
    const finalSlug = slug || title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const newPost = {
        id: String(Date.now()),
        title,
        slug: finalSlug,
        ...otherData,
        author: req.user ? req.user.name : 'Admin',
        author_username: req.user ? req.user.username : 'admin',
        date: req.body.date || new Date().toISOString().split('T')[0]
    };

    try {
        // Garante que o diretório exista antes de salvar
        await fs.mkdir(POSTS_DIR, { recursive: true });

        const fileContent = matter.stringify(content || '', newPost);

        await fs.writeFile(path.join(POSTS_DIR, `${finalSlug}.md`), fileContent);
        console.log(`✅ Post criado: ${finalSlug}`);

        // Sincroniza com GitHub
        gitSync(`cms(blog): adicionar post "${title}"`);

        res.json({ success: true, post: { ...newPost, content } });
    } catch (error) {
        console.error('❌ Erro ao salvar post:', error);
        res.status(500).json({ error: 'Erro ao salvar post', details: error.message });
    }
});

// Atualizar post (protegido)
app.put('/api/blog/:id', requireAuth, async (req, res) => {
    // O ID recebido na URL pode ser o ID numérico ou o slug antigo
    // Para edição, precisamos identificar qual arquivo alterar.

    const posts = await getAllPosts();
    const existingPost = posts.find(p => p.id === req.params.id || p.slug === req.params.id);

    if (!existingPost) {
        return res.status(404).json({ error: 'Post não encontrado' });
    }

    // Se o slug mudar, precisaremos renomear o arquivo, mas por segurança vamos manter o arquivo original
    // e apenas atualizar o conteúdo por enquanto, ou assumir que o slug é imutável na edição simples.
    // O CMS geralmente manda o objeto completo.

    const content = req.body.content;
    const { content: _, ...updateData } = req.body;

    const updatedPost = {
        ...existingPost,
        ...updateData
    };

    try {
        // Garante que o diretório exista antes de salvar
        await fs.mkdir(POSTS_DIR, { recursive: true });

        const fileContent = matter.stringify(content || '', updatedPost);
        // Usa o slug original para garantir que subscreve o arquivo certo
        await fs.writeFile(path.join(POSTS_DIR, `${existingPost.slug}.md`), fileContent);

        console.log(`✅ Post atualizado: ${existingPost.slug}`);

        // Sincroniza com GitHub
        gitSync(`cms(blog): atualizar post "${updatedPost.title}"`);

        res.json({ success: true, post: { ...updatedPost, content } });
    } catch (error) {
        console.error('❌ Erro ao atualizar post:', error);
        res.status(500).json({ error: 'Erro ao atualizar post', details: error.message });
    }
});

// Deletar post (protegido)
app.delete('/api/blog/:id', requireAuth, async (req, res) => {
    const posts = await getAllPosts();
    const post = posts.find(p => p.id === req.params.id || p.slug === req.params.id);

    if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
    }

    try {
        await fs.unlink(path.join(POSTS_DIR, `${post.slug}.md`));

        // Sincroniza com GitHub
        gitSync(`cms(blog): remover post "${post.title}"`);

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar post:', error);
        res.status(500).json({ error: 'Erro ao deletar post' });
    }
});

// Deletar posts em lote (protegido)
app.post('/api/blog/batch-delete', requireAuth, async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Nenhum ID fornecido' });
    }

    try {
        const posts = await getAllPosts();
        let deletedCount = 0;

        for (const id of ids) {
            const post = posts.find(p => p.id === id || p.slug === id);
            if (post) {
                await fs.unlink(path.join(POSTS_DIR, `${post.slug}.md`));
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            gitSync(`cms(blog): remover ${deletedCount} posts em lote`);
        }

        res.json({ success: true, deletedCount });
    } catch (error) {
        console.error('Erro no delete em lote de posts:', error);
        res.status(500).json({ error: 'Erro ao deletar posts' });
    }
});

// ============================================
// ROTAS - Projetos (Markdown based)
// ============================================

// Helper para ler todos os projetos
async function getAllProjects() {
    try {
        const files = await fs.readdir(PROJECTS_DIR);
        const projects = await Promise.all(
            files
                .filter(file => file.endsWith('.md'))
                .map(async file => {
                    const content = await fs.readFile(path.join(PROJECTS_DIR, file), 'utf8');
                    const parsed = matter(content);
                    return {
                        ...parsed.data,
                        fullDescription: parsed.content,
                        slug: file.replace('.md', '')
                    };
                })
        );
        // Sort by date desc (if it exists, otherwise ignore)
        return projects.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    } catch (error) {
        console.error('Erro ao ler projetos:', error);
        return [];
    }
}

// Listar todos os projetos
app.get('/api/projects', async (req, res) => {
    const projects = await getAllProjects();
    res.json({ projects });
});

// Obter projeto por ID
app.get('/api/projects/:id', async (req, res) => {
    const projects = await getAllProjects();
    const project = projects.find(p => p.id === req.params.id || p.slug === req.params.id);

    if (!project) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json(project);
});

// Criar novo projeto (protegido)
app.post('/api/projects', requireAuth, async (req, res) => {
    const { title, slug, fullDescription, ...otherData } = req.body;

    const finalSlug = slug || title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const projects = await getAllProjects();

    const newProject = {
        id: String(Date.now()),
        title,
        slug: finalSlug,
        ...otherData,
        author: req.user ? req.user.name : 'Admin',
        author_username: req.user ? req.user.username : 'admin',
        number: '0' + (projects.length + 1)
    };

    try {
        await fs.mkdir(PROJECTS_DIR, { recursive: true });
        const fileContent = matter.stringify(fullDescription || '', newProject);
        await fs.writeFile(path.join(PROJECTS_DIR, `${finalSlug}.md`), fileContent);
        
        console.log(`✅ Projeto criado: ${finalSlug}`);
        gitSync(`cms(projects): adicionar projeto "${title}"`);

        res.json({ success: true, project: { ...newProject, fullDescription } });
    } catch (error) {
        console.error('❌ Erro ao salvar projeto:', error);
        res.status(500).json({ error: 'Erro ao salvar projeto', details: error.message });
    }
});

// Atualizar projeto (protegido)
app.put('/api/projects/:id', requireAuth, async (req, res) => {
    const projects = await getAllProjects();
    const existingProject = projects.find(p => p.id === req.params.id || p.slug === req.params.id);

    if (!existingProject) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    const fullDescription = req.body.fullDescription;
    const { fullDescription: _, ...updateData } = req.body;

    const updatedProject = {
        ...existingProject,
        ...updateData
    };

    try {
        await fs.mkdir(PROJECTS_DIR, { recursive: true });
        const fileContent = matter.stringify(fullDescription || '', updatedProject);
        await fs.writeFile(path.join(PROJECTS_DIR, `${existingProject.slug}.md`), fileContent);

        console.log(`✅ Projeto atualizado: ${existingProject.slug}`);
        gitSync(`cms(projects): atualizar projeto "${updatedProject.title}"`);

        res.json({ success: true, project: { ...updatedProject, fullDescription } });
    } catch (error) {
        console.error('❌ Erro ao atualizar projeto:', error);
        res.status(500).json({ error: 'Erro ao atualizar projeto', details: error.message });
    }
});

// Deletar projeto (protegido)
app.delete('/api/projects/:id', requireAuth, async (req, res) => {
    const projects = await getAllProjects();
    const project = projects.find(p => p.id === req.params.id || p.slug === req.params.id);

    if (!project) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    try {
        await fs.unlink(path.join(PROJECTS_DIR, `${project.slug}.md`));
        const projectName = project ? project.title : req.params.id;
        gitSync(`cms(projects): remover projeto "${projectName}"`);

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar projeto:', error);
        res.status(500).json({ error: 'Erro ao deletar projeto' });
    }
});

// Deletar projetos em lote (protegido)
app.post('/api/projects/batch-delete', requireAuth, async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Nenhum ID fornecido' });
    }

    try {
        const projects = await getAllProjects();
        let deletedCount = 0;

        for (const id of ids) {
            const project = projects.find(p => p.id === id || p.slug === id);
            if (project) {
                await fs.unlink(path.join(PROJECTS_DIR, `${project.slug}.md`));
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            gitSync(`cms(projects): remover ${deletedCount} projetos em lote`);
        }

        res.json({ success: true, deletedCount });
    } catch (error) {
        console.error('Erro no delete em lote de projetos:', error);
        res.status(500).json({ error: 'Erro ao deletar projetos' });
    }
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


// Servir arquivos estáticos (CMS e Frontend)
app.use(express.static(path.join(__dirname)));

// Middleware de tratamento de erro global (deve ser o último)
app.use((err, req, res, next) => {
    console.error(`❌ Erro detectado: ${err.message}`);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
    });
});

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
