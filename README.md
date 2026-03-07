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

## 🌐 Manutenção & Disponibilidade (Render)

Como este projeto utiliza o plano gratuito do **Render**, o servidor entra em modo de hibernação após 15 minutos de inatividade. Para garantir que o site carregue instantaneamente para os visitantes, utilizamos um serviço de "ping" externo.

### Como evitar a hibernação do site:
1. Crie uma conta gratuita em [cron-job.org](https://cron-job.org/en/).
2. No Dashboard, clique em **CREATE CRONJOB**.
3. **Title**: `Magic Oven Render Ping`
4. **URL**: `https://prj-d5ahb2je5dus73f4cdm0.onrender.com/api/health`
5. Clique na aba **ADVANCED** no topo da configuração:
   - Em **Headers**, clique em **ADD** e adicione:
     - **Key**: `User-Agent`
     - **Value**: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36`
   - Em **Timeout** (no final da página), aumente para **30 seconds** para dar tempo do servidor acordar.
6. Em **Common** (ou no agendamento principal), configure a execução para **A cada 14 minutos**.
7. Clique em **SAVE**.

Isso manterá o servidor "acordado" 24/7 sem custos adicionais.

---

## 💾 Persistência com GitHub (GitSync)

Como o Render apaga arquivos locais no plano grátis, implementamos uma rotina de sincronização automática. Toda vez que você salvar, editar ou deletar um post ou projeto no CMS, o servidor fará um `git commit` com o título da alteração e um `git push` de volta para o seu repositório.

### Como configurar para o Render salvar permanentemente:
Para que o servidor tenha permissão de gravar no seu GitHub em produção, você deve adicionar estas duas **Environment Variables** no painel do Render em *Dashboard > Seu Serviço > Settings > Env Vars*:

1. **`GITHUB_TOKEN`**: Um Token de Acesso Pessoal (PAT) gerado no seu GitHub com permissão de escrita (*Contents: Read & Write*).
2. **`GITHUB_REPO`**: O caminho do seu repositório no formato `usuario/projeto` (ex: `magicoven-tech/site`).

**Nota:** Se você estiver rodando localmente (`npm run dev`), o sistema também tentará fazer o commit/push se você tiver permissão de Git configurada na sua máquina!

---

**Magic Oven** - Estúdio Digital Experimental  
Feito com magia e código ✨