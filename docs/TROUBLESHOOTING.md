# 🔍 Debug: Erro ao Salvar Post

## Possíveis Causas

### 1. **Você não está autenticado** (MAIS PROVÁVEL)

O erro que você está vendo geralmente acontece quando:
- Você não fez login
- Sua sessão expirou
- Os cookies não estão sendo enviados

### ✅ Solução:

1. **Faça logout e login novamente**:
   ```
   1. Clique em "Sair" no painel admin
   2. Acesse: http://localhost:3000/admin/login.html
   3. Faça login com: admin / admin123
   4. Tente criar o post novamente
   ```

2. **Verifique os cookies**:
   - Abra o DevTools (F12)
   - Vá em "Application" → "Cookies"
   - Verifique se há um cookie de sessão

### 2. **Problema de CORS**

Se você estiver acessando de um domínio diferente:
- Certifique-se de acessar via `http://localhost:3000`
- NÃO use `127.0.0.1` ou `file://`

### 3. **Verificar Console do Navegador**

1. Abra DevTools (F12)
2. Vá na aba "Console"
3. Veja se há algum erro vermelho
4. Compartilhe o erro comigo

### 4. **Verificar Console do Servidor**

No terminal onde está rodando `npm start`, verifique se há erros.

---

## 🧪 Teste Rápido

Abra o DevTools (F12) e rode este código no Console:

```javascript
// Teste 1: Verificar autenticação
fetch('/api/auth/check', {
    credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Auth status:', data));

// Teste 2: Tentar criar um post
fetch('/api/blog', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        title: 'Teste',
        category: 'TESTE',
        excerpt: 'Teste',
        slug: 'teste',
        tags: [],
        featured: false,
        published: false
    })
})
.then(r => r.json())
.then(data => console.log('Create post result:', data))
.catch(err => console.error('Error:', err));
```

---

## ❓ O que fazer agora?

**OPÇÃO 1 - Mais Rápida:**
1. Feche todas as abas do admin
2. Acesse http://localhost:3000/admin/login.html
3. Faça login com admin / admin123
4. Tente novamente

**OPÇÃO 2 - Debug:**
1. Abra DevTools (F12)
2. Rode os testes acima
3. Me envie os resultados

**OPÇÃO 3 - Reiniciar Servidor:**
1. Pare o servidor (Ctrl+C)
2. Inicie novamente: `npm start`
3. Faça login e teste

---

Me diga qual erro aparece no console!
