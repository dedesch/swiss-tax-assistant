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
            userInfo.textContent = `Logged in as: ${userEmail}`;
            userInfo.style.display = 'inline';
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'inline';
        } else {
            userInfo.style.display = 'none';
            loginBtn.style.display = 'inline';
            registerBtn.style.display = 'inline';
            logoutBtn.style.display = 'none';
        }
    }

    // Setup form event listeners
    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
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

        // Register form
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
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