/**
 * 认证模块
 */
const Auth = {
    async login(username, password) {
        console.group('[Auth] Login attempt');
        console.log('Username:', username);
        console.log('Password length:', password ? password.length : 0);

        const res = await API.post('/login', { username, password });

        console.log('Login response — code:', res.code, 'message:', res.message);
        console.log('Login response — data:', res.data);

        if (res.code === 200 && res.data) {
            if (!res.data.username) {
                console.error('[Auth] Login response missing username in data!');
                console.error('[Auth] Full data object:', JSON.stringify(res.data));
                Utils.showMessage('登录失败：服务器返回数据不完整', 'error');
                console.groupEnd();
                return res;
            }

            localStorage.setItem('user', JSON.stringify(res.data));
            localStorage.setItem('username', res.data.username);
            localStorage.setItem('role', res.data.role || 'user');
            console.log('[Auth] Login SUCCESS — stored user:', res.data.username, 'role:', res.data.role || 'user');
            console.log('[Auth] localStorage state:', {
                user: localStorage.getItem('user'),
                username: localStorage.getItem('username'),
                role: localStorage.getItem('role')
            });

            Utils.showMessage('登录成功', 'success');
            setTimeout(() => {
                console.log('[Auth] Redirecting to index.html');
                window.location.href = './index.html';
            }, 500);
        } else {
            console.warn('[Auth] Login FAILED — code:', res.code, 'message:', res.message);
            Utils.showMessage(res.message || '登录失败', 'error');
        }

        console.groupEnd();
        return res;
    },

    async register(username, password) {
        console.group('[Auth] Register attempt');
        console.log('Username:', username);
        console.log('Password length:', password ? password.length : 0);

        const res = await API.post('/register', { username, password });

        console.log('Register response — code:', res.code, 'message:', res.message);
        console.log('Register response — data:', res.data);

        if (res.code === 200) {
            console.log('[Auth] Register SUCCESS');
            Utils.showMessage('注册成功，请登录', 'success');
            setTimeout(() => {
                console.log('[Auth] Redirecting to login.html');
                window.location.href = './login.html';
            }, 1000);
        } else {
            console.warn('[Auth] Register FAILED — code:', res.code, 'message:', res.message);
            Utils.showMessage(res.message || '注册失败', 'error');
        }

        console.groupEnd();
        return res;
    },

    async logout() {
        console.group('[Auth] Logout');
        console.log('Current user before logout:', localStorage.getItem('username'));
        console.log('Current role before logout:', localStorage.getItem('role'));

        await API.post('/logout');
        localStorage.removeItem('user');
        localStorage.removeItem('username');
        localStorage.removeItem('role');

        console.log('[Auth] Logout complete — localStorage cleared');
        Utils.showMessage('已退出登录', 'info');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 500);
        console.groupEnd();
    },

    getCurrentUser() {
        return Utils.getCurrentUser();
    },

    checkAuth() {
        return Utils.checkAuth();
    },

    isAdmin() {
        return Utils.isAdmin();
    }
};
