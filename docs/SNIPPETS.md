# 🧩 Snippets de Código Úteis

Esta é uma coleção de blocos de código prontos para copiar e colar quando vocês precisarem adicionar novos elementos ao site.

---

## 📦 PROJETOS

### Card de Projeto Completo
```html
<article class="project-card" data-aos="fade-up">
    <div class="project-image">
        <img src="assets/projetos/nome-projeto.jpg" alt="Nome do Projeto">
    </div>
    <div class="project-info">
        <h3 class="project-title">NOME DO PROJETO</h3>
        <p class="project-category">Web Design • Desenvolvimento</p>
        <p class="project-description">
            Descrição curta do projeto (2-3 linhas).
        </p>
        <a href="projeto-detalhes.html" class="project-link">VER PROJETO →</a>
    </div>
</article>
```

### Card com Gradiente (quando não tiver imagem ainda)
```html
<article class="project-card" data-aos="fade-up">
    <div class="project-image">
        <div class="project-image-placeholder" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <span class="project-number">01</span>
        </div>
    </div>
    <div class="project-info">
        <h3 class="project-title">PROJETO EM BREVE</h3>
        <p class="project-category">Categoria • Tags</p>
        <p class="project-description">
            Em desenvolvimento...
        </p>
        <a href="#" class="project-link">EM BREVE →</a>
    </div>
</article>
```

### Gradientes Prontos para usar
```css
/* Roxo → Violeta */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Rosa → Vermelho */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Azul claro */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Laranja → Amarelo */
background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);

/* Verde → Azul escuro */
background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);

/* Pastel */
background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
```

---

## 📝 BLOG

### Card de Artigo
```html
<article class="blog-card" data-aos="fade-up">
    <div class="blog-meta">
        <span class="blog-date">31 DEZ 2025</span>
        <span class="blog-category">DESIGN</span>
    </div>
    <h3 class="blog-title">Título do Artigo</h3>
    <p class="blog-excerpt">
        Resumo do artigo em 2-3 linhas para despertar curiosidade.
    </p>
    <a href="artigo-completo.html" class="blog-link">LER MAIS →</a>
</article>
```

### Categorias Sugeridas
```html
<span class="blog-category">DESIGN</span>
<span class="blog-category">CÓDIGO</span>
<span class="blog-category">ARTE</span>
<span class="blog-category">UX</span>
<span class="blog-category">WORKFLOW</span>
<span class="blog-category">INSPIRAÇÃO</span>
<span class="blog-category">TUTORIAL</span>
<span class="blog-category">OPINIÃO</span>
```

---

## 🎯 SERVIÇOS

### Card de Serviço
```html
<div class="service-item" data-aos="fade-up">
    <span class="service-icon">⚡</span>
    <h3 class="service-title">NOME DO SERVIÇO</h3>
    <p class="service-description">
        Descrição do serviço que vocês oferecem.
    </p>
</div>
```

### Emojis para Serviços
```
⚡ Desenvolvimento
🎨 Design
✨ Experiências
🚀 Consultoria
💡 Inovação
🔬 Pesquisa
📱 Mobile
💻 Web
🎯 Estratégia
🛠️ Prototipagem
```

---

## 🖼️ IMAGENS

### Imagem Simples
```html
<img src="assets/pasta/imagem.jpg" alt="Descrição da imagem">
```

### Imagem Responsiva (diferentes tamanhos)
```html
<img 
    src="assets/imagem-grande.jpg" 
    srcset="
        assets/imagem-pequena.jpg 500w,
        assets/imagem-media.jpg 1000w,
        assets/imagem-grande.jpg 1500w
    "
    sizes="(max-width: 768px) 100vw, 50vw"
    alt="Descrição"
>
```

### Background Image com CSS
```css
.elemento {
    background-image: url('../assets/imagem.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
```

---

## 🔘 BOTÕES

### Botão Primário
```html
<a href="#" class="btn btn-primary">TEXTO DO BOTÃO</a>
```

### Botão Secundário
```html
<a href="#" class="btn btn-secondary">TEXTO DO BOTÃO</a>
```

### Botão Outline
```html
<a href="#" class="btn btn-outline">TEXTO DO BOTÃO</a>
```

### Botão Grande
```html
<a href="#" class="btn btn-primary btn-large">TEXTO GRANDE</a>
```

---

## 📋 SEÇÕES

