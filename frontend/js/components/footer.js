/**
 * 底部版权组件
 */
const Footer = {
    render() {
        const footerEl = document.getElementById('footer');
        if (!footerEl) {
            console.log('[Footer] #footer element not present on this page, skipping render');
            return;
        }

        footerEl.innerHTML = `
            <div class="footer">
                <div class="container">
                    <div class="footer-inner">
                        <p>&copy; ${new Date().getFullYear()} ${CONFIG.SITE_NAME} - 发现好书，阅读世界</p>
                        <p class="mt-1">本网站仅用于学习演示，不提供真实交易</p>
                    </div>
                </div>
            </div>`;
    }
};