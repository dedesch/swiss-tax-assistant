// API Client for Swiss Tax Assistant
class TaxAssistantAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = localStorage.getItem('tax_assistant_token');
    }

    // Save tax calculation data
    async saveCalculation(taxYear, data) {
        if (!this.token) {
            showNotification('Please log in to save your progress', 'warning');
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const response = await fetch(`${this.baseURL}/api/calculations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ taxYear, calculationData: data })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Save failed');
            }
            return result;
        } catch (error) {
            console.error('Save error:', error);
            return { success: false, error: error.message };
        }
    }

    // Load saved tax calculation data
    async loadCalculation(taxYear) {
        if (!this.token) {
            showNotification('Please log in to load saved data', 'warning');
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const response = await fetch(`${this.baseURL}/api/calculations?taxYear=${taxYear}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Load failed');
            }
            return result;
        } catch (error) {
            console.error('Load error:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate PDF report
    async generatePDF(calculationData) {
        try {
            const response = await fetch(`${this.baseURL}/api/pdf-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ calculationData })
            });

            if (response.ok) {
                const htmlContent = await response.text();
                const newWindow = window.open('', '_blank');
                newWindow.document.write(htmlContent);
                newWindow.document.close();
                return { success: true };
            } else {
                throw new Error('PDF generation failed');
            }
        } catch (error) {
            console.error('PDF error:', error);
            return { success: false, error: error.message };
        }
    }

    // User login
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/user-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'login', email, password })
            });

            const result = await response.json();
            if (result.success) {
                this.token = result.token;
                localStorage.setItem('tax_assistant_token', result.token);
                localStorage.setItem('user_email', result.user.email);
            }
            return result;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    // User registration
    async register(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/user-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'register', email, password })
            });

            const result = await response.json();
            if (result.success) {
                this.token = result.token;
                localStorage.setItem('tax_assistant_token', result.token);
                localStorage.setItem('user_email', result.user.email);
            }
            return result;
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: error.message };
        }
    }

    // User logout
    logout() {
        this.token = null;
        localStorage.removeItem('tax_assistant_token');
        localStorage.removeItem('user_email');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Get user email
    getUserEmail() {
        return localStorage.getItem('user_email');
    }
}

// Global API instance
window.api = new TaxAssistantAPI();