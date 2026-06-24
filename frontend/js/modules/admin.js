/**
 * 后台管理模块
 */
const Admin = {
    currentBookPage: 1,
    currentOrderPage: 1,
    bookKeyword: '',

    // ===== 图书管理 =====
    async loadBooks(page = 1, keyword = '') {
        this.currentBookPage = page;
        this.bookKeyword = keyword;
        let url = `/admin/books?page=${page}&page_size=${CONFIG.PAGE_SIZE}`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
        console.log('[Admin] Loading books — page:', page, 'keyword:', keyword || '(none)');
        const res = await API.get(url);
        console.log('[Admin] Books load result — code:', res.code, 'total:', res.data?.total);
        return res;
    },

    renderBooksTable(books, containerId = 'admin-book-list') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[Admin] Container #' + containerId + ' not found!');
            return;
        }

        if (!books || books.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <p>暂无图书</p>
                </div>`;
            return;
        }

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>封面</th>
                        <th>书名</th>
                        <th>作者</th>
                        <th>价格</th>
                        <th>库存</th>
                        <th>分类</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>`;

        books.forEach(book => {
            const coverUrl = Utils.getCoverUrl(book.cover_url);
            html += `
                <tr>
                    <td>${book.id}</td>
                    <td>
                        <img class="table-cover" src="${coverUrl}" alt="${Utils.escapeHtml(book.title)}" onerror="this.style.background='linear-gradient(135deg,#667eea,#764ba2)';this.style.display='block';" />
                    </td>
                    <td class="font-bold">${Utils.escapeHtml(book.title)}</td>
                    <td>${Utils.escapeHtml(book.author)}</td>
                    <td>${Utils.formatPrice(book.price)}</td>
                    <td>${book.stock}</td>
                    <td>${book.category ? book.category.name : '-'}</td>
                    <td>
                        <span class="status-badge ${book.status === 1 ? 'status-done' : 'status-cancelled'}">
                            ${book.status === 1 ? '上架' : '下架'}
                        </span>
                    </td>
                    <td>
                        <div class="flex" style="gap:6px;">
                            <button class="btn btn-outline btn-sm" onclick="Admin.editBook(${book.id})">编辑</button>
                            <button class="btn btn-outline btn-sm" onclick="Admin.toggleStatus(${book.id}, ${book.status})">
                                ${book.status === 1 ? '下架' : '上架'}
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="Admin.deleteBook(${book.id})">删除</button>
                        </div>
                    </td>
                </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    },

    async createBook(formData) {
        console.log('[Admin] Creating book...');
        return await API.upload('/admin/books', formData);
    },

    async updateBook(id, formData) {
        console.log('[Admin] Updating book:', id);
        return await API.upload(`/admin/books/${id}`, formData, 'PUT');
    },

    async deleteBook(id) {
        Modal.showConfirm('确定要删除该图书吗？此操作不可恢复。', async () => {
            console.log('[Admin] Deleting book:', id);
            const res = await API.del(`/admin/books/${id}`);
            if (res.code === 200) {
                console.log('[Admin] Book deleted successfully');
                Utils.showMessage('删除成功', 'success');
                this.loadAndRenderBooks();
            } else {
                console.warn('[Admin] Delete failed — code:', res.code, 'message:', res.message);
                Utils.showMessage(res.message || '删除失败', 'error');
            }
        });
    },

    async toggleStatus(id, currentStatus) {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const action = newStatus === 1 ? '上架' : '下架';
        Modal.showConfirm(`确定要${action}该图书吗？`, async () => {
            console.log('[Admin] Toggling book status — id:', id, 'newStatus:', newStatus);
            const res = await API.patch(`/admin/books/${id}/status`, { status: newStatus });
            if (res.code === 200) {
                console.log('[Admin] Status toggled successfully');
                Utils.showMessage(`${action}成功`, 'success');
                this.loadAndRenderBooks();
            } else {
                console.warn('[Admin] Toggle status failed — code:', res.code, 'message:', res.message);
                Utils.showMessage(res.message || '操作失败', 'error');
            }
        });
    },

    showBookForm(book = null) {
        const isEdit = !!book;
        const title = isEdit ? '编辑图书' : '添加图书';
        console.log('[Admin] Showing book form — mode:', isEdit ? 'edit' : 'create', 'bookId:', book?.id);

        let bodyHtml = `
            <div class="form-group">
                <label>书名</label>
                <input type="text" class="form-input" id="book-title" value="${isEdit ? Utils.escapeHtml(book.title) : ''}" placeholder="请输入书名" />
            </div>
            <div class="form-group">
                <label>作者</label>
                <input type="text" class="form-input" id="book-author" value="${isEdit ? Utils.escapeHtml(book.author) : ''}" placeholder="请输入作者" />
            </div>
            <div class="flex" style="gap:16px;">
                <div class="form-group" style="flex:1;">
                    <label>价格</label>
                    <input type="number" class="form-input" id="book-price" value="${isEdit ? book.price : ''}" placeholder="0.00" step="0.01" min="0" />
                </div>
                <div class="form-group" style="flex:1;">
                    <label>库存</label>
                    <input type="number" class="form-input" id="book-stock" value="${isEdit ? book.stock : ''}" placeholder="0" min="0" />
                </div>
            </div>
            <div class="form-group">
                <label>分类</label>
                <select class="form-input" id="book-category">
                    <option value="">请选择分类</option>
                    <option value="1" ${isEdit && book.category_id === 1 ? 'selected' : ''}>文学</option>
                    <option value="2" ${isEdit && book.category_id === 2 ? 'selected' : ''}>科技</option>
                    <option value="3" ${isEdit && book.category_id === 3 ? 'selected' : ''}>少儿</option>
                    <option value="4" ${isEdit && book.category_id === 4 ? 'selected' : ''}>教育</option>
                    <option value="5" ${isEdit && book.category_id === 5 ? 'selected' : ''}>网络文学</option>
                </select>
            </div>
            <div class="form-group">
                <label>简介</label>
                <textarea class="form-input" id="book-description" rows="3" placeholder="请输入图书简介">${isEdit ? (book.description || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>封面图片${!isEdit ? '' : '（留空则不修改）'}</label>
                ${isEdit && book.cover_url ? `
                    <div style="margin-bottom:8px;">
                        <img src="${Utils.getCoverUrl(book.cover_url)}" alt="当前封面" style="max-width:120px;max-height:160px;border-radius:6px;border:1px solid var(--border);object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                        <div style="display:none;width:120px;height:160px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:6px;align-items:center;justify-content:center;color:#fff;font-size:32px;">${book.title ? book.title.charAt(0) : '📖'}</div>
                    </div>
                ` : ''}
                <input type="file" class="form-input" id="book-cover" accept="image/*" />
            </div>`;

        Modal.show({
            title,
            content: bodyHtml,
            width: '560px',
            onConfirm: async () => {
                const titleVal = document.getElementById('book-title').value.trim();
                const authorVal = document.getElementById('book-author').value.trim();
                const priceVal = document.getElementById('book-price').value;
                const stockVal = document.getElementById('book-stock').value;
                const categoryVal = document.getElementById('book-category').value;
                const descVal = document.getElementById('book-description').value.trim();
                const coverFile = document.getElementById('book-cover').files[0];

                if (!titleVal || !authorVal || !priceVal || !categoryVal) {
                    console.warn('[Admin] Book form validation failed — missing required fields');
                    Utils.showMessage('请填写必要信息', 'error');
                    return false;
                }

                const formData = new FormData();
                formData.append('title', titleVal);
                formData.append('author', authorVal);
                formData.append('price', priceVal);
                formData.append('stock', stockVal || '0');
                formData.append('category_id', categoryVal);
                formData.append('description', descVal);
                if (coverFile) formData.append('cover', coverFile);

                let res;
                if (isEdit) {
                    res = await this.updateBook(book.id, formData);
                } else {
                    res = await this.createBook(formData);
                }

                if (res.code === 200) {
                    Utils.showMessage(isEdit ? '编辑成功' : '添加成功', 'success');
                    this.loadAndRenderBooks();
                    return true;
                } else {
                    Utils.showMessage(res.message || '操作失败', 'error');
                    return false;
                }
            }
        });
    },

    editBook(id) {
        console.log('[Admin] Fetching book for edit:', id);
        Loading.show();
        API.get(`/books/${id}`).then(res => {
            Loading.hide();
            if (res.code === 200 && res.data) {
                this.showBookForm(res.data);
            } else {
                console.warn('[Admin] Failed to fetch book for edit — code:', res.code);
                Utils.showMessage('获取图书信息失败', 'error');
            }
        }).catch(err => {
            Loading.hide();
            console.error('[Admin] Error fetching book for edit:', err);
            Utils.showMessage('获取图书信息失败', 'error');
        });
    },

    // ===== 订单管理 =====
    async loadOrders(page = 1) {
        this.currentOrderPage = page;
        console.log('[Admin] Loading orders — page:', page);
        const res = await API.get(`/admin/orders?page=${page}&page_size=${CONFIG.PAGE_SIZE}`);
        console.log('[Admin] Orders load result — code:', res.code, 'total:', res.data?.total);
        return res;
    },

    renderOrdersTable(orders, containerId = 'admin-order-list') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[Admin] Container #' + containerId + ' not found!');
            return;
        }

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>暂无订单</p>
                </div>`;
            return;
        }

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>订单号</th>
                        <th>用户</th>
                        <th>金额</th>
                        <th>地址</th>
                        <th>电话</th>
                        <th>状态</th>
                        <th>时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>`;

        orders.forEach(order => {
            const username = order.user ? order.user.username : '-';
            html += `
                <tr>
                    <td class="font-bold">${order.order_no || order.id}</td>
                    <td>${Utils.escapeHtml(username)}</td>
                    <td>${Utils.formatPrice(order.total_amount)}</td>
                    <td>${Utils.escapeHtml(order.address)}</td>
                    <td>${Utils.escapeHtml(order.phone)}</td>
                    <td><span class="status-badge ${Utils.getStatusClass(order.status)}">${Utils.formatStatus(order.status)}</span></td>
                    <td>${Utils.formatDate(order.created_at)}</td>
                    <td>`;

            if (order.status === 1) {
                html += `<button class="btn btn-primary btn-sm" onclick="Admin.shipOrder(${order.id})">发货</button>`;
            } else {
                html += `<span class="text-muted" style="font-size:12px;">-</span>`;
            }

            html += `</td></tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    },

    async shipOrder(orderId) {
        Modal.showConfirm('确认发货该订单？', async () => {
            console.log('[Admin] Shipping order:', orderId);
            const res = await API.patch(`/admin/orders/${orderId}/ship`);
            if (res.code === 200) {
                console.log('[Admin] Order shipped successfully');
                Utils.showMessage('发货成功', 'success');
                this.loadAndRenderOrders();
            } else {
                console.warn('[Admin] Ship failed — code:', res.code, 'message:', res.message);
                Utils.showMessage(res.message || '发货失败', 'error');
            }
        });
    },

    // ===== 通用加载渲染 =====
    async loadAndRenderBooks() {
        Loading.show();
        const res = await this.loadBooks(this.currentBookPage, this.bookKeyword);
        Loading.hide();
        if (res.code === 200) {
            this.renderBooksTable(res.data ? (res.data.list || []) : []);
            return res.data;
        } else {
            this.renderBooksTable([]);
            return null;
        }
    },

    async loadAndRenderOrders() {
        Loading.show();
        const res = await this.loadOrders(this.currentOrderPage);
        Loading.hide();
        if (res.code === 200) {
            this.renderOrdersTable(res.data ? (res.data.list || []) : []);
            return res.data;
        } else {
            this.renderOrdersTable([]);
            return null;
        }
    }
};
