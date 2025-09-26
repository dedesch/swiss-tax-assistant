// Authentication management
class AuthManager {
    constructor() {
        this.updateAuthUI();
        this.setupEventListeners();
    }

    // Update authentication UI based on login status
    updateAuthUI() {
        const userEmail = api.getUserEmail();
        const userInfo = document.getElementById('userInfo');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (api.isAuthenticated() && userEmail) {
            if (userInfo) {
                userInfo.textContent = `Logged in as: ${userEmail}`;
                userInfo.style.display = 'inline';
            }
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline';
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'inline';
            if (registerBtn) registerBtn.style.display = 'inline';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }

    // Setup form event listeners
    setupEventListeners() {
        // Login form - only bind if element exists
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                const result = await api.login(email, password);
                if (result.success) {
                    showNotification('Login successful!', 'success');
                    closeModal('loginModal');
                    document.getElementById('loginForm').reset();
                    this.updateAuthUI();
                    
                    // Redirect to tax declaration app after successful login
                    setTimeout(() => {
                        window.location.href = '/app';
                    }, 1500);
                } else {
                    showNotification(result.error || 'Login failed', 'error');
                }
            });
        }

        // Register form - only bind if element exists
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('registerEmail').value;
                const password = document.getElementById('registerPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;

                if (password !== confirmPassword) {
                    showNotification('Passwords do not match', 'error');
                    return;
                }

                if (password.length < 6) {
                    showNotification('Password must be at least 6 characters', 'error');
                    return;
                }

                const result = await api.register(email, password);
                if (result.success) {
                    showNotification('Registration successful!', 'success');
                    closeModal('registerModal');
                    document.getElementById('registerForm').reset();
                    this.updateAuthUI();
                    
                    // Redirect to tax declaration app after successful registration
                    setTimeout(() => {
                        window.location.href = '/app';
                    }, 1500);
                } else {
                    showNotification(result.error || 'Registration failed', 'error');
                }
            });
        }
    }

    // Handle logout
    async logout() {
        api.logout();
        this.updateAuthUI();
        showNotification('Logged out successfully', 'success');
    }
}

// Global functions for HTML onclick handlers
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function logout() {
    window.authManager.logout();
}