# 🚀 Magic Oven - Site & CMS

Estúdio digital experimental com sistema de gerenciamento de conteúdo integrado.

## ⚡ Quick Start

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar o Servidor

```bash
npm start
```

O site estará disponível em: **http://localhost:3000**

---

## 🔐 Acessar o CMS

### Login no Painel Administrativo

```
URL: http://localhost:3000/admin/login.html

Usuário: admin
Senha: admin123
```

⚠️ **Altere a senha padrão em produção!**

---

## � Estrutura do Projeto

```
site/
├── server.js              # Backend Node.js + Express
├── package.json           # Dependências
│
├── index.html            # Página inicial
├── blog.html              # Blog (carrega posts do CMS)
├── portfolio.html         # Portfolio (carrega projetos do CMS)
│
├── admin/                 # Painel Administrativo
│   ├── index.html        # Dashboard (requer login)
│   └── login.html        # Página de login
│
├── css/
│   └── main.css          # Estilos principais
│
├── js/
│   ├── main.js           # JavaScript principal
│   ├── cms.js            # Sistema CMS (frontend)
│   └── cms-admin.js      # Admin CMS (frontend)
│
├── data/                  # Dados persistidos (JSON)
│   ├── blog.json         # Posts do blog
│   ├── projects.json     # Projetos/trabalhos
│   └── users.json        # Usuários (gerado automaticamente)
│
└── docs/                  # Documentação
    ├── backend-setup.md  # Guia do backend
    ├── cms-guide.md      # Guia do CMS
    └── color-palette.md  # Paleta de cores
```

---

## 🎨 Design System

**Cores Principais:**
- **Preto**: `#080808`
- **Verde Neon**: `#27FF2B`

**Fontes:**
- Primary: Space Grotesk
- Mono: JetBrains Mono

**Estética**: Cyberpunk Modern com efeito vinheta verde

---

## 📝 Gerenciar Conteúdo

### Via Painel Admin (Recomendado)

1. Acesse http://localhost:3000/admin/login.html
2. Faça login com as credenciais
3. Crie, edite ou delete posts e projetos
4. Alterações são salvas automaticamente

### Via Arquivos JSON (Manual)

Edite diretamente:
- **Blog**: `/data/blog.json`
- **Projetos**: `/data/projects.json`

---

## 🛠️ Funcionalidades do CMS

### ✅ Blog
- Criar, editar e deletar posts
- Sistema de categorias
- Tags
- Posts em destaque
- Publicar/Rascunho
- Editor HTML

### ✅ Projetos/Portfolio
- Criar, editar e deletar projetos
- Categorização
- Gradientes customizáveis
- Projetos em destaque
- Publicar/Rascunho
- Links externos

### ✅ Autenticação
- Login/Logout
- Sessões seguras
- Proteção de rotas administrativas

---

## 📡 API REST

O backend fornece uma API REST completa:

### Endpoints Públicos
- `GET /api/blog` - Lista posts publicados
- `GET /api/projects` - Lista projetos publicados

### Endpoints Protegidos (requer login)
- `POST /api/blog` - Criar post
- `PUT /api/blog/:id` - Atualizar post
- `DELETE /api/blog/:id` - Deletar post
- `POST /api/projects` - Criar projeto
- `PUT /api/projects/:id` - Atualizar projeto
- `DELETE /api/projects/:id` - Deletar projeto

**Documentação completa**: `/docs/backend-setup.md`

---

## 📚 Documentação

- **Backend Setup**: `/docs/backend-setup.md`
- **Guia do CMS**: `/docs/cms-guide.md`
- **Paleta de Cores**: `/docs/color-palette.md`

---

## 🚀 Deploy em Produção

### Preparação

1. **Alterar credenciais padrão**
2. **Configurar variáveis de ambiente**:
   ```bash
   PORT=3000
   SESSION_SECRET=sua-chave-secreta
   NODE_ENV=production
   ```
3. **Habilitar HTTPS** (secure: true)
4. **Configurar banco de dados** (opcional, substituir JSON)

### Plataformas Recomendadas

- **Heroku**: Fácil deploy com Git
- **Railway**: Moderno e simples
- **Render**: Free tier generoso
- **Vercel**: Para frontend + Serverless
- **DigitalOcean**: VPS tradicional

---

## 🐛 Troubleshooting

### Servidor não inicia
```bash
# Verificar porta
lsof -ti:3000

# Reinstalar dependências
rm -rf node_modules
npm install
```

### Não consegue fazer login
```bash
# Deletar arquivo de usuários e reiniciar
rm data/users.json
npm start
```

### Dados não são salvos
- Verificar que o servidor backend está rodando
- Verificar permissões da pasta `data/`
- Verificar console do navegador (F12)

---

## 🔧 Desenvolvimento

### Estrutura de Dados

#### Blog Post
```json
{
  "id": "1",
  "title": "Título",
  "slug": "titulo",
  "category": "DESIGN",
  "date": "2025-12-31",
  "excerpt": "Resumo...",
  "content": "<p>HTML...</p>",
  "author": "Magic Oven",
  "tags": ["design", "web"],
  "featured": true,
  "published": true
}
```

#### Projeto
```json
{
  "id": "1",
  "title": "PROJETO",
  "slug": "projeto",
  "category": "Web Design",
  "description": "Descrição...",
  "imageGradient": "linear-gradient(...)",
  "year": "2025",
  "featured": true,
  "published": true
}
```

---

## 📄 Licença

© 2025 Magic Oven. Todos os direitos reservados.

---

## 🆘 Suporte

Para questões e suporte:
- **Email**: contato@magicoven.tech
- **Documentação**: `/docs/`

---

**Magic Oven** - Estúdio Digital Experimental  
Feito com magia e código ✨