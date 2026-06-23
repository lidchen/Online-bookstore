/**
 * 认证模块
 */
const Auth = {
    async login(username, password) {
        const res = await API.post('/login', { username, password });
        if (res.code === 200 && res.data) {
            localStorage.setItem('user', JSON.stringify(res.data));
            localStorage.setItem('username', res.data.username);
            localStorage.setItem('role', res.data.role);
            Utils.showMessage('登录成功', 'success');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 500);
        } else {
            Utils.showMessage(res.message || '登录失败', 'error');
        }
        return res;
    },

    async register(username, password) {
        const res = await API.post('/register', { username, password });
        if (res.code === 200) {
            Utils.showMessage('注册成功，请登录', 'success');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1000);
        } else {
            Utils.showMessage(res.message || '注册失败', 'error');
        }
        return res;
    },

    async logout() {
        await API.post('/logout');
        localStorage.removeItem('user');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        Utils.showMessage('已退出登录', 'info');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 500);
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