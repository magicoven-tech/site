
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Simulating the logic in server.js
const resetTokens = new Map();
const users = [
    { username: 'admin', email: 'magicoven.tech@gmail.com' }
];

async function forgotPassword(usernameOrEmail) {
    const user = users.find(u => u.username === usernameOrEmail || u.email === usernameOrEmail);
    if (!user) return { error: 'Not found' };
    
    const code = '123456';
    resetTokens.set(user.email, { code, username: user.username });
    return { success: true, email: user.email };
}

async function resetPassword(emailOrUsername, code) {
    // Current server.js logic:
    const tokenData = resetTokens.get(emailOrUsername);
    if (!tokenData || tokenData.code !== code) {
        return { error: 'Invalid code or email' };
    }
    return { success: true };
}

(async () => {
    console.log('--- Case 1: User enters email ---');
    await forgotPassword('magicoven.tech@gmail.com');
    console.log('Reset result:', await resetPassword('magicoven.tech@gmail.com', '123456'));

    console.log('\n--- Case 2: User enters username ---');
    await forgotPassword('admin');
    console.log('Reset result:', await resetPassword('admin', '123456'));
})();
