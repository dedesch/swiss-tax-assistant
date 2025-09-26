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
            // Update navigation state first
            this.updateNavigation(tabName);
            
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
        // Updated for Tailwind CSS styling
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            item.classList.remove('bg-swiss-red', 'text-white');
            item.classList.add('text-gray-700', 'hover:bg-gray-50');
        });
        
        // Find the navigation item by onclick attribute
        const targetTab = Array.from(document.querySelectorAll('.nav-item')).find(item => {
            return item.getAttribute('onclick')?.includes(`'${tabName}'`);
        });
        
        if (targetTab) {
            targetTab.classList.add('active');
            targetTab.classList.add('bg-swiss-red', 'text-white');
            targetTab.classList.remove('text-gray-700', 'hover:bg-gray-50');
        }
    }

    // Update navigation state for vertical nav (Tailwind styling)
    updateNavigation(tabName) {
        // Remove active styling from all navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            item.classList.remove('bg-swiss-red', 'text-white');
            item.classList.add('text-gray-700', 'hover:bg-gray-50');
        });
        
        // Add active styling to clicked navigation item
        const activeTab = document.querySelector(`[onclick="showTab('${tabName}')"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.classList.add('bg-swiss-red', 'text-white');
            activeTab.classList.remove('text-gray-700', 'hover:bg-gray-50');
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
            <div id="overview" class="space-y-6">
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Welcome to Your Swiss Tax Assistant</h3>
                    <p class="text-gray-600 mb-4">This tool will help you navigate the Swiss tax declaration process, particularly for complex situations involving:</p>
                    <ul class="space-y-2 text-gray-600 ml-6 list-disc">
                        <li>International assets and properties</li>
                        <li>Foreign currency investments</li>
                        <li>Business vs private asset classification</li>
                        <li>Multiple bank accounts and mortgages</li>
                        <li>Stock compensation plans</li>
                    </ul>
                    
                    <div class="mt-6">
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-swiss-red h-2.5 rounded-full transition-all duration-300" id="progressBar" style="width: 0%"></div>
                        </div>
                        <p class="text-center text-gray-500 mt-2">Progress: <span id="progressText">0%</span></p>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input type="text" id="firstName" onchange="updateProgress()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-swiss-red focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input type="text" id="lastName" onchange="updateProgress()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-swiss-red focus:border-transparent">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input type="text" id="address" onchange="updateProgress()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-swiss-red focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tax Year</label>
                            <select id="taxYear" onchange="updateProgress()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-swiss-red focus:border-transparent">
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="flex justify-center space-x-4 mt-6">
                        <button class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors" onclick="saveProgress()">💾 Save Progress</button>
                        <button class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors" onclick="loadProgress()">📂 Load Saved Data</button>
                    </div>
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p class="text-blue-800"><strong>Getting Started:</strong> Fill out each section systematically. The tool will automatically classify your assets and debts, handle currency conversions, and generate the appropriate Swiss tax forms. Register to save your progress!</p>
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
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Steuererklärung - Main Tax Declaration</h3>
                <p class="text-gray-600">Please use the main declaration component for detailed entry. This is a fallback view.</p>
            </div>
        `;
    }

    getSecuritiesContent() {
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Wertschriften - Securities Register</h3>
                <p class="text-gray-600">Please use the securities component for detailed entry. This is a fallback view.</p>
            </div>
        `;
    }

    getPropertyMaintenanceContent() {
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Liegenschaftsunterhalt - Property Maintenance</h3>
                <p class="text-gray-600">Please use the property maintenance component for detailed entry. This is a fallback view.</p>
            </div>
        `;
    }

    getProfessionalCostsContent() {
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Berufskosten - Professional Costs</h3>
                <p class="text-gray-600">Please use the professional costs component for detailed entry. This is a fallback view.</p>
            </div>
        `;
    }

    getPensionsContent() {
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Renten und Ersatzeinkünfte - Pensions & Benefits</h3>
                <p class="text-gray-600">Please use the pensions component for detailed entry. This is a fallback view.</p>
            </div>
        `;
    }

    getPropertiesContent() {
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Swiss Properties</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                        <input type="text" id="swissAddress" onchange="calculateTotals()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-swiss-red focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Official Tax Value (CHF)</label>
                        <input type="number" id="swissTaxValue" step="0.01" onchange="calculateTotals()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-swiss-red focus:border-transparent">
                    </div>
                </div>
            </div>
        `;
    }

    getDebtsContent() {
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Mortgage & Loan Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Swiss Mortgage Balance (CHF)</label>
                        <input type="number" id="swissMortgage" step="0.01" onchange="calculateTotals()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-swiss-red focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Swiss Mortgage Interest Paid 2024 (CHF)</label>
                        <input type="number" id="swissMortgageInterest" step="0.01" onchange="calculateTotals()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-swiss-red focus:border-transparent">
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
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Swiss Tax Assistant</h1>
                <p class="text-gray-600 mb-4">AI-Powered Tax Declaration for Canton Aargau</p>
                <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
                    <strong>Component Loading Error:</strong> The landing page could not be loaded. 
                    Please refresh the page or contact support if this issue persists.
                </div>
                <div class="text-center">
                    <button class="bg-swiss-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors" onclick="location.reload()">Refresh Page</button>
                </div>
            </div>
        `;
    }

    getPricingFallbackContent() {
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Pricing Plans</h2>
                <p class="text-gray-600 mb-4">Choose the plan that's right for you</p>
                <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
                    <strong>Component Loading Error:</strong> The pricing page could not be loaded. 
                    Please refresh the page or contact support if this issue persists.
                </div>
                <div class="text-center">
                    <button class="bg-swiss-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors" onclick="location.reload()">Refresh Page</button>
                </div>
            </div>
        `;
    }

    getFallbackDocumentUploadContent() {
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">📄 Document Upload & Auto-Fill</h3>
                <p class="text-gray-600 mb-4">Upload your Swiss tax documents to automatically extract and pre-fill relevant information.</p>
                <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
                    <strong>Component Loading Error:</strong> The document upload interface could not be loaded. 
                    Please refresh the page or contact support if this issue persists.
                </div>
                <div class="text-center">
                    <button class="bg-swiss-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors" onclick="location.reload()">Refresh Page</button>
                </div>
            </div>
        `;
    }

    getCalculateContent() {
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Tax Calculation Summary</h3>
                <div class="flex flex-wrap justify-center gap-4">
                    <button class="bg-swiss-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors" onclick="generateReport()">📊 Generate Complete Report</button>
                    <button class="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors" onclick="downloadPDF()">📄 Download PDF Report</button>
                    <button class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors" onclick="saveProgress()">💾 Save Final Results</button>
                </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hidden" id="resultsPanel">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">Wealth Declaration Summary</h4>
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