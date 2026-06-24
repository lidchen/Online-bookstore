/**
 * 头部导航栏组件
 */
const Header = {
    render() {
        const headerEl = document.getElementById('header');
        if (!headerEl) return;

        const isLoggedIn = Utils.checkAuth();
        const isAdmin = Utils.isAdmin();
        const username = localStorage.getItem('username') || '';

        headerEl.innerHTML = `
            <div class="header">
                <div class="container">
                    <div class="header-inner">
                        <a href="./index.html" class="logo">
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
                                <a href="./cart.html" class="cart-btn" title="购物车">
                                    🛒
                                    <span class="cart-badge" id="cart-badge" style="display:none;">0</span>
                                </a>
                                <div class="user-info">
                                    <div class="user-avatar">${username.charAt(0).toUpperCase()}</div>
                                    <span>${Utils.escapeHtml(username)}</span>
                                </div>
                                <a href="./my_orders.html" class="nav-link">我的订单</a>
                                ${isAdmin ? `<a href="./admin/books.html" class="nav-link admin-link">后台管理</a>` : ''}
                                <button class="nav-link" id="logout-btn" style="color:#ef4444;">退出</button>
                            ` : `
                                <a href="./login.html" class="btn btn-primary btn-sm">登录</a>
                                <a href="./register.html" class="btn btn-outline btn-sm">注册</a>
                            `}
                        </div>
                    </div>
                </div>
            </div>`;

        this.bindEvents();
        if (isLoggedIn) {
            Cart.updateCartBadge();
        }
    },

    bindEvents() {
        const searchInput = document.getElementById('header-search-input');
        const searchBtn = document.getElementById('header-search-btn');
        const logoutBtn = document.getElementById('logout-btn');

        const doSearch = () => {
            if (searchInput) {
                const keyword = searchInput.value.trim();
                if (keyword) {
                    window.location.href = `./index.html?keyword=${encodeURIComponent(keyword)}`;
                }
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