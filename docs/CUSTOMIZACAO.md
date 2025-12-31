# 📝 Guia Rápido de Customização

Este guia vai te ajudar a personalizar o portfolio rapidamente!

## 🎨 1. Trocar as Cores do Site

Abra o arquivo `css/main.css` e procure por `:root` no início do arquivo. Lá você encontrará todas as cores:

```css
:root {
    /* Cores de fundo */
    --color-background: #0a0a0a;        /* Fundo principal (preto) */
    --color-surface: #141414;           /* Seções alternadas */
    --color-surface-elevated: #1e1e1e;  /* Cards e elementos elevados */
    
    /* Cores de texto */
    --color-text-primary: #ffffff;      /* Texto principal (branco) */
    --color-text-secondary: #a0a0a0;    /* Texto secundário (cinza claro) */
    --color-text-tertiary: #666666;     /* Texto terciário (cinza escuro) */
    
    /* Cores de destaque */
    --color-accent-primary: #ff6b6b;    /* Rosa/Vermelho */
    --color-accent-secondary: #4ecdc4;  /* Azul/Verde */
    --color-accent-tertiary: #ffe66d;   /* Amarelo */
    
    /* Gradientes - TROQUE AQUI para mudar as cores principais */
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --gradient-accent: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
```

### Exemplos de Paletas Alternativas:

**Paleta Cyberpunk:**
```css
--gradient-primary: linear-gradient(135deg, #ff0080 0%, #7928ca 100%);
--gradient-secondary: linear-gradient(135deg, #00d4ff 0%, #0077ff 100%);
--color-accent-primary: #ff0080;
--color-accent-secondary: #00d4ff;
```

**Paleta Natureza:**
```css
--gradient-primary: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
--gradient-secondary: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
--color-accent-primary: #38ef7d;
--color-accent-secondary: #11998e;
```

**Paleta Sunset:**
```css
--gradient-primary: linear-gradient(135deg, #fa8bff 0%, #2bd2ff 90%, #2bff88 100%);
--gradient-secondary: linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%);
--color-accent-primary: #ff6e7f;
--color-accent-secondary: #2bd2ff;
```

## 🖼️ 2. Adicionar Imagens aos Projetos

### Passo 1: Organize suas imagens
Crie uma pasta para as imagens dos projetos:
```
assets/
  projetos/
    projeto1.jpg
    projeto2.jpg
    projeto3.jpg
```

### Passo 2: Substitua os placeholders
No arquivo `index.html` ou `portfolio.html`, encontre:

```html
<!-- ANTES (placeholder) -->
<div class="project-image">
    <div class="project-image-placeholder" style="background: linear-gradient(...);">
        <span class="project-number">01</span>
    </div>
</div>

<!-- DEPOIS (com imagem real) -->
<div class="project-image">
    <img src="assets/projetos/projeto1.jpg" alt="Nome do Projeto">
</div>
```

