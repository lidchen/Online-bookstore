/**
 * 弹窗组件
 */
const Modal = {
    show(options) {
        const { title, content, width, onConfirm, onCancel } = options;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'modal-overlay';

        overlay.innerHTML = `
            <div class="modal" style="${width ? `max-width:${width}` : ''}">
                <div class="modal-header">
                    <h3>${title || '提示'}</h3>
                    <button class="modal-close" id="modal-close-btn">✕</button>
                </div>
                <div class="modal-body">
                    ${content || ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="modal-cancel-btn">取消</button>
                    <button class="btn btn-primary" id="modal-confirm-btn">确定</button>
                </div>
            </div>`;

        document.body.appendChild(overlay);

        const closeModal = () => {
            overlay.remove();
            if (onCancel) onCancel();
        };

        document.getElementById('modal-close-btn').addEventListener('click', closeModal);
        document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        document.getElementById('modal-confirm-btn').addEventListener('click', async () => {
            if (onConfirm) {
                const result = await onConfirm();
                if (result !== false) {
                    overlay.remove();
                }
            } else {
                overlay.remove();
            }
        });
    },

    showConfirm(message, onConfirm, onCancel) {
        this.show({
            title: '确认操作',
            content: `<p style="font-size:15px;color:var(--text);">${message}</p>`,
            width: '400px',
            onConfirm,
            onCancel
        });
    },

    close() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.remove();
    }
};