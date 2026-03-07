# 🎨 Portfólio & CMS Template

Bem-vindo ao template completo de Portfólio + CMS! Este projeto foi estruturado para que você possa colocar seu portfólio no ar de forma rápida, com um visual moderno e um painel administrativo customizado (CMS) para gerenciar seus posts e projetos sem tocar no código novamente.

---

## ✨ Funcionalidades
- **Portfólio & Blog**: Páginas limpas e responsivas prontas para exibir seu trabalho.
- **Painel Admin**: Área logada para adicionar/editar conteúdos via markdown, com suporte a upload de imagens na pasta local (via backend server) e embeds.
- **Configuração Simples**: Todas as suas redes sociais, e-mail e nome ficam centralizados num único arquivo.
- **Modo Offline/Seed**: O site funcionará com dados de "exemplo" até você configurar o banco de dados real.

---

## 🚀 Como Começar (Passo a Passo)

### 1. Configure suas Informações Pessoais
Abra o arquivo `js/config.js` na raiz do site. É aqui que toda a "mágica" acontece.
Substitua os valores dentro de `TEMPLATE_CONFIG`:

```javascript
const TEMPLATE_CONFIG = {
    site: {
        name: "SEU NOME",
        // ... outras configs ...
    },
    contact: {
        email: "seu.email@exemplo.com",
        instagramUrl: "https://instagram.com/seu.perfil",
        // ... outras configs ...
    }
}
```
*Dica: o sistema substituirá automaticamente essas informações nos arquivos HTML sem você precisar editá-los um por um.*

### 2. Rodando o Projeto Localmente
Para testar seu site no seu computador:

1. Certifique-se de ter o Node.js instalado.
2. Navegue até a pasta do projeto e instale as dependências executando:
   `npm install`
3. Inicie o servidor local (que também serve a API):
   `npm run dev` ou `node server.js`
4. Acesse `http://localhost:3000` no seu navegador!

### 3. Configuração do Painel Admin (Backend & KVDB)
O painel administrativo salva suas informações na nuvem (usando o serviço KVDB.io como banco de dados NoSQL gratuito) e faz upload de imagens para a pasta `/uploads`.

1. Acesse [kvdb.io](https://kvdb.io/) e crie um Bucket gratuito apertando em **Create Bucket**.
2. Copie o **Bucket ID** gerado (uma chave longa com letras e números).
3. Na raiz do projeto, você verá um arquivo chamado `.env` ou precisará criá-lo (basta renomear um `.env.example`).
4. Digite a seguinte configuração no seu `.env`:
   ```env
   KVDB_BUCKET=seu_bucket_id_aqui
   ADMIN_PASSWORD=sua_senha_secreta_aqui
   JWT_SECRET=escreva_qualquer_coisa_aleatoria_aqui
   ```
5. Reinicie seu servidor Node (`node server.js`).
6. Acesse `http://localhost:3000/admin/login.html` e faça o login com o e-mail (usado no passo 1) e a senha (criada no passo 4).

> **Atenção:** As imagens subidas no CMS ficarão salvas na pasta `/uploads` do backend Node.js.

---

## 🌐 Deploy (Colocando no Ar)
Como esse projeto depende de um servidor Node.js (por conta do Painel Admin e uploads), a melhor plataforma gratuita para hospedá-lo é o **Render** ou **Railway**.

### Hospedando no Render
1. Crie uma conta no [Render](https://render.com/).
2. Clique em **New** > **Web Service**.
3. Conecte seu repositório do GitHub contendo este código.
4. O Render detectará que é um projeto Node. Deixe o 'Build Command' como `npm install` e o 'Start Command' como `node server.js`.
5. Vá na aba de **Advanced / Environment Variables** e adicione suas variáveis:
   - `KVDB_BUCKET` : (seu bucket ID)
   - `ADMIN_PASSWORD` : (sua senha segura)
   - `JWT_SECRET` : (seu JWT secret)
6. Finalize o processo. Após o deploy com sucesso, o Render te dará um link como `https://meu-portfolio.onrender.com`.
7. **Último Passo:** Volte no seu código, abra o arquivo `js/config.js` e insira essa nova URL do Render em `api.baseURL`! Faça o push pro GitHub e seu site estará finalizado!

---

Feito com ☕ e Código. Você pode customizar o CSS na pasta `/css` livremente!