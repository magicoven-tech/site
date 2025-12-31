# 🚀 Magic Oven CMS - Backend Setup

## Quick Start

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar o Servidor

```bash
npm start
```

O servidor irá rodar em: **http://localhost:3000**

## 🔐 Acesso ao CMS

### Credenciais Padrão

- **URL**: http://localhost:3000/admin/login.html
- **Usuário**: `admin`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Altere a senha padrão em produção!

## 📁 Estrutura do Backend

```
site/
├── server.js              # Servidor Express com API REST
├── package.json           # Dependências do projeto
├── data/
│   ├── blog.json         # Posts do blog (persistido)
│   ├── projects.json     # Projetos (persistido)
│   └── users.json        # Usuários (criado automaticamente)
├── admin/
│   ├── index.html        # Painel admin (requer login)
│   └── login.html        # Página de login
└── js/
    ├── cms.js            # Frontend - carregamento de dados
    └── cms-admin.js      # Frontend - administração
```

## 🎯 Funcionalidades

### ✅ Backend
- API REST completa (CRUD)
- Autenticação com sessões
- Persistência em JSON
- Proteção de rotas administrativas
- Servidor de arquivos estáticos

### ✅ Frontend
- Painel admin moderno
- Login/Logout
- Criar, editar, deletar posts e projetos
- Alternar publicação com um clique
- Sistema de destaques
- Interface responsiva

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Verificar autenticação

### Blog Posts
- `GET /api/blog` - Listar todos os posts
- `GET /api/blog/:id` - Obter post específico
- `POST /api/blog` - Criar novo post (protegido)
- `PUT /api/blog/:id` - Atualizar post (protegido)
- `DELETE /api/blog/:id` - Deletar post (protegido)

### Projetos
- `GET /api/projects` - Listar todos os projetos
- `GET /api/projects/:id` - Obter projeto específico
- `POST /api/projects` - Criar novo projeto (protegido)
- `PUT /api/projects/:id` - Atualizar projeto (protegido)
- `DELETE /api/projects/:id` - Deletar projeto (protegido)

## 🛠️ Como Usar

### 1. Acessar o Painel Admin

```
http://localhost:3000/admin/login.html
```

### 2. Fazer Login

Use as credenciais padrão (admin / admin123)

### 3. Criar Novo Post

1. Clique em "+ NOVO ITEM"
2. Preencha o formulário
3. Marque "Post em destaque" se necessário
4. Clique em "Salvar Post"

### 4. Editar Post Existente

1. Clique no ícone ✏️ ao lado do post
2. Modifique os campos
3. Clique em "Salvar Post"

### 5. Alternar Publicação

Clique no ícone 👁️ para alternar entre publicado/rascunho

### 6. Deletar Post

Clique no ícone 🗑️ e confirme a exclusão

## 🔒 Segurança

### Em Desenvolvimento

- Sessões configuradas com `secure: false`
- Secret key padrão
- Senha admin padrão

### Em Produção (Recomendações)

1. **Alterar Secret Key**:
   ```javascript
   // Em server.js, linha 24
   secret: process.env.SESSION_SECRET || 'sua-chave-secreta-forte'
   ```

2. **Alterar Senha Admin**:
   ```bash
   # Deletar data/users.json e rodar novamente
   # Ou alterar manualmente o hash no arquivo
   ```

3. **Habilitar HTTPS**:
   ```javascript
   // Em server.js, linha 27
   secure: true
   ```

4. **Variáveis de Ambiente**:
   ```bash
   # Criar arquivo .env
   PORT=3000
   SESSION_SECRET=sua-chave-muito-secreta
   NODE_ENV=production
   ```

## 📝 Exemplo de Uso da API

### Criar um Post (JavaScript)

```javascript
const response = await fetch('/api/blog', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        title: 'Meu Novo Post',
        category: 'DESIGN',
        excerpt: 'Resumo do post...',
        content: '<p>Conteúdo HTML...</p>',
        tags: ['design', 'web'],
        featured: true,
        published: true
    })
});

const data = await response.json();
console.log(data);
```

## 🐛 Troubleshooting

### Servidor não inicia

```bash
# Verificar se a porta 3000 está livre
lsof -ti:3000

# Matar processo se necessário
kill -9 $(lsof -ti:3000)

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Dados não estão sendo salvos

- Verificar se o servidor está rodando
- Verificar permissões da pasta `data/`
- Verificar console do navegador para erros

### Não consegue fazer login

- Verificar se `data/users.json` foi criado
- Deletar `data/users.json` e reiniciar servidor
- Verificar credenciais (admin / admin123)

## 🚀 Deploy

### Opções de Hosting

1. **Heroku**
2. **Railway**
3. **Render**
4. **DigitalOcean**
5. **AWS/Google Cloud/Azure**

### Preparar para Deploy

1. Adicionar `.gitignore`:
   ```
   node_modules/
   .env
   ```

2. Criar `Procfile` (Heroku):
   ```
   web: node server.js
   ```

3. Definir variáveis de ambiente no hosting

---

**Magic Oven CMS Backend**  
Versão: 1.0.0
