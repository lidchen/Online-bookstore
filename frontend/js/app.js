/**
 * 应用入口 - 路由守卫 & 页面初始化
 */
const App = {
    routes: {},

    init() {
        const rawPathname = window.location.pathname;
        const path = Utils.getPagePath();
        console.group('[App] Initializing');
        console.log('Raw pathname:', rawPathname);
        console.log('App page path:', path);
        console.log('Full URL:', window.location.href);
        console.log('API base:', CONFIG.API_BASE);
        console.log('Auth state:', {
            isLoggedIn: Utils.checkAuth(),
            isAdmin: Utils.isAdmin(),
            username: localStorage.getItem('username'),
            hasUserData: !!localStorage.getItem('user')
        });

        try {
            // 根据当前页面路径计算相对根路径
            const basePath = path.startsWith('/admin/') ? '../' : './';

            // 渲染公共组件（仅当页面包含对应容器时渲染）
            if (document.getElementById('header')) Header.render();
            if (document.getElementById('footer')) Footer.render();

            // 路由守卫规则
            const needAuthPages = [
                '/cart.html', '/order_confirm.html', '/order_pay.html',
                '/my_orders.html', '/admin/books.html', '/admin/orders.html'
            ];
            const adminPages = ['/admin/books.html', '/admin/orders.html'];
            const authPages = ['/login.html', '/register.html'];

            // 已登录用户访问登录/注册页 → 跳转首页
            if (Utils.isPageInList(authPages) && Utils.checkAuth()) {
                console.log('[App] Already logged in, redirecting to index.html');
                window.location.href = `${basePath}index.html`;
                console.groupEnd();
                return;
            }

            // 未登录访问需要登录的页面 → 跳转登录页
            if (Utils.isPageInList(needAuthPages) && !Utils.checkAuth()) {
                console.log('[App] Not authenticated, redirecting to login.html');
                window.location.href = `${basePath}login.html`;
                console.groupEnd();
                return;
            }

            // 非管理员访问后台页面 → 跳转首页
            if (Utils.isPageInList(adminPages) && !Utils.isAdmin()) {
                console.warn('[App] Non-admin user tried to access admin page');
                Utils.showMessage('无权限访问后台', 'error');
                setTimeout(() => { window.location.href = `${basePath}index.html`; }, 1000);
                console.groupEnd();
                return;
            }

            // 执行页面初始化
            console.log('[App] Routing to page handler for:', path);
            this.initPage(path);

            // 路由守卫通过后，安全地更新购物车 badge
            // 放在 initPage 之后确保页面 DOM 已就绪
            if (!Utils.isPageInList(authPages)) {
                setTimeout(() => Header.tryUpdateCartBadge(), 200);
            }
        } catch (err) {
            console.error('[App] Fatal error during init:', err);
            console.error('[App] Error stack:', err.stack);
        }

        console.groupEnd();
    },

    initPage(path) {
        switch (path) {
            case '/index.html':
            case '/':
                console.log('[App] → initHome()');
                this.initHome();
                break;
            case '/login.html':
                console.log('[App] → initLogin()');
                this.initLogin();
                break;
            case '/register.html':
                console.log('[App] → initRegister()');
                this.initRegister();
                break;
            case '/book_detail.html':
                console.log('[App] → initBookDetail()');
                this.initBookDetail();
                break;
            case '/cart.html':
                console.log('[App] → initCart()');
                this.initCart();
                break;
            case '/order_confirm.html':
                console.log('[App] → initOrderConfirm()');
                this.initOrderConfirm();
                break;
            case '/order_pay.html':
                console.log('[App] → initOrderPay()');
                this.initOrderPay();
                break;
            case '/my_orders.html':
                console.log('[App] → initMyOrders()');
                this.initMyOrders();
                break;
            case '/admin/books.html':
                console.log('[App] → initAdminBooks()');
                this.initAdminBooks();
                break;
            case '/admin/orders.html':
                console.log('[App] → initAdminOrders()');
                this.initAdminOrders();
                break;
            default:
                console.warn('[App] Unknown path, no handler:', path);
                break;
        }
    },

    // ===== 首页 =====
    async initHome() {
        const keyword = Utils.getQueryParam('keyword') || '';
        const categoryId = parseInt(Utils.getQueryParam('category_id')) || 0;

        // 加载图书列表
        Loading.show();
        const res = await Books.loadBooks(1, categoryId, keyword);
        Loading.hide();

        if (res.code === 200) {
            const data = res.data;
            Books.renderBooks(data.list || [], 'book-list');
            Pagination.render('pagination-container', data.total || 0, data.page || 1, CONFIG.PAGE_SIZE, (page) => {
                this.loadHomePage(page, categoryId, keyword);
            });
        } else {
            Books.renderBooks([], 'book-list');
        }

        // 分类筛选
        this.initCategoryFilter(categoryId);
    },

    async loadHomePage(page, categoryId, keyword) {
        Loading.show();
        const res = await Books.loadBooks(page, categoryId, keyword);
        Loading.hide();
        if (res.code === 200) {
            const data = res.data;
            Books.renderBooks(data.list || [], 'book-list');
            Pagination.render('pagination-container', data.total || 0, data.page || 1, CONFIG.PAGE_SIZE, (p) => {
                this.loadHomePage(p, categoryId, keyword);
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    initCategoryFilter(activeId) {
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', async () => {
                const catId = parseInt(item.dataset.categoryId) || 0;
                document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                this.loadHomePage(1, catId, Books.currentKeyword);
            });
            if (parseInt(item.dataset.categoryId) === activeId) {
                item.classList.add('active');
            }
        });
    },

    // ===== 登录页 =====
    initLogin() {
        console.log('[Login Page] Setting up form handler');
        const form = document.getElementById('login-form');
        if (!form) {
            console.error('[Login Page] FORM NOT FOUND: #login-form element does not exist in the DOM!');
            return;
        }
        console.log('[Login Page] Form found, binding submit event');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.group('[Login Form] Submit');

            const usernameEl = document.getElementById('username');
            const passwordEl = document.getElementById('password');

            if (!usernameEl || !passwordEl) {
                console.error('[Login Form] Input elements missing! username:', !!usernameEl, 'password:', !!passwordEl);
                console.groupEnd();
                return;
            }

            const username = usernameEl.value.trim();
            const password = passwordEl.value.trim();
            console.log('Username:', username || '(empty)');
            console.log('Password provided:', !!password);

            let hasError = false;
            if (!username) {
                document.getElementById('username-error').textContent = '请输入用户名';
                console.warn('[Login Form] Validation: username empty');
                hasError = true;
            } else {
                document.getElementById('username-error').textContent = '';
            }
            if (!password) {
                document.getElementById('password-error').textContent = '请输入密码';
                console.warn('[Login Form] Validation: password empty');
                hasError = true;
            } else {
                document.getElementById('password-error').textContent = '';
            }
            if (hasError) {
                console.groupEnd();
                return;
            }

            const btn = document.getElementById('login-btn');
            btn.disabled = true;
            btn.textContent = '登录中...';

            console.log('[Login Form] Calling Auth.login()...');
            const result = await Auth.login(username, password);

            console.log('[Login Form] Auth.login() returned, code:', result.code);
            // 如果登录失败，恢复按钮状态
            if (result.code !== 200) {
                btn.disabled = false;
                btn.textContent = '登录';
                document.getElementById('password-error').textContent = result.message || '登录失败，请重试';
                console.log('[Login Form] Button re-enabled (login failed)');
            }
            // 如果登录成功，Auth.login 内部会处理跳转，不需要恢复按钮

            console.groupEnd();
        });
    },

    // ===== 注册页 =====
    initRegister() {
        console.log('[Register Page] Setting up form handler');
        const form = document.getElementById('register-form');
        if (!form) {
            console.error('[Register Page] FORM NOT FOUND: #register-form element does not exist in the DOM!');
            return;
        }
        console.log('[Register Page] Form found, binding submit event');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.group('[Register Form] Submit');

            const usernameEl = document.getElementById('username');
            const passwordEl = document.getElementById('password');
            const confirmEl = document.getElementById('confirm-password');

            if (!usernameEl || !passwordEl || !confirmEl) {
                console.error('[Register Form] Input elements missing!', {
                    username: !!usernameEl, password: !!passwordEl, confirm: !!confirmEl
                });
                console.groupEnd();
                return;
            }

            const username = usernameEl.value.trim();
            const password = passwordEl.value.trim();
            const confirmPassword = confirmEl.value.trim();
            console.log('Username:', username || '(empty)');
            console.log('Password provided:', !!password, 'Confirm provided:', !!confirmPassword);

            let hasError = false;
            if (!username) {
                document.getElementById('username-error').textContent = '请输入用户名';
                console.warn('[Register Form] Validation: username empty');
                hasError = true;
            } else if (username.length < 3) {
                document.getElementById('username-error').textContent = '用户名至少3个字符';
                console.warn('[Register Form] Validation: username too short (' + username.length + ' chars)');
                hasError = true;
            } else {
                document.getElementById('username-error').textContent = '';
            }

            if (!password) {
                document.getElementById('password-error').textContent = '请输入密码';
                console.warn('[Register Form] Validation: password empty');
                hasError = true;
            } else if (password.length < 6) {
                document.getElementById('password-error').textContent = '密码至少6个字符';
                console.warn('[Register Form] Validation: password too short (' + password.length + ' chars)');
                hasError = true;
            } else {
                document.getElementById('password-error').textContent = '';
            }

            if (password !== confirmPassword) {
                document.getElementById('confirm-error').textContent = '两次密码不一致';
                console.warn('[Register Form] Validation: passwords do not match');
                hasError = true;
            } else {
                document.getElementById('confirm-error').textContent = '';
            }

            if (hasError) {
                console.groupEnd();
                return;
            }

            const btn = document.getElementById('register-btn');
            btn.disabled = true;
            btn.textContent = '注册中...';

            console.log('[Register Form] Calling Auth.register()...');
            const result = await Auth.register(username, password, confirmPassword);

            console.log('[Register Form] Auth.register() returned, code:', result.code);
            if (result.code !== 200) {
                btn.disabled = false;
                btn.textContent = '注册';
                console.log('[Register Form] Button re-enabled (register failed)');
            }

            console.groupEnd();
        });
    },

    // ===== 图书详情页 =====
    async initBookDetail() {
        const bookId = Utils.getQueryParam('id');
        if (!bookId) {
            window.location.href = './index.html';
            return;
        }

        Loading.show();
        const res = await Books.loadBookDetail(bookId);
        Loading.hide();

        if (res.code === 200 && res.data) {
            Books.renderBookDetail(res.data);

            const addCartBtn = document.getElementById('add-cart-btn');
            if (addCartBtn) {
                addCartBtn.addEventListener('click', async () => {
                    const quantity = parseInt(document.getElementById('quantity')?.value || 1);
                    if (quantity < 1) {
                        Utils.showMessage('数量至少为1', 'error');
                        return;
                    }
                    if (!Utils.checkAuth()) {
                        window.location.href = './login.html';
                        return;
                    }
                    await Cart.addToCart(parseInt(bookId), quantity);
                });
            }
        } else {
            document.getElementById('detail-container').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📖</div>
                    <p>图书不存在</p>
                    <a href="./index.html" class="btn btn-primary mt-2">返回首页</a>
                </div>`;
        }
    },

    // ===== 购物车页 =====
    initCart() {
        Cart.loadAndRender();

        const clearBtn = document.getElementById('clear-cart-btn');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (clearBtn) {
            clearBtn.addEventListener('click', () => Cart.clearCart());
        }
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                window.location.href = './order_confirm.html';
            });
        }
    },

    // ===== 订单确认页 =====
    async initOrderConfirm() {
        // 加载购物车数据预览
        Loading.show();
        const cartRes = await Cart.loadCart();
        Loading.hide();

        if (cartRes.code !== 200 || !cartRes.data?.items || cartRes.data.items.length === 0) {
            document.getElementById('order-items').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🛒</div>
                    <p>购物车为空</p>
                    <a href="./index.html" class="btn btn-primary mt-2">去逛逛</a>
                </div>`;
            document.getElementById('submit-order-btn').style.display = 'none';
            return;
        }

        const cartItems = cartRes.data.items || [];
        let itemsHtml = '';
        let total = 0;

        cartItems.forEach(item => {
            const book = item.book || {};
            const coverUrl = Utils.getCoverUrl(book.cover_url);
            const subtotal = (book.price || 0) * (item.quantity || 0);
            total += subtotal;

            itemsHtml += `
                <tr>
                    <td>
                        <div class="flex" style="gap:10px;align-items:center;">
                            <img src="${coverUrl}" alt="${Utils.escapeHtml(book.title)}" style="width:40px;height:52px;object-fit:cover;border-radius:4px;" onerror="this.style.background='linear-gradient(135deg,#667eea,#764ba2)';this.style.display='block';" />
                            <span>${Utils.escapeHtml(book.title)}</span>
                        </div>
                    </td>
                    <td>${Utils.formatPrice(book.price)}</td>
                    <td>${item.quantity}</td>
                    <td>${Utils.formatPrice(subtotal)}</td>
                </tr>`;
        });

        document.getElementById('order-items').innerHTML = itemsHtml;
        document.getElementById('order-total').textContent = Utils.formatPrice(total);

        // 提交订单
        const form = document.getElementById('order-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const address = document.getElementById('address').value.trim();
                const phone = document.getElementById('phone').value.trim();

                let hasError = false;
                if (!address) {
                    document.getElementById('address-error').textContent = '请输入收货地址';
                    hasError = true;
                } else {
                    document.getElementById('address-error').textContent = '';
                }
                if (!phone) {
                    document.getElementById('phone-error').textContent = '请输入联系电话';
                    hasError = true;
                } else if (!/^1\d{10}$/.test(phone)) {
                    document.getElementById('phone-error').textContent = '请输入正确的手机号';
                    hasError = true;
                } else {
                    document.getElementById('phone-error').textContent = '';
                }
                if (hasError) return;

                const btn = document.getElementById('submit-order-btn');
                btn.disabled = true;
                btn.textContent = '提交中...';

                const res = await Order.createOrder(address, phone);
                if (res.code === 200 && res.data) {
                    Utils.showMessage('订单创建成功', 'success');
                    setTimeout(() => {
                        window.location.href = `./order_pay.html?id=${res.data.id}`;
                    }, 500);
                } else {
                    Utils.showMessage(res.message || '订单创建失败', 'error');
                    btn.disabled = false;
                    btn.textContent = '提交订单';
                }
            });
        }
    },

    // ===== 支付页 =====
    initOrderPay() {
        const orderId = Utils.getQueryParam('id');
        if (!orderId) {
            window.location.href = './my_orders.html';
            return;
        }

        document.getElementById('order-id').textContent = orderId;

        const payBtn = document.getElementById('pay-btn');
        if (payBtn) {
            payBtn.addEventListener('click', async () => {
                payBtn.disabled = true;
                payBtn.textContent = '支付中...';

                const res = await Order.payOrder(orderId);
                // res 为 undefined 表示用户取消了支付确认
                if (res && res.code === 200) {
                    setTimeout(() => {
                        window.location.href = './my_orders.html';
                    }, 500);
                } else {
                    payBtn.disabled = false;
                    payBtn.textContent = '我已支付，下一步';
                }
            });
        }
    },

    // ===== 我的订单页 =====
    initMyOrders() {
        Order.loadAndRender();
    },

    // ===== 后台图书管理 =====
    async initAdminBooks() {
        const data = await Admin.loadAndRenderBooks();
        if (data) {
            Pagination.render('admin-book-pagination', data.total || 0, data.page || 1, CONFIG.PAGE_SIZE, (page) => {
                this.initAdminBooksPage(page);
            });
        }

        document.getElementById('add-book-btn').addEventListener('click', () => {
            Admin.showBookForm();
        });

        const searchInput = document.getElementById('admin-book-search');
        const searchBtn = document.getElementById('admin-book-search-btn');
        if (searchBtn && searchInput) {
            const renderSearchPagination = (keyword) => (page) => {
                Admin.loadBooks(page, keyword).then(r => {
                    if (r.code === 200) {
                        const d = r.data;
                        Admin.renderBooksTable(d.list || [], 'admin-book-list');
                        Pagination.render('admin-book-pagination', d.total || 0, d.page || 1, CONFIG.PAGE_SIZE, renderSearchPagination(keyword));
                    }
                });
            };

            searchBtn.addEventListener('click', async () => {
                const keyword = searchInput.value.trim();
                const res = await Admin.loadBooks(1, keyword);
                if (res.code === 200) {
                    const d = res.data;
                    Admin.renderBooksTable(d.list || [], 'admin-book-list');
                    Pagination.render('admin-book-pagination', d.total || 0, 1, CONFIG.PAGE_SIZE, renderSearchPagination(keyword));
                }
            });
        }
    },

    async initAdminBooksPage(page) {
        const res = await Admin.loadBooks(page, Admin.bookKeyword);
        if (res.code === 200) {
            Admin.renderBooksTable(res.data.list || [], 'admin-book-list');
            Pagination.render('admin-book-pagination', res.data.total || 0, res.data.page || 1, CONFIG.PAGE_SIZE, (p) => {
                this.initAdminBooksPage(p);
            });
        }
    },

    // ===== 后台订单管理 =====
    async initAdminOrders() {
        const renderOrdersPagination = (page) => {
            Admin.loadOrders(page).then(r => {
                if (r.code === 200) {
                    const d = r.data;
                    Admin.renderOrdersTable(d.list || [], 'admin-order-list');
                    Pagination.render('admin-order-pagination', d.total || 0, d.page || 1, CONFIG.PAGE_SIZE, renderOrdersPagination);
                }
            });
        };

        const data = await Admin.loadAndRenderOrders();
        if (data) {
            Pagination.render('admin-order-pagination', data.total || 0, data.page || 1, CONFIG.PAGE_SIZE, renderOrdersPagination);
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM ready, starting application...');
    App.init();
});
