        const loginForm = document.getElementById('loginForm');
        const changePasswordForm = document.getElementById('changePasswordForm');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        const errorMessage = document.getElementById('errorMessage');

        function showForm(formId) {
            loginForm.style.display = 'none';
            changePasswordForm.style.display = 'none';
            forgotPasswordForm.style.display = 'none';
            resetPasswordForm.style.display = 'none';
            errorMessage.classList.remove('show');
            document.getElementById(formId).style.display = 'block';
        }

        document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
            e.preventDefault();
            showForm('forgotPasswordForm');
        });

        // Verifica se já está autenticado
        checkAuth();

        async function checkAuth() {
            try {
                const response = await apiRequest('/api/auth/check');
                const data = await response.json();

                if (data.authenticated) {
                    window.location.href = '/admin/';
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
            }
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            loginForm.classList.add('loading');
            errorMessage.classList.remove('show');

            try {
                const response = await apiRequest('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok && data.success && data.token) {
                    setAuthToken(data.token);
                    
                    if (data.requiresPasswordChange) {
                        showForm('changePasswordForm');
                    } else {
                        window.location.href = '/admin/';
                    }
                } else {
                    showError(data.error || 'Credenciais inválidas');
                }
            } catch (error) {
                showError('Erro ao conectar ao servidor.');
            } finally {
                loginForm.classList.remove('loading');
            }
        });

        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                return showError('As senhas não coincidem!');
            }

            changePasswordForm.classList.add('loading');
            errorMessage.classList.remove('show');

            try {
                const response = await apiRequest('/api/auth/change-first-password', {
                    method: 'POST',
                    body: JSON.stringify({ newPassword })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    window.location.href = '/admin/';
                } else {
                    showError(data.error || 'Erro ao alterar senha');
                }
            } catch (error) {
                showError('Erro ao conectar ao servidor.');
            } finally {
                changePasswordForm.classList.remove('loading');
            }
        });

        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameOrEmail = document.getElementById('recoveryEmail').value;

            forgotPasswordForm.classList.add('loading');
            errorMessage.classList.remove('show');

            try {
                const response = await apiRequest('/api/auth/forgot-password', {
                    method: 'POST',
                    body: JSON.stringify({ usernameOrEmail })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    document.getElementById('resetCode').dataset.email = usernameOrEmail;
                    showForm('resetPasswordForm');
                    await customAlert('Código enviado!', 'Verifique seu e-mail ou o console do servidor.');
                } else {
                    showError(data.error || 'Erro ao solicitar recuperação.');
                }
            } catch (error) {
                showError('Erro ao conectar ao servidor.');
            } finally {
                forgotPasswordForm.classList.remove('loading');
            }
        });

        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = document.getElementById('resetCode').value;
            const newPassword = document.getElementById('resetNewPassword').value;
            // The API relies on the exact email, we can try using the previous input or let the user input it.
            // Better to rely on a hidden variable or let the backend do by code? Backend needs email + code.
            const recoveryEmail = document.getElementById('recoveryEmail').value;

            resetPasswordForm.classList.add('loading');
            errorMessage.classList.remove('show');

            try {
                const response = await apiRequest('/api/auth/reset-password', {
                    method: 'POST',
                    body: JSON.stringify({ email: recoveryEmail, code, newPassword })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    await customAlert('Sucesso!', 'Senha redefinida com sucesso! Faça o login agora.');
                    showForm('loginForm');
                } else {
                    showError(data.error || 'Código inválido ou expirado. Entre em contato com o admin.');
                }
            } catch (error) {
                showError('Erro ao conectar ao servidor.');
            } finally {
                resetPasswordForm.classList.remove('loading');
            }
        });

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
        }

        window.customAlert = function(title, msg) {
            return new Promise(resolve => {
                const titleEl = document.getElementById('alert-modal-title');
                const msgEl = document.getElementById('alert-modal-msg');
                const modal = document.getElementById('alert-modal');
                const okBtn = document.getElementById('alert-modal-ok');

                if (!modal) {
                    alert(msg);
                    resolve();
                    return;
                }

                titleEl.textContent = title;
                msgEl.textContent = msg;
                modal.style.display = 'flex';

                okBtn.onclick = () => {
                    modal.style.display = 'none';
                    resolve();
                };
            });
        };

        window.togglePassword = function(button) {
            const input = button.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                button.style.color = 'var(--color-accent-primary)';
            } else {
                input.type = 'password';
                button.style.color = 'var(--color-text-secondary)';
            }
        };
