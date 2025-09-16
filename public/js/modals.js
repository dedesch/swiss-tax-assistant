// Modal management for Swiss Tax Assistant
class ModalManager {
    constructor() {
        this.setupEventListeners();
    }

    // Setup modal event listeners
    setupEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                this.closeModal(event.target.id);
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Setup close button handlers
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (event) => {
                const modal = event.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    // Show specific modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Focus on first input in modal
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    // Close specific modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
            
            // Clear form data when closing
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                this.clearFormErrors(form);
            }
        }
    }

    // Close all modals
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }

    // Clear form validation errors
    clearFormErrors(form) {
        form.querySelectorAll('input').forEach(input => {
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        });
    }

    // Show confirmation dialog
    showConfirmation(message, onConfirm, onCancel = null) {
        const confirmModal = this.createConfirmationModal(message, onConfirm, onCancel);
        document.body.appendChild(confirmModal);
        this.showModal(confirmModal.id);
    }

    // Create confirmation modal dynamically
    createConfirmationModal(message, onConfirm, onCancel) {
        const modalId = 'confirmModal_' + Date.now();
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Confirm Action</h3>
                <p>${message}</p>
                <div style="text-align: right; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="cancelConfirmation('${modalId}')">Cancel</button>
                    <button class="btn" onclick="confirmAction('${modalId}')" style="margin-left: 10px;">Confirm</button>
                </div>
            </div>
        `;

        // Store callbacks on the modal element
        modal._onConfirm = onConfirm;
        modal._onCancel = onCancel;

        return modal;
    }

    // Handle confirmation action
    handleConfirmation(modalId, confirmed) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (confirmed && modal._onConfirm) {
                modal._onConfirm();
            } else if (!confirmed && modal._onCancel) {
                modal._onCancel();
            }
            
            this.closeModal(modalId);
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            }, 300);
        }
    }

    // Show loading modal
    showLoading(message = 'Processing...') {
        let loadingModal = document.getElementById('loadingModal');
        
        if (!loadingModal) {
            loadingModal = document.createElement('div');
            loadingModal.id = 'loadingModal';
            loadingModal.className = 'modal';
            loadingModal.innerHTML = `
                <div class="modal-content" style="text-align: center;">
                    <div style="margin: 20px 0;">
                        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #1e3c72; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
                    </div>
                    <p id="loadingMessage">${message}</p>
                </div>
            `;
            document.body.appendChild(loadingModal);
            
            // Add spinning animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        } else {
            document.getElementById('loadingMessage').textContent = message;
        }
        
        this.showModal('loadingModal');
    }

    // Hide loading modal
    hideLoading() {
        this.closeModal('loadingModal');
    }

    // Show info modal with custom content
    showInfo(title, content, buttonText = 'OK') {
        const infoModal = this.createInfoModal(title, content, buttonText);
        document.body.appendChild(infoModal);
        this.showModal(infoModal.id);
    }

    // Create info modal
    createInfoModal(title, content, buttonText) {
        const modalId = 'infoModal_' + Date.now();
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                <div style="margin: 20px 0;">${content}</div>
                <div style="text-align: right;">
                    <button class="btn" onclick="closeModal('${modalId}')">${buttonText}</button>
                </div>
            </div>
        `;

        // Auto-remove after closing
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 60000); // Remove after 1 minute

        return modal;
    }
}

// Global functions for HTML onclick handlers
function closeModal(modalId) {
    if (window.modalManager) {
        window.modalManager.closeModal(modalId);
    }
}

function confirmAction(modalId) {
    if (window.modalManager) {
        window.modalManager.handleConfirmation(modalId, true);
    }
}

function cancelConfirmation(modalId) {
    if (window.modalManager) {
        window.modalManager.handleConfirmation(modalId, false);
    }
}