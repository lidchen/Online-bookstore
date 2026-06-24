/**
 * API请求封装模块
 * 统一处理请求、响应、错误，并输出诊断日志到控制台
 */
const API = {
    /**
     * 通用请求函数
     */
    async request(url, options = {}) {
        const fullUrl = CONFIG.API_BASE + url;
        const method = options.method || 'GET';

        console.group(`[API] ${method} ${fullUrl}`);
        console.log('Request payload:', options.body || '(none)');

        const token = localStorage.getItem('token');
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        };
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }

        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        const startTime = performance.now();

        try {
            const response = await fetch(fullUrl, config);
            const elapsed = (performance.now() - startTime).toFixed(0);

            console.log(`Response status: ${response.status} ${response.statusText} (${elapsed}ms)`);
            console.log('Response headers:', {
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length')
            });

            // 检查 content-type 是否为 JSON
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                const text = await response.text();
                console.error('[API] Non-JSON response body (first 500 chars):', text.substring(0, 500));
                console.groupEnd();
                return {
                    code: response.status,
                    message: `服务器返回了非JSON响应 (HTTP ${response.status})。` +
                             '请检查后端是否正常运行，或查看浏览器控制台获取详细信息。'
                };
            }

            const data = await response.json();
            console.log('Response body:', data);

            if (!response.ok) {
                console.warn(`[API] HTTP error: ${response.status} — code=${data.code}, message="${data.message}"`);
            }

            if (data.code === 401) {
                // 如果 localStorage 认为已登录但后端返回 401，说明 session 已失效
                if (Utils.checkAuth()) {
                    console.warn('[API] 401 received but localStorage says logged in — clearing stale auth state');
                    localStorage.removeItem('user');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    localStorage.removeItem('token');
                }

                const authRequiredPages = [
                    '/cart.html', '/order_confirm.html', '/order_pay.html',
                    '/my_orders.html', '/admin/books.html', '/admin/orders.html'
                ];

                if (Utils.isPageInList(authRequiredPages)) {
                    console.warn('[API] 401 on auth-required page — redirecting to login');
                    const currentPath = Utils.getPagePath();
                    const loginPath = currentPath.startsWith('/admin/') ? '../login.html' : './login.html';
                    window.location.href = loginPath;
                }
                console.groupEnd();
                return data;
            }

            console.groupEnd();
            return data;
        } catch (error) {
            const elapsed = (performance.now() - startTime).toFixed(0);
            console.error(`[API] Request failed after ${elapsed}ms`);
            console.error('[API] Error type:', error.name);
            console.error('[API] Error message:', error.message);

            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                console.error('[API] DIAGNOSIS: Network request was blocked or server is unreachable.');
                console.error('[API] Possible causes:');
                console.error('  1. Backend server is not running on ' + CONFIG.API_BASE);
                console.error('  2. CORS policy blocked the request (check backend CORS config)');
                console.error('  3. Network error / firewall / VPN issue');
                console.error('  4. The URL might be incorrect');
            } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
                console.error('[API] DIAGNOSIS: Server returned something that is not valid JSON.');
                console.error('[API] This usually means the backend crashed or returned an HTML error page.');
            }

            console.groupEnd();
            return {
                code: 500,
                message: '网络错误，请稍后重试。打开浏览器控制台(F12)查看详细诊断信息。'
            };
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

    async upload(url, formData, method = 'POST') {
        const fullUrl = CONFIG.API_BASE + url;
        console.group(`[API] UPLOAD ${method} ${fullUrl}`);
        const startTime = performance.now();

        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            }
            const response = await fetch(fullUrl, {
                method,
                credentials: 'include',
                headers,
                body: formData
            });
            const elapsed = (performance.now() - startTime).toFixed(0);
            console.log(`Upload response: ${response.status} ${response.statusText} (${elapsed}ms)`);

            const data = await response.json();
            console.log('Upload response body:', data);
            console.groupEnd();

            if (data.code === 401) {
                if (Utils.checkAuth()) {
                    console.warn('[API] 401 on upload but localStorage says logged in — clearing stale auth state');
                    localStorage.removeItem('user');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    localStorage.removeItem('token');
                }

                const authRequiredPages = [
                    '/cart.html', '/order_confirm.html', '/order_pay.html',
                    '/my_orders.html', '/admin/books.html', '/admin/orders.html'
                ];

                if (Utils.isPageInList(authRequiredPages)) {
                    console.warn('[API] 401 on upload, auth-required page — redirecting to login');
                    const currentPath = Utils.getPagePath();
                    const loginPath = currentPath.startsWith('/admin/') ? '../login.html' : './login.html';
                    window.location.href = loginPath;
                }
                console.groupEnd();
                return data;
            }
            return data;
        } catch (error) {
            console.error('[API] Upload failed:', error.name, error.message);
            console.groupEnd();
            return { code: 500, message: '上传失败：网络错误' };
        }
    }
};
