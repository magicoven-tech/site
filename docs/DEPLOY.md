# 🚀 Guia de Deploy - Magic Oven

Este guia mostra como fazer o deploy completo do site e do backend.

## 📋 Índice

1. [Deploy do Frontend (Já Feito ✅)](#frontend)
2. [Deploy do Backend (Necessário)](#backend)
3. [Configuração Final](#configuracao)

---

## 🎨 Frontend (Já Feito ✅)

Seu site já está no ar em: **https://magicoven.tech**

---

## ⚙️ Backend (CMS API)

Você precisa fazer o deploy do servidor Node.js (`server.js`) para que o CMS funcione.

### Opção 1: Railway (Recomendado - Gratuito)

#### 1. Instalar Railway CLI

```bash
npm install -g @railway/cli
```

#### 2. Fazer Login

```bash
railway login
```

#### 3. Inicializar Projeto

```bash
cd /Users/bl4k.code/Developer/site
railway init
```

Digite um nome para o projeto (ex: `magicoven-backend`)

#### 4. Fazer Deploy

```bash
railway up
```

#### 5. Configurar Variáveis de Ambiente

No painel do Railway (https://railway.app):

1. Vá em **Variables**
2. Adicione:
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = `gere-uma-chave-secreta-aqui-123456789`
   - `PORT` = `3000`

#### 6. Obter URL do Backend

Após o deploy:
1. Vá em **Settings** → **Domains**
2. Clique em **Generate Domain**
3. Anote a URL (ex: `https://magicoven-backend.up.railway.app`)

---

### Opção 2: Render (Também Gratuito)

#### 1. Acessar Render

Vá em: https://render.com

#### 2. Criar Web Service

1. Clique em **New +** → **Web Service**
2. Conecte seu repositório GitHub
3. Selecione o repositório `site`

#### 3. Configurar

- **Name:** `magicoven-backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

#### 4. Variáveis de Ambiente

Adicione:
- `NODE_ENV` = `production`
- `SESSION_SECRET` = `sua-chave-secreta-aqui`

#### 5. Deploy

Clique em **Create Web Service**

Anote a URL gerada (ex: `https://magicoven-backend.onrender.com`)

---

## 🔧 Configuração Final

### 1. Atualizar URL da API no Frontend

Edite o arquivo `js/config.js`:

```javascript
const API_CONFIG = {
    baseURL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://SUA-URL-DO-RAILWAY-OU-RENDER.app', // ← COLOQUE SUA URL AQUI
    // ...
};
```

### 2. Importar config.js em todas as páginas que usam a API

Adicione em `admin/login.html`, `admin/index.html`, etc:

```html
<script src="/js/config.js"></script>
```

**ANTES** de `cms.js` ou `cms-admin.js`

### 3. Atualizar CMS para usar a config

Os arquivos `cms.js` e `cms-admin.js` precisarão usar `apiRequest()` ao invés de `fetch()` direto.

---

## 📝 Checklist de Deploy

- [ ] Backend deployed no Railway/Render
- [ ] URL do backend anotada
- [ ] `js/config.js` atualizado com a URL
- [ ] `config.js` importado nas páginas admin
- [ ] Testado login em produção
- [ ] Testado criação de posts/projetos
- [ ] Verificado se dados persistem

---

## 🐛 Troubleshooting

### Erro: CORS

Se aparecer erro de CORS, adicione no `server.js`:

```javascript
app.use(cors({
    origin: 'https://magicoven.tech',  // Seu domínio
    credentials: true
}));
```

### Erro: Sessão não persiste

Configure cookies para production no `server.js`:

```javascript
cookie: { 
    secure: true,  // ← true em produção (HTTPS)
    httpOnly: true,
    sameSite: 'none',  // ← importante para cross-origin
    maxAge: 24 * 60 * 60 * 1000 
}
```

---

## 🎯 Próximos Passos

1. **Escolha Railway ou Render**
2. **Faça o deploy seguindo os passos acima**
3. **Me envie a URL do backend** para eu atualizar os arquivos
4. **Teste o CMS em produção**

---

## 📞 Precisa de Ajuda?

Me diga qual opção escolheu (Railway ou Render) e compartilhe a URL do backend quando tiver!