### Seção Básica com Título
```html
<section class="nome-da-secao">
    <div class="section-container">
        <h2 class="section-title">
            <span class="section-title-small">SUBTÍTULO</span>
            <span class="section-title-large">TÍTULO PRINCIPAL</span>
        </h2>
        
        <!-- Conteúdo aqui -->
        
    </div>
</section>
```

### Seção com Fundo Escuro
```html
<section style="background: var(--color-surface);">
    <div class="section-container">
        <!-- Conteúdo -->
    </div>
</section>
```

### Seção com Gradiente
```html
<section style="background: var(--gradient-primary);">
    <div class="section-container">
        <!-- Conteúdo -->
    </div>
</section>
```

---

## 📱 GRID LAYOUTS

### Grid 2 Colunas
```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
    <div>Coluna 1</div>
    <div>Coluna 2</div>
</div>
```

### Grid 3 Colunas (Responsivo)
```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-lg);">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
```

### Flexbox Centralizado
```html
<div style="display: flex; justify-content: center; align-items: center; gap: var(--spacing-md);">
    <div>Item 1</div>
    <div>Item 2</div>
</div>
```

---

## ✨ ANIMAÇÕES

### Fade Up (padrão)
```html
<div data-aos="fade-up">Conteúdo com animação</div>
```

### Com Delay (espera antes de animar)
```html
<div data-aos="fade-up" data-aos-delay="100">Anima depois</div>
<div data-aos="fade-up" data-aos-delay="200">Anima mais tarde</div>
<div data-aos="fade-up" data-aos-delay="300">Anima por último</div>
```

### Efeito de Hover (CSS)
```css
.seu-elemento {
    transition: transform var(--transition-base);
}

.seu-elemento:hover {
    transform: translateY(-8px);
}
```

---

## 🎨 TIPOGRAFIA

### Título Grande (Hero)
```html
<h1 style="font-size: clamp(3rem, 8vw, 6rem); font-weight: 700; font-style: italic; line-height: 1;">
    SEU TÍTULO IMPACTANTE
</h1>
```

### Título com Gradiente
```html
<h2 style="
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 3rem;
    font-weight: 700;
    font-style: italic;
">
    TÍTULO COLORIDO
</h2>
```

### Texto Destacado
```html
<p style="font-size: var(--font-size-lg); color: var(--color-text-secondary);">
    Texto um pouco maior que o normal.
</p>
```

---

## 📄 FORMULÁRIO

### Campo de Texto
```html
<div class="form-group">
    <label for="campo" class="form-label">Nome do Campo</label>
    <input 
        type="text" 
        id="campo" 
        name="campo" 
        class="form-input" 
        placeholder="Digite aqui..."
        required
    >
</div>
```

### Campo de Email
```html
<div class="form-group">
    <label for="email" class="form-label">Email</label>
    <input 
        type="email" 
        id="email" 
        name="email" 
        class="form-input" 
        placeholder="seu@email.com"
        required
    >
</div>
```

### Textarea
```html
<div class="form-group">
    <label for="mensagem" class="form-label">Mensagem</label>
    <textarea 
        id="mensagem" 
        name="mensagem" 
        class="form-textarea" 
        placeholder="Escreva sua mensagem..."
        required
    ></textarea>
</div>
```

---

## 🔗 LINKS E NAVEGAÇÃO

### Link Normal
```html
<a href="pagina.html">Texto do Link</a>
```

### Link Externo (abre em nova aba)
```html
<a href="https://site.com" target="_blank" rel="noopener">Site Externo</a>
```

### Link com Ícone
```html
<a href="#" style="display: flex; align-items: center; gap: 0.5rem;">
    🔗 Link com Emoji
</a>
```

### Botão que parece Link
```html
<a href="#" class="project-link">VER MAIS →</a>
```

---

## 🎯 CALL-TO-ACTION (CTA)

### CTA Section Completa
```html
<section class="cta-section">
    <div class="cta-content">
        <h2 class="cta-title">
            <span class="cta-title-line">PRIMEIRA LINHA</span>
            <span class="cta-title-line cta-title-italic">LINHA DESTACADA</span>
            <span class="cta-title-line">ÚLTIMA LINHA</span>
        </h2>
        <p class="cta-subtitle">
            Subtítulo da call to action
        </p>
        <a href="contato.html" class="btn btn-primary btn-large">BOTÃO DE AÇÃO</a>
    </div>
</section>
```

---

## 📸 GALERIA DE IMAGENS

