// Main application initialization and tab management
class TaxAssistantApp {
    constructor() {
        this.currentTab = 'overview';
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
        
        // Load initial tab content
        await this.loadTabContent('overview');
        
        // Setup initial calculations and progress
        this.updateProgress();
        
        console.log('Swiss Tax Assistant initialized successfully');
    }

    // Load tab content dynamically
    async loadTabContent(tabName) {
        try {
            const response = await fetch(`components/${tabName}.html`);
            if (response.ok) {
                const content = await response.text();
                document.getElementById('mainContent').innerHTML = content;
                
                // Reinitialize form handlers for the new content
                window.formsManager.initializeFormHandlers();
                window.calculationEngine.calculateTotals();
                this.updateProgress();
                
                // Update active tab in navigation
                this.updateActiveTab(tabName);
                this.currentTab = tabName;
            } else {
                // Fallback: create tab content inline if component files don't exist
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
        document.getElementById('mainContent').innerHTML = content;
        this.updateActiveTab(tabName);
        this.currentTab = tabName;
    }

    // Update active tab styling
    updateActiveTab(tabName) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        event?.target?.classList.add('active');
    }

    // Get inline content for tabs (fallback)
    getInlineTabContent(tabName) {
        const contents = {
            overview: this.getOverviewContent(),
            assets: this.getAssetsContent(),
            properties: this.getPropertiesContent(),
            debts: this.getDebtsContent(),
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
    getAssetsContent() {
        return `
            <div class="form-section">
                <h3>Securities & Bank Accounts</h3>
                <div class="translation-help">Wertschriften und Guthaben - Securities and Credit Balances</div>
                
                <div class="form-group">
                    <div>
                        <label>Total Bank Accounts (CHF)</label>
                        <input type="number" id="bankAccountsCHF" step="0.01" onchange="calculateTotals()">
                    </div>
                    <div>
                        <label>Stock Holdings Value (USD)</label>
                        <input type="number" id="stockValueUSD" step="0.01" onchange="calculateTotals()">
                        <div class="chf-equivalent" id="stockCHFEquivalent">CHF: 0.00</div>
                    </div>
                </div>

                <div class="form-group">
                    <div>
                        <label>Pillar 3a Value (CHF)</label>
                        <input type="number" id="pillar3a" step="0.01" onchange="calculateTotals()">
                    </div>
                    <div>
                        <label>Vehicle Value (CHF)</label>
                        <input type="number" id="vehicleValue" step="0.01" onchange="calculateTotals()">
                    </div>
                </div>
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
    window.taxApp.updateProgress();
}

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
    window.taxApp = new TaxAssistantApp();
});