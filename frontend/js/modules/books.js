/**
 * 图书模块
 */
const Books = {
    currentPage: 1,
    currentCategoryId: 0,
    currentKeyword: '',

    async loadBooks(page = 1, categoryId = 0, keyword = '') {
        this.currentPage = page;
        this.currentCategoryId = categoryId;
        this.currentKeyword = keyword;

        let url = `/books?page=${page}&page_size=${CONFIG.PAGE_SIZE}`;
        if (categoryId > 0) url += `&category_id=${categoryId}`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

        return await API.get(url);
    },

    renderBooks(books, containerId = 'book-list') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!books || books.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <div class="empty-icon">📚</div>
                    <p>暂无图书</p>
                    <p class="sub-text">换个关键词试试吧</p>
                </div>`;
            return;
        }

        container.innerHTML = books.map(book => this.renderBookCard(book)).join('');
    },

    renderBookCard(book) {
        const coverUrl = book.cover_url || CONFIG.DEFAULT_COVER;
        const categoryName = book.category ? book.category.name : '';

        return `
            <div class="book-card" onclick="window.location.href='./book_detail.html?id=${book.id}'">
                <div class="book-cover">
                    ${coverUrl && coverUrl !== CONFIG.DEFAULT_COVER
                        ? `<img src="${coverUrl}" alt="${Utils.escapeHtml(book.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />`
                        : ''}
                    <div class="cover-placeholder" style="${coverUrl && coverUrl !== CONFIG.DEFAULT_COVER ? 'display:none' : ''}">
                        ${book.title ? book.title.charAt(0) : '📖'}
                    </div>
                    ${categoryName ? `<span class="book-category-tag">${Utils.escapeHtml(categoryName)}</span>` : ''}
                </div>
                <div class="book-info">
                    <div class="book-title" title="${Utils.escapeHtml(book.title)}">${Utils.escapeHtml(book.title)}</div>
                    <div class="book-author">${Utils.escapeHtml(book.author)}</div>
                    <div class="book-footer">
                        <span class="book-price"><span class="unit">¥</span>${Number(book.price).toFixed(2)}</span>
                        <span class="book-stock">库存: ${book.stock || 0}</span>
                    </div>
                </div>
            </div>`;
    },

    renderPagination(total, currentPage, onPageChange) {
        const totalPages = Math.ceil(total / CONFIG.PAGE_SIZE);
        if (totalPages <= 1) return '';

        let html = '<div class="pagination">';
        html += `<button class="page-btn" ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}">上一页</button>`;

        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            html += `<button class="page-btn" data-page="1">1</button>`;
            if (start > 2) html += `<span class="page-info">...</span>`;
        }

        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (end < totalPages) {
            if (end < totalPages - 1) html += `<span class="page-info">...</span>`;
            html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        html += `<button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">下一页</button>`;
        html += `<span class="page-info">共 ${total} 条</span>`;
        html += '</div>';

        setTimeout(() => {
            document.querySelectorAll('.pagination .page-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    if (this.disabled) return;
                    const page = parseInt(this.dataset.page);
                    if (onPageChange) onPageChange(page);
                });
            });
        }, 0);

        return html;
    },

    async loadBookDetail(bookId) {
        return await API.get(`/books/${bookId}`);
    },

    renderBookDetail(book) {
        const coverUrl = book.cover_url || CONFIG.DEFAULT_COVER;

        const coverEl = document.getElementById('detail-cover');
        const titleEl = document.getElementById('detail-title');
        const authorEl = document.getElementById('detail-author');
        const priceEl = document.getElementById('detail-price');
        const stockEl = document.getElementById('detail-stock');
        const descEl = document.getElementById('detail-description');
        const categoryEl = document.getElementById('detail-category');

        if (coverEl) {
            if (coverUrl && coverUrl !== CONFIG.DEFAULT_COVER) {
                coverEl.innerHTML = `<img src="${coverUrl}" alt="${Utils.escapeHtml(book.title)}" onerror="this.parentElement.innerHTML='<div class=\\'cover-placeholder\\'>${book.title ? book.title.charAt(0) : '📖'}</div>'" />`;
            } else {
                coverEl.innerHTML = `<div class="cover-placeholder">${book.title ? book.title.charAt(0) : '📖'}</div>`;
            }
        }
        if (titleEl) titleEl.textContent = book.title;
        if (authorEl) authorEl.textContent = book.author;
        if (priceEl) priceEl.textContent = Utils.formatPrice(book.price);
        if (stockEl) stockEl.textContent = `库存: ${book.stock || 0} 件`;
        if (descEl) descEl.textContent = book.description || '暂无简介';
        if (categoryEl && book.category) categoryEl.textContent = book.category.name;
    },

    async searchBooks(keyword) {
        return await this.loadBooks(1, this.currentCategoryId, keyword);
    },

    async filterByCategory(categoryId) {
        return await this.loadBooks(1, categoryId, this.currentKeyword);
    }
};