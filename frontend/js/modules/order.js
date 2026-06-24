/**
 * 订单模块
 */
const Order = {
    async createOrder(address, phone) {
        console.log('[Order] Creating order — address:', address, 'phone:', phone);
        const res = await API.post('/orders', { address, phone });
        console.log('[Order] Create result — code:', res.code, 'orderId:', res.data?.id);
        return res;
    },

    async loadOrders() {
        console.log('[Order] Loading orders...');
        const res = await API.get('/orders');
        console.log('[Order] Load result — code:', res.code, 'count:', res.data?.list?.length || 0);
        return res;
    },

    renderOrders(orders, containerId = 'order-list') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[Order] Container #' + containerId + ' not found!');
            return;
        }

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>暂无订单</p>
                    <p class="sub-text">快去选购图书吧</p>
                    <a href="./index.html" class="btn btn-primary mt-2">去逛逛</a>
                </div>`;
            return;
        }

        let html = '';
        orders.forEach(order => {
            const items = order.items || [];
            html += `
                <div class="panel">
                    <div class="flex-between mb-2">
                        <div>
                            <span class="text-muted" style="font-size:13px;">订单号：</span>
                            <span class="font-bold">${order.order_no || order.id}</span>
                            <span class="text-muted ml-1" style="font-size:12px;">${Utils.formatDate(order.created_at)}</span>
                        </div>
                        <span class="status-badge ${Utils.getStatusClass(order.status)}">${Utils.formatStatus(order.status)}</span>
                    </div>
                    <table class="data-table" style="margin-top:12px;">
                        <thead>
                            <tr>
                                <th>图书</th>
                                <th>单价</th>
                                <th>数量</th>
                                <th>小计</th>
                            </tr>
                        </thead>
                        <tbody>`;

            items.forEach(item => {
                const book = item.book || {};
                const coverUrl = book.cover_url || CONFIG.DEFAULT_COVER;
                html += `
                    <tr>
                        <td>
                            <div class="flex" style="gap:10px;align-items:center;">
                                <img class="table-cover" src="${coverUrl}" alt="${Utils.escapeHtml(book.title)}" onerror="this.style.background='linear-gradient(135deg,#667eea,#764ba2)';this.style.display='block';" style="width:36px;height:48px;object-fit:cover;border-radius:4px;" />
                                <span>${Utils.escapeHtml(book.title)}</span>
                            </div>
                        </td>
                        <td>${Utils.formatPrice(item.price)}</td>
                        <td>${item.quantity}</td>
                        <td>${Utils.formatPrice(item.price * item.quantity)}</td>
                    </tr>`;
            });

            html += `
                        </tbody>
                    </table>
                    <div class="flex-between mt-3">
                        <div class="text-muted" style="font-size:13px;">
                            收货地址：${Utils.escapeHtml(order.address)} | 电话：${Utils.escapeHtml(order.phone)}
                        </div>
                        <div class="flex" style="gap:8px;align-items:center;">
                            <span class="text-muted" style="font-size:13px;">总计：</span>
                            <span class="font-bold" style="font-size:18px;color:#e74c3c;">${Utils.formatPrice(order.total_amount)}</span>`;

            if (order.status === 0) {
                html += `
                            <button class="btn btn-primary btn-sm ml-2" onclick="Order.payOrder(${order.id})">去支付</button>
                            <button class="btn btn-danger btn-sm" onclick="Order.cancelOrder(${order.id})">取消订单</button>`;
            } else if (order.status === 1) {
                html += `
                            <button class="btn btn-primary btn-sm ml-2" onclick="Order.confirmOrder(${order.id})">确认收货</button>`;
            }

            html += `
                        </div>
                    </div>
                </div>`;
        });

        container.innerHTML = html;
    },

    async payOrder(orderId) {
        return new Promise((resolve) => {
            Modal.showConfirm('确认支付该订单？', async () => {
                console.log('[Order] Paying order:', orderId);
                const res = await API.put(`/orders/${orderId}/pay`);
                if (res.code === 200) {
                    console.log('[Order] Payment successful');
                    Utils.showMessage('支付成功', 'success');
                    this.loadAndRender();
                } else {
                    console.warn('[Order] Payment failed — code:', res.code, 'message:', res.message);
                    Utils.showMessage(res.message || '支付失败', 'error');
                }
                resolve(res);
            }, () => {
                // 用户取消支付确认
                resolve(undefined);
            });
        });
    },

    async cancelOrder(orderId) {
        Modal.showConfirm('确定要取消该订单吗？', async () => {
            console.log('[Order] Cancelling order:', orderId);
            const res = await API.put(`/orders/${orderId}/cancel`);
            if (res.code === 200) {
                console.log('[Order] Order cancelled successfully');
                Utils.showMessage('订单已取消', 'success');
                this.loadAndRender();
            } else {
                console.warn('[Order] Cancel failed — code:', res.code, 'message:', res.message);
                Utils.showMessage(res.message || '取消失败', 'error');
            }
        });
    },

    async confirmOrder(orderId) {
        Modal.showConfirm('确认已收到货物？', async () => {
            console.log('[Order] Confirming receipt for order:', orderId);
            const res = await API.put(`/orders/${orderId}/confirm`);
            if (res.code === 200) {
                console.log('[Order] Receipt confirmed successfully');
                Utils.showMessage('确认收货成功', 'success');
                this.loadAndRender();
            } else {
                console.warn('[Order] Confirm receipt failed — code:', res.code, 'message:', res.message);
                Utils.showMessage(res.message || '确认失败', 'error');
            }
        });
    },

    canCancel(status) {
        return status === 0;
    },

    canConfirm(status) {
        return status === 1;
    },

    async loadAndRender() {
        Loading.show();
        const res = await this.loadOrders();
        Loading.hide();
        if (res.code === 200) {
            this.renderOrders(res.data?.list || []);
        } else {
            this.renderOrders([]);
        }
    }
};
