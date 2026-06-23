/**
 * 加载动画组件
 */
const Loading = {
    show() {
        if (document.getElementById('loading-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(overlay);
    },

    hide() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.remove();
    }
};