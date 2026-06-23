/**
 * API请求封装模块
 * 统一处理请求、响应、错误
 */
const API = {
    /**
     * 通用请求函数
     */
    async request(url, options = {}) {
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        };

        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(CONFIG.API_BASE + url, config);
            const data = await response.json();

            if (data.code === 401) {
                localStorage.removeItem('user');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
                if (window.location.pathname !== '/login.html') {
                    window.location.href = '/login.html';
                }
                return data;
            }

            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            return { code: 500, message: '网络错误，请稍后重试' };
        }
    },

    get(url) {
        return this.request(url, { method: 'GET' });
    },

    post(url, body) {
        return this.request(url, { method: 'POST', body });
    },

    put(url, body) {
        return this.request(url, { method: 'PUT', body });
    },

    del(url) {
        return this.request(url, { method: 'DELETE' });
    },

    patch(url, body) {
        return this.request(url, { method: 'PATCH', body });
    },

    upload(url, formData) {
        return fetch(CONFIG.API_BASE + url, {
            method: 'POST',
            credentials: 'include',
            body: formData
        }).then(res => res.json());
    }
};