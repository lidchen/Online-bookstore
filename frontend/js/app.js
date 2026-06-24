/**
 * 应用入口 - 路由守卫 & 页面初始化
 */
const App = {
    routes: {},

    init() {
        const path = window.location.pathname;

        // 渲染公共组件
        Header.render();
        Footer.render();

        // 路由守卫规则
        const needAuthPages = [
            '/cart.html', '/order_confirm.html', '/order_pay.html',
            '/my_orders.html', '/admin/books.html', '/admin/orders.html'
        ];
        const adminPages = ['/admin/books.html', '/admin/orders.html'];
        const authPages = ['/login.html', '/register.html'];

        // 已登录用户访问登录/注册页 → 跳转首页
        if (authPages.includes(path) && Utils.checkAuth()) {
            window.location.href = './index.html';
            return;
        }

        // 未登录访问需要登录的页面 → 跳转登录页
        if (needAuthPages.includes(path) && !Utils.checkAuth()) {
            window.location.href = './login.html';
            return;
        }

        // 非管理员访问后台页面 → 跳转首页
        if (adminPages.includes(path) && !Utils.isAdmin()) {
            Utils.showMessage('无权限访问后台', 'error');
            setTimeout(() => { window.location.href = './index.html'; }, 1000);
            return;
        }

        // 执行页面初始化
        this.initPage(path);
    },

    initPage(path) {
        switch (path) {
            case '/index.html':
            case '/':
                this.initHome();
                break;
            case '/login.html':
                this.initLogin();
                break;
            case '/register.html':
                this.initRegister();
                break;
            case '/book_detail.html':
                this.initBookDetail();
                break;
            case '/cart.html':
                this.initCart();
                break;
            case '/order_confirm.html':
                this.initOrderConfirm();
                break;
            case '/order_pay.html':
                this.initOrderPay();
                break;
            case '/my_orders.html':
                this.initMyOrders();
                break;
            case '/admin/books.html':
                this.initAdminBooks();
                break;
            case '/admin/orders.html':
                this.initAdminOrders();
                break;
            default:
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
        const form = document.getElementById('login-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            let hasError = false;
            if (!username) {
                document.getElementById('username-error').textContent = '请输入用户名';
                hasError = true;
            } else {
                document.getElementById('username-error').textContent = '';
            }
            if (!password) {
                document.getElementById('password-error').textContent = '请输入密码';
                hasError = true;
            } else {
                document.getElementById('password-error').textContent = '';
            }
            if (hasError) return;

            const btn = document.getElementById('login-btn');
            btn.disabled = true;
            btn.textContent = '登录中...';

            await Auth.login(username, password);

            btn.disabled = false;
            btn.textContent = '登录';
        });
    },

    // ===== 注册页 =====
    initRegister() {
        const form = document.getElementById('register-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();

            let hasError = false;
            if (!username) {
                document.getElementById('username-error').textContent = '请输入用户名';
                hasError = true;
            } else if (username.length < 3) {
                document.getElementById('username-error').textContent = '用户名至少3个字符';
                hasError = true;
            } else {
                document.getElementById('username-error').textContent = '';
            }

            if (!password) {
                document.getElementById('password-error').textContent = '请输入密码';
                hasError = true;
            } else if (password.length < 6) {
                document.getElementById('password-error').textContent = '密码至少6个字符';
                hasError = true;
            } else {
                document.getElementById('password-error').textContent = '';
            }

            if (password !== confirmPassword) {
                document.getElementById('confirm-error').textContent = '两次密码不一致';
                hasError = true;
            } else {
                document.getElementById('confirm-error').textContent = '';
            }

            if (hasError) return;

            const btn = document.getElementById('register-btn');
            btn.disabled = true;
            btn.textContent = '注册中...';

            await Auth.register(username, password);

            btn.disabled = false;
            btn.textContent = '注册';
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

        if (cartRes.code !== 200 || !cartRes.data || cartRes.data.length === 0) {
            document.getElementById('order-items').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🛒</div>
                    <p>购物车为空</p>
                    <a href="./index.html" class="btn btn-primary mt-2">去逛逛</a>
                </div>`;
            document.getElementById('submit-order-btn').style.display = 'none';
            return;
        }

        const cartItems = cartRes.data;
        let itemsHtml = '';
        let total = 0;

        cartItems.forEach(item => {
            const book = item.book || {};
            const coverUrl = book.cover_url || CONFIG.DEFAULT_COVER;
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
                // payOrder already has confirm dialog, so we handle redirect here
                if (res.code === 200) {
                    setTimeout(() => {
                        window.location.href = './my_orders.html';
                    }, 500);
                } else {
                    payBtn.disabled = false;
                    payBtn.textContent = '我已支付';
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
            Pagination.render('admin-book-pagination', data.total || 0, data.page || 1, CONFIG.PAGE_SIZE, async (page) => {
                const res = await Admin.loadBooks(page, Admin.bookKeyword);
                if (res.code === 200) {
                    const d = res.data;
                    Admin.renderBooksTable(d.list || [], 'admin-book-list');
                    Pagination.render('admin-book-pagination', d.total || 0, d.page || 1, CONFIG.PAGE_SIZE, (p) => {
                        this.initAdminBooksPage(p);
                    });
                }
            });
        }

        document.getElementById('add-book-btn').addEventListener('click', () => {
            Admin.showBookForm();
        });

        const searchInput = document.getElementById('admin-book-search');
        const searchBtn = document.getElementById('admin-book-search-btn');
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', async () => {
                const keyword = searchInput.value.trim();
                const res = await Admin.loadBooks(1, keyword);
                if (res.code === 200) {
                    const d = res.data;
                    Admin.renderBooksTable(d.list || [], 'admin-book-list');
                    Pagination.render('admin-book-pagination', d.total || 0, 1, CONFIG.PAGE_SIZE, (p) => {
                        Admin.loadBooks(p, keyword).then(r => {
                            if (r.code === 200) {
                                const dd = r.data;
                                Admin.renderBooksTable(dd.list || [], 'admin-book-list');
                                Pagination.render('admin-book-pagination', dd.total || 0, dd.page || 1, CONFIG.PAGE_SIZE, (pp) => {
                                    Admin.loadBooks(pp, keyword).then(rr => {
                                        if (rr.code === 200) {
                                            Admin.renderBooksTable(rr.data.list || [], 'admin-book-list');
                                        }
                                    });
                                });
                            }
                        });
                    });
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
        const data = await Admin.loadAndRenderOrders();
        if (data) {
            Pagination.render('admin-order-pagination', data.total || 0, data.page || 1, CONFIG.PAGE_SIZE, async (page) => {
                const res = await Admin.loadOrders(page);
                if (res.code === 200) {
                    Admin.renderOrdersTable(res.data.list || [], 'admin-order-list');
                    Pagination.render('admin-order-pagination', res.data.total || 0, res.data.page || 1, CONFIG.PAGE_SIZE, (p) => {
                        Admin.loadOrders(p).then(r => {
                            if (r.code === 200) {
                                Admin.renderOrdersTable(r.data.list || [], 'admin-order-list');
                            }
                        });
                    });
                }
            });
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => App.init());