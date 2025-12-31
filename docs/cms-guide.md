# Magic Oven CMS - Guia de Uso

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Como Acessar o CMS](#como-acessar-o-cms)
4. [Gerenciando Conteúdo](#gerenciando-conteúdo)
5. [Limitações Atuais](#limitações-atuais)
6. [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

O CMS (Content Management System) do Magic Oven é um sistema leve e funcional para gerenciar posts do blog e projetos do portfólio. Ele foi projetado para ser simples, rápido e fácil de usar.

### Características:
- ✅ Interface administrativa moderna e intuitiva
- ✅ Gerenciamento de posts do blog
- ✅ Gerenciamento de projetos/trabalhos
- ✅ Sistema de publicação/rascunho
- ✅ Posts e projetos em destaque
- ✅ Carregamento dinâmico de conteúdo
- ⚠️ **Versão Frontend-Only** (sem persistência de dados no momento)

---

## 📁 Estrutura de Arquivos

```
site/
├── admin/
│   └── index.html          # Painel administrativo
├── data/
│   ├── blog.json          # Dados dos posts do blog
│   └── projects.json      # Dados dos projetos
├── js/
│   ├── cms.js             # Sistema de carregamento de dados
│   └── cms-admin.js       # Lógica do painel admin
├── blog.html              # Página de blog (usa CMS)
└── index.html             # Home (usa CMS para destaques)
```

---

## 🔐 Como Acessar o CMS

### Acesso Local

1. **Inicie um servidor local** (necessário para carregar JSON)
   ```bash
   # Opção 1: Python
   python3 -m http.server 8000
   
   # Opção 2: Node.js (npx)
   npx http-server -p 8000
   
   # Opção 3: PHP
   php -S localhost:8000
   ```

2. **Acesse o painel admin**
   ```
   http://localhost:8000/admin/
   ```

---

## ✏️ Gerenciando Conteúdo

### Posts do Blog

#### Criar Novo Post
1. Clique no botão **"+ NOVO ITEM"** no topo da página
2. Preencha os campos:
   - **Título**: Nome do post
   - **Categoria**: DESIGN, CÓDIGO, ARTE, etc.
   - **Resumo**: Breve descrição que aparece nos cards
   - **Conteúdo**: HTML do conteúdo completo (opcional)
   - **Tags**: Palavras-chave separadas por vírgula
   - **Post em destaque**: Marque para aparecer na home
   - **Publicar**: Marque para publicar imediatamente
3. Clique em **"Salvar Post"**

#### Editar Post Existente
1. Na lista de posts, clique no ícone **✏️ (editar)**
2. Modifique os campos desejados
3. Clique em **"Salvar Post"**

#### Alternar Publicação
- Clique no ícone **👁️** para alternar entre publicado/rascunho

#### Excluir Post
- Clique no ícone **🗑️** e confirme a exclusão

### Projetos/Trabalhos

O processo é similar aos posts do blog:

1. Vá para a aba **"🎨 Projetos"**
2. Use **"+ NOVO ITEM"** para criar
3. Preencha os campos:
   - **Título**: Nome do projeto
   - **Categoria**: Ex: "Web Design • Desenvolvimento"
   - **Descrição Breve**: Resumo que aparece no card
   - **Descrição Completa**: HTML detalhado (opcional)
   - **Cliente**: Nome do cliente
   - **Ano**: Ano de conclusão
   - **Gradiente CSS**: Cor de fundo do card
   - **URL**: Link do projeto (se disponível)

---

## ⚠️ Limitações Atuais

### Versão Frontend-Only

A versão atual do CMS é **frontend-only**, o que significa:

❌ **Não persiste dados**: Alterações não são salvas permanentemente
❌ **Não tem autenticação**: Qualquer pessoa com acesso pode visualizar
❌ **Edição manual dos JSON**: Para mudanças permanentes, edite os arquivos JSON

### Como Fazer Alterações Permanentes

Para fazer mudanças que persistam, você precisa **editar manualmente** os arquivos JSON:

#### `/data/blog.json`
```json
{
  "posts": [
    {
      "id": "1",
      "title": "Título do Post",
      "slug": "titulo-do-post",
      "category": "DESIGN",
      "date": "2025-12-31",
      "excerpt": "Resumo do post...",
      "content": "<p>Conteúdo HTML...</p>",
      "author": "Magic Oven",
      "tags": ["design", "web"],
      "featured": true,
      "published": true
    }
  ]
}
```

#### `/data/projects.json`
```json
{
  "projects": [
    {
      "id": "1",
      "title": "NOME DO PROJETO",
      "slug": "nome-projeto",
      "category": "Web Design • Desenvolvimento",
      "description": "Descrição breve...",
      "imageGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "number": "01",
      "featured": true,
      "published": true
    }
  ]
}
```

---

## 🚀 Próximos Passos

Para tornar o CMS totalmente funcional, você precisará adicionar um backend. Aqui estão as opções:

### Opção 1: Backend Simples com Node.js

```bash
# Instalar dependências
npm init -y
npm install express cors body-parser

# Criar servidor API simples
# Arquivo: server.js
```

### Opção 2: CMS Headless

Integrar com serviços como:
- **Strapi** (self-hosted, open-source)
- **Sanity** (cloud, API intuitiva)
- **Contentful** (cloud, enterprise)
- **Ghost** (focado em blog)

### Opção 3: Firebase/Supabase

Usar um Backend-as-a-Service:
- **Firebase**: Firestore + Authentication
- **Supabase**: PostgreSQL + Authentication

### Exemplo: Integração com Firebase

```javascript
// Configuração Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuração
const firebaseConfig = { /* suas credenciais */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Carregar posts
async function loadBlogPosts() {
  const querySnapshot = await getDocs(collection(db, 'posts'));
  const posts = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return posts;
}
```

---

## 📝 Notas Importantes

1. **CORS**: Para funcionar localmente, você **precisa** de um servidor HTTP (não abre direto no navegador)

2. **Slugs**: São gerados automaticamente a partir do título (ex: "Meu Post" → "meu-post")

3. **Datas**: São salvas no formato ISO (YYYY-MM-DD)

4. **IDs**: São gerados usando timestamp ou manualmente definidos

5. **Gradientes**: Aceita qualquer CSS válido para `background`

---

## 🎨 Personalização

### Modificar Categorias

Edite diretamente nos formulários ou nos arquivos JSON. Categorias comuns:
- Blog: `DESIGN`, `CÓDIGO`, `ARTE`, `UX`, `WORKFLOW`, `INSPIRAÇÃO`
- Projetos: `Web Design`, `Branding`, `Arte Digital`, `3D`, etc.

### Adicionar Campos

Para adicionar novos campos, edite:
1. Estrutura JSON em `/data/`
2. Formulários em `/admin/index.html`
3. Funções de salvamento em `/js/cms-admin.js`
4. Renderização em `/js/cms.js`

---

## 🆘 Suporte

Se tiver dúvidas ou problemas:

1. Verifique o console do navegador (F12)
2. Confirme que o servidor HTTP está rodando
3. Verifique se os arquivos JSON são válidos (use JSONLint.com)
4. Confirme que os caminhos dos arquivos estão corretos

---

**Versão do CMS**: 1.0.0 (Frontend-Only)  
**Última atualização**: 31 de Dezembro de 2025
