/**
 * 工具函数模块
 */
const Utils = {
    /**
     * 格式化金额
     */
    formatPrice(price) {
        return '¥' + Number(price).toFixed(2);
    },

    /**
     * 格式化日期
     */
    formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    /**
     * 格式化订单状态
     */
    formatStatus(status) {
        const map = {
            0: '待支付',
            1: '待发货',
            2: '已完成',
            3: '已取消'
        };
        return map[status] || '未知';
    },

    /**
     * 获取订单状态对应的CSS类名
     */
    getStatusClass(status) {
        const map = {
            0: 'status-pending',
            1: 'status-paid',
            2: 'status-done',
            3: 'status-cancelled'
        };
        return map[status] || '';
    },

    /**
     * 防抖函数
     */
    debounce(fn, delay = 300) {
        let timer = null;
        return function (...args) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * 提示消息
     */
    showMessage(msg, type = 'info') {
        const container = document.getElementById('message-container');
        if (!container) {
            const div = document.createElement('div');
            div.id = 'message-container';
            div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;';
            document.body.appendChild(div);
        }
        const target = document.getElementById('message-container');
        const el = document.createElement('div');
        const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6';
        el.style.cssText = `
            background:${bgColor};color:#fff;padding:12px 24px;border-radius:8px;
            margin-bottom:8px;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);
            animation:slideIn 0.3s ease;max-width:360px;
        `;
        el.textContent = msg;
        target.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.3s';
            setTimeout(() => el.remove(), 300);
        }, 2500);
    },

    /**
     * 获取URL参数
     */
    getQueryParam(param) {
        const url = new URL(window.location.href);
        return url.searchParams.get(param);
    },

    /**
     * 检查登录状态
     */
    checkAuth() {
        return !!localStorage.getItem('user');
    },

    /**
     * 检查是否管理员
     */
    isAdmin() {
        return localStorage.getItem('role') === 'admin';
    },

    /**
     * 获取当前用户
     */
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * 转义HTML
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * 截断文本
     */
    truncate(str, len = 20) {
        if (!str) return '';
        return str.length > len ? str.substring(0, len) + '...' : str;
    }
};