### Grid de Imagens Simples
```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
    <img src="imagem1.jpg" alt="Imagem 1">
    <img src="imagem2.jpg" alt="Imagem 2">
    <img src="imagem3.jpg" alt="Imagem 3">
    <img src="imagem4.jpg" alt="Imagem 4">
</div>
```

---

## 🎨 CORES CUSTOMIZADAS

### Usar uma variável de cor
```html
<div style="background: var(--color-surface); color: var(--color-text-primary);">
    Conteúdo
</div>
```

### Criar nova cor temporária
```html
<div style="background: #ff6b6b; color: white; padding: 2rem;">
    Conteúdo com cor customizada
</div>
```

---

## 📱 RESPONSIVIDADE

### Esconder em Mobile
```html
<div style="display: none;">
    Escondido em mobile
</div>

@media (min-width: 768px) {
    div {
        display: block; /* Mostra em tablet/desktop */
    }
}
```

### Mostrar apenas em Mobile
```html
<div class="mobile-only">Só aparece em mobile</div>

<style>
.mobile-only {
    display: block;
}
@media (min-width: 768px) {
    .mobile-only {
        display: none;
    }
}
</style>
```

---

## 🎬 EFEITOS ESPECIAIS

### Texto com Glow
```html
<h1 style="
    text-shadow: 
        0 0 10px rgba(102, 126, 234, 0.5),
        0 0 20px rgba(102, 126, 234, 0.3);
">
    TEXTO COM BRILHO
</h1>
```

### Card com Sombra
```html
<div style="
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    padding: 2rem;
    border-radius: 16px;
">
    Card com sombra bonita
</div>
```

### Backdrop Blur (efeito vidro)
```html
<div style="
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 2rem;
    border-radius: 16px;
">
    Conteúdo com efeito de vidro
</div>
```

---

## 🛠️ UTILITÁRIOS

### Espaçamento
```html
<!-- Margem -->
<div style="margin-top: var(--spacing-lg);">Top</div>
<div style="margin-bottom: var(--spacing-xl);">Bottom</div>

<!-- Padding -->
<div style="padding: var(--spacing-md);">Padding uniforme</div>
```

### Centralizar
```html
<!-- Horizontalmente -->
<div style="text-align: center;">Texto centralizado</div>

<!-- Verticalmente e Horizontalmente -->
<div style="
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
">
    Conteúdo centralizado
</div>
```

### Limitar Largura
```html
<div style="max-width: 800px; margin: 0 auto;">
    Conteúdo com largura limitada e centralizado
</div>
```

---

## 💡 DICAS RÁPIDAS

### Como Adicionar um Emoji
Basta copiar e colar de [Emojipedia](https://emojipedia.org/):
```html
<p>🚀 Texto com emoji</p>
```

### Como Fazer Link Suave (Smooth Scroll)
```html
<a href="#secao">Ir para seção</a>

<!-- E na seção de destino -->
<section id="secao">...</section>
```

### Como Adicionar Comentário no HTML
```html
<!-- Seu comentário aqui (não aparece no site) -->
```

### Como Adicionar Comentário no CSS
```css
/* Seu comentário aqui */
```

### Como Adicionar Comentário no JavaScript
```javascript
// Comentário de uma linha

/*
Comentário
de múltiplas
linhas
*/
```

---

## 🎓 Variáveis CSS Disponíveis

Vocês podem usar essas variáveis em qualquer lugar do CSS ou inline styles:

### Cores
```css
var(--color-background)
var(--color-surface)
var(--color-text-primary)
var(--color-accent-primary)
var(--gradient-primary)
```

### Espaçamento
```css
var(--spacing-xs)   /* 8px */
var(--spacing-sm)   /* 16px */
var(--spacing-md)   /* 24px */
var(--spacing-lg)   /* 32px */
var(--spacing-xl)   /* 48px */
var(--spacing-2xl)  /* 64px */
```

### Fontes
```css
var(--font-primary)        /* Space Grotesk */
var(--font-mono)          /* JetBrains Mono */
var(--font-size-base)     /* 16px */
var(--font-size-lg)       /* 18px */
var(--font-weight-bold)   /* 700 */
```

### Border Radius
```css
var(--radius-sm)    /* 4px */
var(--radius-md)    /* 8px */
var(--radius-lg)    /* 16px */
```

---

Guarde este arquivo como referência! Sempre que precisar adicionar algo novo ao site, consulte aqui primeiro. 🚀