### Dica: Tamanho ideal das imagens
- **Proporção**: 16:10 (ex: 1600x1000px)
- **Formato**: JPG (fotos) ou PNG (gráficos com transparência)
- **Peso**: Máximo 500KB por imagem (use [TinyPNG](https://tinypng.com) para comprimir)

## ✍️ 3. Adicionar um Novo Projeto

Copie e cole este código dentro da `<div class="projects-grid">`:

```html
<article class="project-card" data-aos="fade-up">
    <div class="project-image">
        <img src="assets/projetos/seu-projeto.jpg" alt="Nome do Projeto">
    </div>
    <div class="project-info">
        <h3 class="project-title">NOME DO PROJETO</h3>
        <p class="project-category">Web Design • Desenvolvimento • Branding</p>
        <p class="project-description">
            Uma breve descrição do projeto. Explique o desafio, a solução 
            e o resultado alcançado. Máximo 2-3 linhas.
        </p>
        <a href="#" class="project-link">VER PROJETO →</a>
    </div>
</article>
```

## 📝 4. Adicionar um Artigo no Blog

No arquivo `blog.html`, adicione dentro da `<div class="blog-grid">`:

```html
<article class="blog-card" data-aos="fade-up">
    <div class="blog-meta">
        <span class="blog-date">31 DEZ 2025</span>
        <span class="blog-category">DESIGN</span>
    </div>
    <h3 class="blog-title">Título do Seu Artigo</h3>
    <p class="blog-excerpt">
        Um resumo do artigo que vai despertar a curiosidade do leitor. 
        Mantenha em 2-3 linhas para não quebrar o layout.
    </p>
    <a href="#" class="blog-link">LER MAIS →</a>
</article>
```

**Categorias sugeridas:** DESIGN, CÓDIGO, ARTE, UX, WORKFLOW, INSPIRAÇÃO, TUTORIAL

## 👥 5. Atualizar a Página Sobre

### Trocar o texto da história
No arquivo `sobre.html`, encontre a seção `.about-story` e edite:

```html
<div class="about-story" data-aos="fade-up">
    <p>
        Sua história aqui. Como o Magic Oven começou?
    </p>
    <p>
        O que vocês fazem de especial? Qual sua missão?
    </p>
    <p>
        Visão para o futuro...
    </p>
</div>
```

### Atualizar perfis da equipe
```html
<div class="team-member" data-aos="fade-up">
    <div class="team-member-photo">
        <img src="assets/bruno.png" alt="Bruno">
    </div>
    <h3 class="team-member-name">SEU NOME</h3>
    <p class="team-member-role">SEU CARGO</p>
    <p class="team-member-bio">
        Uma bio curta sobre você, suas habilidades e paixões.
    </p>
</div>
```

## 📧 6. Configurar o Formulário de Contato

O formulário atual é apenas visual. Para fazê-lo funcionar de verdade, você tem 3 opções:

### Opção 1: Formspree (Mais Fácil - Grátis)
1. Visite [formspree.io](https://formspree.io)
2. Crie uma conta gratuita
3. Crie um novo formulário
4. Copie o endpoint fornecido
5. No arquivo `contato.html`, altere:

```html
<!-- Adicione o action do Formspree -->
<form id="contactForm" action="https://formspree.io/f/SEU_ID_AQUI" method="POST">
```

### Opção 2: EmailJS (Gratuito até 200 emails/mês)
1. Visite [emailjs.com](https://emailjs.com)
2. Configure seu serviço de email
3. Adicione o script no `<head>` do `contato.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script>
    emailjs.init("SEU_PUBLIC_KEY");
</script>
```

Depois modifique o `js/main.js` para usar EmailJS.

### Opção 3: Google Forms (Mais Simples)
1. Crie um Google Form
2. Adicione um link para ele no botão de contato

## 🌟 7. Adicionar Animações Extras

Para adicionar animação de entrada a qualquer elemento, basta adicionar `data-aos`:

```html
<!-- Fade up (padrão) -->
<div data-aos="fade-up">Conteúdo</div>

<!-- Com delay -->
<div data-aos="fade-up" data-aos-delay="100">Conteúdo</div>
<div data-aos="fade-up" data-aos-delay="200">Conteúdo</div>
<div data-aos="fade-up" data-aos-delay="300">Conteúdo</div>
```

## 🔧 8. Customizar Fontes

### Escolher outras fontes do Google Fonts

1. Visite [fonts.google.com](https://fonts.google.com)
2. Escolha suas fontes
3. Substitua o link no `<head>` de todos os arquivos HTML:

```html
<!-- Exemplo com outras fontes -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Fira+Code:wght@400;700&display=swap" rel="stylesheet">
```

4. Atualize as variáveis no `css/main.css`:

```css
:root {
    --font-primary: 'Poppins', sans-serif;
    --font-mono: 'Fira Code', monospace;
}
```

## 📱 9. Testar em Mobile

### No computador:
1. Abra o site no Chrome
2. Pressione `F12` (DevTools)
3. Clique no ícone de celular (Toggle Device Toolbar)
4. Selecione diferentes dispositivos

### No celular de verdade:
1. Conecte ao mesmo Wi-Fi do computador
2. Descubra o IP do computador
3. Acesse `http://SEU_IP:8000` no celular

## 🚀 10. Deploy Rápido (5 minutos)

### Netlify Drop (Mais Rápido)
1. Visite [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arraste a pasta do site
3. Pronto! Site online

### GitHub Pages
```bash
# No terminal
git init
git add .
git commit -m "Initial commit"
gh repo create magic-oven-site --public
git push -u origin main
```

Depois vá em Settings > Pages > Source > main branch

---

## 🆘 Troubleshooting

### As fontes não aparecem
- Verifique se o link do Google Fonts está em TODOS os arquivos HTML
- Limpe o cache do navegador (Ctrl+Shift+R)

### Animações não funcionam
- Verifique se o `js/main.js` está carregando
- Veja se há erros no Console (F12)

### Menu mobile não abre
- Verifique se os IDs estão corretos: `mainNav`, `menuToggle`, `navMenu`
- Certifique-se que o JavaScript está carregando

### Cores não mudaram
- Limpe o cache (Ctrl+Shift+R)
- Verifique se editou o arquivo correto: `css/main.css`
- Salve o arquivo antes de recarregar

---

**Dica Pro:** Use o VS Code com a extensão "Live Server" para ver as mudanças em tempo real! 🔥
