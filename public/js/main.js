// Main application initialization and tab management
class TaxAssistantApp {
    constructor() {
        this.currentTab = 'landing';
        this.exchangeRates = {
            USD: 0.89,
            EUR: 0.96,
            GBP: 1.12
        };
        this.init();
    }

    async init() {
        // Initialize authentication
        window.authManager = new AuthManager();
        
        // Initialize forms and modals
        window.modalManager = new ModalManager();
        window.formsManager = new FormsManager();
        window.calculationEngine = new CalculationEngine();
        
        // Expose methods globally for component HTML onclick handlers
        window.updateProgress = this.updateProgress.bind(this);
        
        // Setup initial calculations and progress
        this.updateProgress();
        
        console.log('Swiss Tax Assistant initialized successfully');
        
        // Load initial tab content after everything else is ready
        setTimeout(() => {
            this.loadTabContent('overview').catch(error => {
                console.warn('Initial overview load failed, showing fallback content');
                this.createTabContentInline('overview');
            });
        }, 200);
    }

    // Load tab content dynamically
    async loadTabContent(tabName) {
        try {
            const mainContent = document.getElementById('mainContent');
            if (!mainContent) {
                console.error('MainContent element not found, retrying in 100ms...');
                setTimeout(() => this.loadTabContent(tabName), 100);
                return;
            }

            const response = await fetch(`/components/${tabName}.html`);
            if (response.ok) {
                const content = await response.text();
                mainContent.innerHTML = content;
                
                // Note: Component scripts are handled by centralized managers instead of eval
                
                // Reinitialize form handlers for the new content with error handling
                try {
                    if (window.formsManager) {
                        window.formsManager.initializeFormHandlers();
                    }
                } catch (error) {
                    console.warn(`Forms manager initialization failed for ${tabName}:`, error);
                }
                
                try {
                    // Skip calculations for marketing tabs
                    if (window.calculationEngine && tabName !== 'landing' && tabName !== 'pricing') {
                        window.calculationEngine.calculateTotals();
                        
                        // Update quick summary if on calculate tab
                        if (tabName === 'calculate') {
                            setTimeout(() => window.calculationEngine.updateQuickSummary(), 100);
                        }
                    }
                } catch (error) {
                    console.warn(`Calculation engine failed for ${tabName}:`, error);
                }
                this.updateProgress();
                
                // Tab-specific initialization
                if (tabName === 'document-upload') {
                    setTimeout(() => this.initDocumentUploadHandlers(), 100);
                }
                
                // Update active tab in navigation
                this.updateActiveTab(tabName);
                this.currentTab = tabName;
            } else {
                console.warn(`Failed to load component ${tabName}.html (${response.status}), using fallback`);
                this.createTabContentInline(tabName);
            }
        } catch (error) {
            console.error(`Error loading tab ${tabName}:`, error);
            this.createTabContentInline(tabName);
        }
    }

