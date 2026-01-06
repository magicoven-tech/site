# 🚀 Magic Oven - Estúdio Digital Experimental

Estúdio digital focado em experiências interativas de alta performance, unindo design brutalista moderno e tecnologia WebGL.

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

## 🎨 Design & Tecnologia

### Bruralismo Digital
O site utiliza uma estética inspirada no brutalismo moderno e cyberpunk, com foco em tipografia forte e interatividade crua.

**Core Stack:**
- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+)
- **Gráficos**: [Three.js](https://threejs.org/) para o fundo interativo.
- **Efeitos**: Bayer Dithering (Ordered Dithering) e Glitch dinâmico.
- **Backend**: Node.js + Express para o CMS integrado.

**Cores:**
- **Background**: `#080808`
- **Accent (Green)**: `#27FF2B` (Logo e interações especiais)
- **Dithering**: `#a0a0a0` (Camada visual de textura)

---

## ✨ Funcionalidades em Destaque

### 1. Hero Background Interativo
Implementado com Three.js e Shaders customizados:
- **Bayer Dithering**: Técnica de dithering ordenado para textura retrô-digital.
- **Rastro Generativo**: O mouse deixa um caminho de partículas que desvanecem organicamente.
- **Impact Ripples**: Cliques no fundo geram ondas de choque que alteram a densidade do dithering.
- **Transição Fluida**: O fundo se funde suavemente com a seção de projetos através de um efeito de *bleed* e gradientes de máscara.

### 2. Glitch System
Efeito de glitch procedimental aplicado ao logotipo e textos de destaque, simulando instabilidade digital.

---

## � CMS & Gerenciamento

O projeto possui um CMS (Content Management System) leve e customizado para gerenciar o blog e o portfólio.

### Acesso ao Painel
```
URL: http://localhost:3000/admin/login.html
Usuário: admin
Senha: admin123
```

---

## � Referências & Créditos

- **Favicon**: Gerado via [favicon.io](https://favicon.io/favicon-converter/).
- **Bayer Dithering Concept**: Inspirado no tutorial da [Codrops (Tympanus)](https://tympanus.net/Tutorials/BayerDithering/).
- **Visual Inspiration**: Inspirado na estética experimental do estúdio `ejtech.studio`.

---

## �️ Estrutura do Projeto

```
site/
├── server.js              # Servidor Node.js
├── data/                  # Armazenamento JSON (Blog/Projetos)
├── assets/                # Imagens, SVGs e Favicons
├── css/
│   └── main.css          # Design System e Layout
├── js/
│   ├── hero-background.js # Engine Three.js + Shaders
│   ├── glitch-text.js     # Lógica do efeito de glitch
│   ├── cms.js             # Consumo dinâmico de dados
│   └── main.js            # Interações globais
└── admin/                 # Interface do CMS
```

---

**Magic Oven** - Estúdio Digital Experimental  
Feito com magia e código ✨