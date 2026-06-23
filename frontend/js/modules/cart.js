/**
 * 购物车模块
 */
const Cart = {
    async loadCart() {
        return await API.get('/cart');
    },

    renderCart(cartItems, containerId = 'cart-list') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!cartItems || cartItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🛒</div>
                    <p>购物车是空的</p>
                    <p class="sub-text">快去挑选心仪的图书吧</p>
                    <a href="/index.html" class="btn btn-primary mt-2">去逛逛</a>
                </div>`;
            const totalEl = document.getElementById('cart-total');
            if (totalEl) totalEl.textContent = Utils.formatPrice(0);
            return;
        }

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>图书</th>
                        <th>单价</th>
                        <th>数量</th>
                        <th>小计</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>`;

        cartItems.forEach(item => {
            const book = item.book || {};
            const coverUrl = book.cover_url || CONFIG.DEFAULT_COVER;
            const subtotal = (book.price || 0) * (item.quantity || 0);

            html += `
                <tr>
                    <td>
                        <div class="flex" style="gap:12px;align-items:center;">
                            <img class="table-cover" src="${coverUrl}" alt="${Utils.escapeHtml(book.title)}" onerror="this.style.background='linear-gradient(135deg,#667eea,#764ba2)';this.style.display='block';" style="width:40px;height:52px;object-fit:cover;border-radius:4px;" />
                            <div>
                                <a href="/book_detail.html?id=${book.id}" class="font-bold">${Utils.escapeHtml(book.title)}</a>
                                <div class="text-muted" style="font-size:12px;">${Utils.escapeHtml(book.author)}</div>
                            </div>
                        </div>
                    </td>
                    <td>${Utils.formatPrice(book.price)}</td>
                    <td>
                        <div class="quantity-input">
                            <button onclick="Cart.updateQuantity(${book.id}, ${item.quantity - 1})">-</button>
                            <input type="number" value="${item.quantity}" min="1" max="${book.stock || 99}" onchange="Cart.updateQuantity(${book.id}, parseInt(this.value) || 1)" />
                            <button onclick="Cart.updateQuantity(${book.id}, ${item.quantity + 1})">+</button>
                        </div>
                    </td>
                    <td class="font-bold">${Utils.formatPrice(subtotal)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="Cart.removeItem(${book.id})">删除</button>
                    </td>
                </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;

        this.updateTotal(cartItems);
    },

    updateTotal(cartItems) {
        const total = cartItems.reduce((sum, item) => {
            return sum + (item.book ? item.book.price : 0) * (item.quantity || 0);
        }, 0);
        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.textContent = Utils.formatPrice(total);
    },

    async addToCart(bookId, quantity = 1) {
        const res = await API.post('/cart', { book_id: bookId, quantity });
        if (res.code === 200) {
            Utils.showMessage('已加入购物车', 'success');
            this.updateCartBadge();
        } else {
            Utils.showMessage(res.message || '加入购物车失败', 'error');
        }
        return res;
    },

    async updateQuantity(bookId, quantity) {
        if (quantity < 1) return;
        const res = await API.put(`/cart/${bookId}`, { quantity });
        if (res.code === 200) {
            this.loadAndRender();
        } else {
            Utils.showMessage(res.message || '更新失败', 'error');
        }
        return res;
    },

    async removeItem(bookId) {
        Modal.showConfirm('确定要删除该商品吗？', async () => {
            const res = await API.del(`/cart/${bookId}`);
            if (res.code === 200) {
                Utils.showMessage('已删除', 'success');
                this.loadAndRender();
                this.updateCartBadge();
            } else {
                Utils.showMessage(res.message || '删除失败', 'error');
            }
        });
    },

    async clearCart() {
        Modal.showConfirm('确定要清空购物车吗？此操作不可恢复。', async () => {
            const res = await API.del('/cart');
            if (res.code === 200) {
                Utils.showMessage('购物车已清空', 'success');
                this.loadAndRender();
                this.updateCartBadge();
            } else {
                Utils.showMessage(res.message || '清空失败', 'error');
            }
        });
    },

    getCartTotal(cartItems) {
        return cartItems.reduce((sum, item) => {
            return sum + (item.book ? item.book.price : 0) * (item.quantity || 0);
        }, 0);
    },

    async loadAndRender() {
        Loading.show();
        const res = await this.loadCart();
        Loading.hide();
        if (res.code === 200) {
            this.renderCart(res.data || []);
        } else {
            this.renderCart([]);
        }
    },

    async updateCartBadge() {
        const res = await this.loadCart();
        const badge = document.getElementById('cart-badge');
        if (badge && res.code === 200 && res.data) {
            const count = res.data.length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
};