    // Create tab content inline as fallback
    createTabContentInline(tabName) {
        const content = this.getInlineTabContent(tabName);
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = content;
        }
        this.updateActiveTab(tabName);
        this.currentTab = tabName;
    }

    // Component-specific initialization (removed eval for security)
    initializeComponentSpecificLogic(tabName) {
        // Handle any component-specific initialization without eval
        if (tabName === 'calculate' && window.calculationEngine) {
            // Initialize calculate tab specific features
            setTimeout(() => {
                if (window.calculationEngine.updateQuickSummary) {
                    window.calculationEngine.updateQuickSummary();
                }
            }, 100);
        } else if (tabName === 'document-upload') {
            // Initialize document upload handlers
            this.initDocumentUploadHandlers();
        }
    }

    // Update active tab styling
    updateActiveTab(tabName) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Find the tab button by onclick attribute or text content
        const targetTab = Array.from(document.querySelectorAll('.nav-tab')).find(tab => {
            return tab.getAttribute('onclick')?.includes(`'${tabName}'`);
        });
        
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    // Get inline content for tabs (fallback)
    getInlineTabContent(tabName) {
        const contents = {
            landing: this.getLandingFallbackContent(),
            pricing: this.getPricingFallbackContent(),
            overview: this.getOverviewContent(),
            'main-declaration': this.getMainDeclarationContent(),
            securities: this.getSecuritiesContent(),
            properties: this.getPropertiesContent(),
            'property-maintenance': this.getPropertyMaintenanceContent(),
            'professional-costs': this.getProfessionalCostsContent(),
            debts: this.getDebtsContent(),
            pensions: this.getPensionsContent(),
            'document-upload': this.getFallbackDocumentUploadContent(),
            calculate: this.getCalculateContent()
        };
        
        return contents[tabName] || '<div class="form-section"><h3>Content Loading...</h3></div>';
    }

    getOverviewContent() {
        return `
            <div id="overview" class="tab-content active">
                <div class="form-section">
                    <h3>Welcome to Your Swiss Tax Assistant</h3>
                    <p>This tool will help you navigate the Swiss tax declaration process, particularly for complex situations involving:</p>
                    <ul style="margin: 15px 0 15px 30px; line-height: 1.6;">
                        <li>International assets and properties</li>
                        <li>Foreign currency investments</li>
                        <li>Business vs private asset classification</li>
                        <li>Multiple bank accounts and mortgages</li>
                        <li>Stock compensation plans</li>
                    </ul>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressBar"></div>
                    </div>
                    <p style="text-align: center; color: #6c757d;">Progress: <span id="progressText">0%</span></p>
                </div>

                <div class="form-section">
                    <h3>Personal Information</h3>
                    <div class="form-group">
                        <div>
                            <label>First Name</label>
                            <input type="text" id="firstName" onchange="updateProgress()">
                        </div>
                        <div>
                            <label>Last Name</label>
                            <input type="text" id="lastName" onchange="updateProgress()">
                        </div>
                    </div>
                    <div class="form-group">
                        <div>
                            <label>Address</label>
                            <input type="text" id="address" onchange="updateProgress()">
                        </div>
                        <div>
                            <label>Tax Year</label>
                            <select id="taxYear" onchange="updateProgress()">
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="btn btn-success" onclick="saveProgress()">💾 Save Progress</button>
                        <button class="btn btn-secondary" onclick="loadProgress()">📂 Load Saved Data</button>
                    </div>
                </div>

                <div class="info">
                    <strong>Getting Started:</strong> Fill out each section systematically. The tool will automatically classify your assets and debts, handle currency conversions, and generate the appropriate Swiss tax forms. Register to save your progress!
                </div>
            </div>
        `;
    }

    // Progress tracking
    // Initialize document upload handlers
    initDocumentUploadHandlers() {
        if (window.documentUploadManager) {
            window.documentUploadManager.initializeUploadInterface();
        }
        
        // Make sure global handlers are available
        if (!window.applyExtractedData) {
            window.applyExtractedData = function() {
                if (window.documentUploadManager && window.documentUploadManager.currentExtractionResults) {
                    window.documentUploadManager.applyDataToForms();
                }
            };
        }
        
        if (!window.reviewData) {
            window.reviewData = function() {
                if (window.documentUploadManager && window.documentUploadManager.currentExtractionResults) {
                    window.documentUploadManager.showReviewModal();
                }
            };
        }
        
        if (!window.clearResults) {
            window.clearResults = function() {
                if (window.documentUploadManager) {
                    window.documentUploadManager.resetInterface();
                    showNotification('Results cleared', 'info');
                }
            };
        }
    }

    updateProgress() {
        const fields = [
            'firstName', 'lastName', 'address', 'bankAccountsCHF', 'stockValueUSD',
            'swissAddress', 'swissTaxValue', 'swissMortgage'
        ];
        
        let filledFields = 0;
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.value.trim() !== '') {
                filledFields++;
            }
        });

        const progress = (filledFields / fields.length) * 100;
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (progressBar) progressBar.style.width = progress + '%';
        if (progressText) progressText.textContent = Math.round(progress) + '%';
    }

    // Get assets content (simplified for fallback)
    // Swiss tax form method stubs (fallback content)
    getMainDeclarationContent() {
        return `
            <div class="form-section">
                <h3>Steuererklärung - Main Tax Declaration</h3>
                <p>Please use the main declaration component for detailed entry. This is a fallback view.</p>
            </div>
        `;
    }

    getSecuritiesContent() {
        return `
            <div class="form-section">
                <h3>Wertschriften - Securities Register</h3>
                <p>Please use the securities component for detailed entry. This is a fallback view.</p>
            </div>
        `;
    }

    getPropertyMaintenanceContent() {
        return `
            <div class="form-section">
                <h3>Liegenschaftsunterhalt - Property Maintenance</h3>
                <p>Please use the property maintenance component for detailed entry. This is a fallback view.</p>
            </div>
        `;
    }

    getProfessionalCostsContent() {
        return `
            <div class="form-section">
                <h3>Berufskosten - Professional Costs</h3>
                <p>Please use the professional costs component for detailed entry. This is a fallback view.</p>
            </div>
        `;
    }

    getPensionsContent() {
        return `
            <div class="form-section">
                <h3>Renten und Ersatzeinkünfte - Pensions & Benefits</h3>
                <p>Please use the pensions component for detailed entry. This is a fallback view.</p>
            </div>
        `;
    }

    getPropertiesContent() {
        return `
            <div class="form-section">
                <h3>Swiss Properties</h3>
                <div class="form-group">
                    <div>
                        <label>Property Address</label>
                        <input type="text" id="swissAddress" onchange="calculateTotals()">
                    </div>
                    <div>
                        <label>Official Tax Value (CHF)</label>
                        <input type="number" id="swissTaxValue" step="0.01" onchange="calculateTotals()">
                    </div>
                </div>
            </div>
        `;
    }

    getDebtsContent() {
        return `
            <div class="form-section">
                <h3>Mortgage & Loan Information</h3>
                <div class="form-group">
                    <div>
                        <label>Swiss Mortgage Balance (CHF)</label>
                        <input type="number" id="swissMortgage" step="0.01" onchange="calculateTotals()">
                    </div>
                    <div>
                        <label>Swiss Mortgage Interest Paid 2024 (CHF)</label>
                        <input type="number" id="swissMortgageInterest" step="0.01" onchange="calculateTotals()">
                    </div>
                </div>
            </div>
        `;
    }

    getDocumentUploadContent() {
        // Load the document upload component
        return this.loadComponentFile('document-upload');
    }

    getLandingFallbackContent() {
        return `
            <div class="form-section">
                <h1>Swiss Tax Assistant</h1>
                <p>AI-Powered Tax Declaration for Canton Aargau</p>
                <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <strong>Component Loading Error:</strong> The landing page could not be loaded. 
                    Please refresh the page or contact support if this issue persists.
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                </div>
            </div>
        `;
    }

    getPricingFallbackContent() {
        return `
            <div class="form-section">
                <h2>Pricing Plans</h2>
                <p>Choose the plan that's right for you</p>
                <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <strong>Component Loading Error:</strong> The pricing page could not be loaded. 
                    Please refresh the page or contact support if this issue persists.
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                </div>
            </div>
        `;
    }

    getFallbackDocumentUploadContent() {
        return `
            <div class="form-section">
                <h3>📄 Document Upload & Auto-Fill</h3>
                <p>Upload your Swiss tax documents to automatically extract and pre-fill relevant information.</p>
                <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <strong>Component Loading Error:</strong> The document upload interface could not be loaded. 
                    Please refresh the page or contact support if this issue persists.
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                </div>
            </div>
        `;
    }

    getCalculateContent() {
        return `
            <div class="form-section">
                <h3>Tax Calculation Summary</h3>
                <div style="text-align: center;">
                    <button class="btn" onclick="generateReport()">📊 Generate Complete Report</button>
                    <button class="btn btn-warning" onclick="downloadPDF()">📄 Download PDF Report</button>
                    <button class="btn btn-success" onclick="saveProgress()">💾 Save Final Results</button>
                </div>
            </div>
            <div class="results-panel" id="resultsPanel" style="display: none;">
                <h4>Wealth Declaration Summary</h4>
                <div id="wealthSummary"></div>
            </div>
        `;
    }
}

// Global functions for HTML onclick handlers
async function showTab(tabName) {
    await window.taxApp.loadTabContent(tabName);
}

function updateProgress() {
    if (window.taxApp) {
        window.taxApp.updateProgress();
    }
}

// Ensure global function bindings are available
window.updateProgress = updateProgress;

function calculateTotals() {
    if (window.calculationEngine) {
        window.calculationEngine.calculateTotals();
    }
}

function saveProgress() {
    if (window.formsManager) {
        window.formsManager.saveProgress();
    }
}

function loadProgress() {
    if (window.formsManager) {
        window.formsManager.loadProgress();
    }
}

function generateReport() {
    if (window.calculationEngine) {
        window.calculationEngine.generateReport();
    }
}

function downloadPDF() {
    if (window.calculationEngine) {
        window.calculationEngine.downloadPDF();
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for DOM to be fully ready and all elements to exist
    function waitForElement() {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            window.taxApp = new TaxAssistantApp();
        } else {
            setTimeout(waitForElement, 50);
        }
    }
    
    // Add a small delay to ensure all DOM parsing is complete
    setTimeout(waitForElement, 100);
});