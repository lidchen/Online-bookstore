/**
 * 头部导航栏组件
 */
const Header = {
    render() {
        const headerEl = document.getElementById('header');
        if (!headerEl) {
            console.log('[Header] #header element not present on this page, skipping render');
            return;
        }

        const isLoggedIn = Utils.checkAuth();
        const isAdmin = Utils.isAdmin();
        const username = localStorage.getItem('username') || '';

        // 根据当前页面路径计算相对根路径
        // admin 子目录下的页面需要 ../ 前缀
        const currentPath = Utils.getPagePath();
        const basePath = currentPath.startsWith('/admin/') ? '../' : './';

        console.log('[Header] Rendering — loggedIn:', isLoggedIn, 'isAdmin:', isAdmin, 'username:', username, 'basePath:', basePath);

        headerEl.innerHTML = `
            <div class="header">
                <div class="container">
                    <div class="header-inner">
                        <a href="${basePath}index.html" class="logo">
                            <div class="logo-icon">📖</div>
                            <span>CloudBook</span>
                        </a>
                        <div class="header-search">
                            <div class="search-box">
                                <input type="text" id="header-search-input" placeholder="搜索书名、作者..." />
                                <button id="header-search-btn">🔍 搜索</button>
                            </div>
                        </div>
                        <div class="header-actions">
                            ${isLoggedIn ? `
                                <a href="${basePath}cart.html" class="cart-btn" title="购物车">
                                    🛒
                                    <span class="cart-badge" id="cart-badge" style="display:none;">0</span>
                                </a>
                                <div class="user-info">
                                    <div class="user-avatar">${username.charAt(0).toUpperCase()}</div>
                                    <span>${Utils.escapeHtml(username)}</span>
                                </div>
                                <a href="${basePath}my_orders.html" class="nav-link">我的订单</a>
                                ${isAdmin ? `<a href="${basePath}admin/books.html" class="nav-link admin-link">后台管理</a>` : ''}
                                <button class="nav-link" id="logout-btn" style="color:#ef4444;">退出</button>
                            ` : `
                                <a href="${basePath}login.html" class="btn btn-primary btn-sm">登录</a>
                                <a href="${basePath}register.html" class="btn btn-outline btn-sm">注册</a>
                            `}
                        </div>
                    </div>
                </div>
            </div>`;

        this.bindEvents();
    },

    // 购物车 badge 更新由 App.init() 在路由守卫通过后统一调用
    // 避免在受保护页面渲染时因 session 未同步导致 401 误触发登出
    tryUpdateCartBadge() {
        if (!Utils.checkAuth()) return;
        try {
            if (typeof Cart !== 'undefined' && Cart.updateCartBadge) {
                Cart.updateCartBadge();
            }
        } catch (e) {
            // Cart 模块未加载，忽略
        }
    },

    bindEvents() {
        const searchInput = document.getElementById('header-search-input');
        const searchBtn = document.getElementById('header-search-btn');
        const logoutBtn = document.getElementById('logout-btn');

        const currentPath = Utils.getPagePath();
        const basePath = currentPath.startsWith('/admin/') ? '../' : './';

        const doSearch = () => {
            if (searchInput) {
                const keyword = searchInput.value.trim();
                console.log('[Header] Search:', keyword || '(empty)');
                window.location.href = `${basePath}index.html${keyword ? '?keyword=' + encodeURIComponent(keyword) : ''}`;
            }
        };

        if (searchBtn) searchBtn.addEventListener('click', doSearch);
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') doSearch();
            });
            // 检查URL中是否有搜索关键词
            const keyword = Utils.getQueryParam('keyword');
            if (keyword) {
                searchInput.value = keyword;
            }
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => Auth.logout());
        }
    }
};
