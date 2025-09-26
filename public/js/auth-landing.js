// Authentication functionality for landing page

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// Show inline authentication section
function showInlineAuth(defaultTab = 'login') {
    const authSection = document.getElementById('inline-auth-section');
    if (authSection) {
        authSection.classList.remove('hidden');
        showInlineAuthTab(defaultTab);
        authSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Hide inline authentication section
function hideInlineAuth() {
    const authSection = document.getElementById('inline-auth-section');
    if (authSection) {
        authSection.classList.add('hidden');
    }
}

// Switch between login and register tabs for inline auth
function showInlineAuthTab(tab) {
    const loginForm = document.getElementById('inline-login-form');
    const registerForm = document.getElementById('inline-register-form');
    const tabLogin = document.getElementById('inline-tab-login');
    const tabRegister = document.getElementById('inline-tab-register');
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.add('bg-swiss-red', 'text-white');
        tabLogin.classList.remove('text-gray-600');
        tabRegister.classList.remove('bg-swiss-red', 'text-white');
        tabRegister.classList.add('text-gray-600');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabRegister.classList.add('bg-swiss-red', 'text-white');
        tabRegister.classList.remove('text-gray-600');
        tabLogin.classList.remove('bg-swiss-red', 'text-white');
        tabLogin.classList.add('text-gray-600');
    }
}

// Scroll to section functionality
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// FAQ toggle functionality
function toggleFAQ(button) {
    const content = button.parentElement.querySelector('div');
    const icon = button.querySelector('svg');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

// Make functions globally accessible
window.toggleMobileMenu = toggleMobileMenu;
window.showInlineAuth = showInlineAuth;
window.hideInlineAuth = hideInlineAuth;
window.showInlineAuthTab = showInlineAuthTab;
window.scrollToSection = scrollToSection;
window.toggleFAQ = toggleFAQ;

// Handle authentication form submission
async function handleAuthSubmission(formType, email, password, confirmPassword = null) {
    if (formType === 'register' && password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch('/api/user-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                action: formType,
                email, 
                password 
            }),
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                window.location.href = '/app';
            } else {
                alert(`${formType === 'login' ? 'Login' : 'Registration'} failed: Invalid credentials`);
            }
        } else {
            const error = await response.json();
            alert(`${formType === 'login' ? 'Login' : 'Registration'} failed: ` + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error(`${formType} error:`, error);
        alert(`${formType === 'login' ? 'Login' : 'Registration'} failed. Please try again.`);
    }
}

// Setup authentication forms
function setupAuthForms() {
    // Inline Login form handler
    const inlineLoginForm = document.getElementById('inlineLoginForm');
    if (inlineLoginForm) {
        inlineLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('inlineLoginEmail').value;
            const password = document.getElementById('inlineLoginPassword').value;
            await handleAuthSubmission('login', email, password);
        });
    }
    
    // Inline Register form handler  
    const inlineRegisterForm = document.getElementById('inlineRegisterForm');
    if (inlineRegisterForm) {
        inlineRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('inlineRegisterEmail').value;
            const password = document.getElementById('inlineRegisterPassword').value;
            const confirmPassword = document.getElementById('inlineConfirmPassword').value;
            await handleAuthSubmission('register', email, password, confirmPassword);
        });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupAuthForms();
    
    // Header auth button handlers
    const headerLoginBtn = document.getElementById('header-login-btn');
    const headerRegisterBtn = document.getElementById('header-register-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileRegisterBtn = document.getElementById('mobile-register-btn');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    if (headerLoginBtn) {
        headerLoginBtn.addEventListener('click', () => showInlineAuth('login'));
    }
    
    if (headerRegisterBtn) {
        headerRegisterBtn.addEventListener('click', () => showInlineAuth('register'));
    }
    
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', () => {
            toggleMobileMenu();
            showInlineAuth('login');
        });
    }
    
    if (mobileRegisterBtn) {
        mobileRegisterBtn.addEventListener('click', () => {
            toggleMobileMenu();
            showInlineAuth('register');
        });
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                toggleMobileMenu();
            }
        });
    });
});