# 🧙‍♂️ Magic Oven - Portfolio Website ✨

Portfolio moderno e experimental do estúdio digital Magic Oven, criado com design brutalista inspirado em referências como ejtech.studio.

## 🎨 Características do Design

### Visual
- **Estética Brutalista Moderna**: Tipografia bold, cores vibrantes e contrastes fortes
- **Efeito Vignette**: Brilho azul nas bordas da tela (assinatura visual)
- **Dark Mode Premium**: Fundo preto com elementos neon
- **Tipografia Impactante**: Space Grotesk com estilo itálico marcante
- **Gradientes Vibrantes**: Paleta de cores moderna e dinâmica

### Páginas
1. **Início** (`index.html`) - Hero impactante, projetos em destaque, serviços e blog
2. **Trabalhos** (`portfolio.html`) - Grid de projetos com placeholders coloridos
3. **Blog** (`blog.html`) - Artigos sobre design, código e criatividade
4. **Sobre** (`sobre.html`) - História do estúdio e perfis da equipe
5. **Contato** (`contato.html`) - Formulário funcional e informações de contato

### Funcionalidades
- ✅ Navegação responsiva com menu mobile
- ✅ Animações suaves ao scroll
- ✅ Formulário de contato com validação
- ✅ Design 100% responsivo
- ✅ SEO otimizado
- ✅ Performance otimizada

## 📁 Estrutura de Arquivos

```
site/
├── index.html              # Página inicial
├── portfolio.html          # Página de trabalhos
├── blog.html              # Página de blog
├── sobre.html             # Página sobre
├── contato.html           # Página de contato
├── css/
│   └── main.css          # Estilos principais (design system completo)
├── js/
│   └── main.js           # JavaScript (navegação, animações, formulários)
└── assets/
    ├── bruno.png         # Memoji do Bruno
    ├── julia.png         # Memoji da Julia
    └── favicon/          # Ícones do site
```

## 🚀 Como Usar

### Visualizar Localmente
Basta abrir o arquivo `index.html` em qualquer navegador moderno:
```bash
open index.html
# ou
start index.html
# ou simplesmente clique duas vezes no arquivo
```

### Servir com um servidor local (recomendado)
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js (npx)
npx serve .

# Usando PHP
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

## ✏️ Como Personalizar

### 1. Adicionar Projetos Reais
Edite os cards de projeto em `index.html` e `portfolio.html`:
```html
<article class="project-card" data-aos="fade-up">
    <div class="project-image">
        <!-- Substitua o placeholder por uma imagem real -->
        <img src="assets/projetos/seu-projeto.jpg" alt="Seu Projeto">
    </div>
    <div class="project-info">
        <h3 class="project-title">NOME DO SEU PROJETO</h3>
        <p class="project-category">Categoria • Tags</p>
        <p class="project-description">
            Descrição do projeto...
        </p>
        <a href="projeto-detalhes.html" class="project-link">VER PROJETO →</a>
    </div>
</article>
```

### 2. Adicionar Artigos do Blog
Edite `blog.html` e adicione novos cards:
```html
<article class="blog-card" data-aos="fade-up">
    <div class="blog-meta">
        <span class="blog-date">31 DEZ 2025</span>
        <span class="blog-category">CATEGORIA</span>
    </div>
    <h3 class="blog-title">Título do Artigo</h3>
    <p class="blog-excerpt">
        Resumo do artigo...
    </p>
    <a href="artigo.html" class="blog-link">LER MAIS →</a>
</article>
```

### 3. Atualizar Informações de Contato
Edite `contato.html` para adicionar suas informações reais.

### 4. Personalizar Cores
No arquivo `css/main.css`, modifique as variáveis CSS:
```css
:root {
    --color-accent-primary: #ff6b6b;     /* Sua cor primária */
    --color-accent-secondary: #4ecdc4;   /* Sua cor secundária */
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 🎯 Próximos Passos

### Conteúdo
- [ ] Adicionar fotos reais dos projetos
- [ ] Escrever descrições dos projetos
- [ ] Criar posts de blog
- [ ] Atualizar bio na página Sobre

### Funcionalidades Extras (Opcionais)
- [ ] Integrar formulário de contato com backend (ex: Formspree, EmailJS)
- [ ] Adicionar Google Analytics
- [ ] Criar páginas individuais para cada projeto
- [ ] Adicionar sistema de CMS (Netlify CMS, Strapi, etc.)
- [ ] Implementar filtros na página de portfolio
- [ ] Adicionar modo claro/escuro toggle

### Deploy
- [ ] Escolher plataforma de hospedagem (Netlify, Vercel, GitHub Pages)
- [ ] Configurar domínio customizado
- [ ] Configurar SSL (HTTPS)
- [ ] Otimizar imagens para web

## 🌐 Hospedagem Gratuita

### Opção 1: Netlify (Recomendado)
1. Crie conta em [netlify.com](https://netlify.com)
2. Arraste a pasta do site para o Netlify Drop
3. Pronto! Seu site está online

### Opção 2: GitHub Pages
1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Ative GitHub Pages nas configurações
4. Acesse em `seu-usuario.github.io/site`

### Opção 3: Vercel
1. Crie conta em [vercel.com](https://vercel.com)
2. Conecte seu repositório
3. Deploy automático a cada push

## 🎨 Fontes Utilizadas

- **Space Grotesk** - Tipografia principal (Google Fonts)
- **JetBrains Mono** - Fonte monospace para código (Google Fonts)

## 📱 Compatibilidade

✅ Chrome/Edge (últimas 2 versões)
✅ Firefox (últimas 2 versões)  
✅ Safari (últimas 2 versões)
✅ Mobile (iOS Safari, Chrome Mobile)

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 moderno (Grid, Flexbox, Custom Properties)
- Vanilla JavaScript (ES6+)
- Sem dependências externas (exceto Google Fonts)

## 📄 Licença

Este projeto foi criado especialmente para o Magic Oven. Sintam-se livres para modificar como quiserem! 🚀

---

**Feito com magia e código por Magic Oven** 🧙‍♂️✨

Para dúvidas ou suporte: contato@magicoven.tech