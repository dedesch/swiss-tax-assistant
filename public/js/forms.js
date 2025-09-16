// Form management for Swiss Tax Assistant
class FormsManager {
    constructor() {
        this.initializeEventListeners();
    }

    // Initialize form event handlers
    initializeFormHandlers() {
        // Property management buttons
        this.setupPropertyHandlers();
        
        // Auto-save functionality
        this.setupAutoSave();
        
        // Form validation
        this.setupValidation();
    }

    // Setup property section handlers
    setupPropertyHandlers() {
        // Add property button
        const addBtn = document.querySelector('.add-property-btn');
        if (addBtn) {
            addBtn.onclick = () => this.addForeignProperty();
        }

        // Remove property buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.onclick = (e) => this.removeProperty(e.target);
        });
    }

    // Add new foreign property section
    addForeignProperty() {
        const container = document.getElementById('foreignProperties');
        if (!container) return;

        const propertyCount = container.children.length + 1;
        
        const propertyHTML = `
            <div class="property-section">
                <div class="property-header">
                    <strong>Foreign Property #${propertyCount}</strong>
                    <button class="btn remove-btn" onclick="removeProperty(this)">Remove</button>
                </div>
                <div class="form-group">
                    <div>
                        <label>Country</label>
                        <select class="propertyCountry" onchange="calculateTotals()">
                            <option value="">Select Country</option>
                            <option value="FR">France</option>
                            <option value="DE">Germany</option>
                            <option value="IT">Italy</option>
                            <option value="US">United States</option>
                            <option value="AT">Austria</option>
                            <option value="UK">United Kingdom</option>
                        </select>
                    </div>
                    <div>
                        <label>Property Address</label>
                        <input type="text" class="propertyAddress" placeholder="Full property address">
                    </div>
                </div>
                <div class="form-group">
                    <div>
                        <label>Property Value (Local Currency)</label>
                        <input type="number" class="propertyValue" step="0.01" onchange="calculateTotals()" placeholder="Property market value">
                    </div>
                    <div>
                        <label>Currency</label>
                        <select class="propertyCurrency" onchange="calculateTotals()">
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <div>
                        <label>Annual Rental Income (Local Currency)</label>
                        <input type="number" class="rentalIncome" step="0.01" onchange="calculateTotals()" placeholder="Annual rental income">
                    </div>
                    <div>
                        <label>Property Type</label>
                        <select class="foreignPropertyType" onchange="calculateTotals()">
                            <option value="personal">Personal Use</option>
                            <option value="rental">Rental Business</option>
                            <option value="mixed">Mixed Use</option>
                        </select>
                    </div>
                </div>
                <div class="chf-equivalent propertyEquivalent">CHF Value: 0.00</div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', propertyHTML);
        
        // Recalculate totals after adding property
        if (window.calculationEngine) {
            window.calculationEngine.calculateTotals();
        }
    }

    // Remove property section
    removeProperty(button) {
        const propertySection = button.closest('.property-section');
        if (propertySection) {
            propertySection.remove();
            
            // Recalculate totals after removal
            if (window.calculationEngine) {
                window.calculationEngine.calculateTotals();
            }
        }
    }

    // Setup auto-save functionality
    setupAutoSave() {
        let saveTimeout;
        const autoSaveDelay = 30000; // 30 seconds

        const triggerAutoSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                if (api.isAuthenticated()) {
                    this.saveProgress(false); // Silent save
                }
            }, autoSaveDelay);
        };

        // Add auto-save to important fields
        const importantFields = [
            'bankAccountsCHF', 'stockValueUSD', 'swissTaxValue', 
            'swissMortgage', 'foreignMortgageEUR'
        ];

        importantFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', triggerAutoSave);
            }
        });
    }

    // Setup form validation
    setupValidation() {
        // Email validation for auth forms
        const emailFields = ['loginEmail', 'registerEmail'];
        emailFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', this.validateEmail);
            }
        });

        // Number validation for financial fields
        const numberFields = document.querySelectorAll('input[type="number"]');
        numberFields.forEach(field => {
            field.addEventListener('blur', this.validateNumber);
            field.addEventListener('input', this.formatCurrency);
        });
    }

    // Email validation
    validateEmail(event) {
        const email = event.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            event.target.style.borderColor = '#dc3545';
            showNotification('Please enter a valid email address', 'warning');
        } else {
            event.target.style.borderColor = '#e9ecef';
        }
    }

    // Number validation
    validateNumber(event) {
        const value = parseFloat(event.target.value);
        
        if (event.target.value && (isNaN(value) || value < 0)) {
            event.target.style.borderColor = '#dc3545';
            showNotification('Please enter a valid positive number', 'warning');
        } else {
            event.target.style.borderColor = '#e9ecef';
        }
    }

    // Format currency display
    formatCurrency(event) {
        const value = event.target.value;
        if (value && !isNaN(value)) {
            // Add visual feedback for large numbers
            const numValue = parseFloat(value);
            if (numValue > 1000000) {
                event.target.style.backgroundColor = '#fff3cd'; // Warning yellow
            } else {
                event.target.style.backgroundColor = '';
            }
        }
    }

    // Save progress to backend
    async saveProgress(showMessage = true) {
        try {
            const formData = this.gatherAllFormData();
            const result = await api.saveCalculation(formData.taxYear, formData);
            
            if (result.success) {
                if (showMessage) {
                    showNotification('Progress saved successfully!', 'success');
                }
                
                // Update save timestamp
                localStorage.setItem('last_saved', new Date().toISOString());
                this.updateSaveStatus();
            } else {
                if (showMessage) {
                    showNotification(result.error || 'Failed to save progress', 'error');
                }
            }
        } catch (error) {
            console.error('Save error:', error);
            if (showMessage) {
                showNotification('Failed to save progress', 'error');
            }
        }
    }

    // Load progress from backend
    async loadProgress() {
        try {
            const taxYear = document.getElementById('taxYear')?.value || 2024;
            const result = await api.loadCalculation(taxYear);
            
            if (result.success && result.data) {
                const data = result.data.data;
                
                // Populate basic form fields
                Object.keys(data).forEach(key => {
                    const element = document.getElementById(key);
                    if (element && data[key] !== undefined && data[key] !== '') {
                        element.value = data[key];
                    }
                });
                
                // Handle foreign properties
                if (data.foreignProperties && data.foreignProperties.length > 0) {
                    this.populateForeignProperties(data.foreignProperties);
                }
                
                // Recalculate all totals
                if (window.calculationEngine) {
                    window.calculationEngine.calculateTotals();
                }
                
                if (window.taxApp) {
                    window.taxApp.updateProgress();
                }
                
                showNotification('Data loaded successfully!', 'success');
                this.updateSaveStatus();
            } else {
                showNotification('No saved data found for this tax year', 'warning');
            }
        } catch (error) {
            console.error('Load error:', error);
            showNotification('Failed to load saved data', 'error');
        }
    }

    // Populate foreign properties from saved data
    populateForeignProperties(properties) {
        const container = document.getElementById('foreignProperties');
        if (!container || properties.length === 0) return;

        // Clear existing properties except first one
        const firstProperty = container.children[0];
        container.innerHTML = '';
        if (firstProperty) {
            container.appendChild(firstProperty);
        }
        
        // Populate properties
        properties.forEach((property, index) => {
            if (index === 0 && firstProperty) {
                // Update first property
                this.populatePropertySection(firstProperty, property);
            } else {
                // Add new property
                this.addForeignProperty();
                const newSection = container.children[container.children.length - 1];
                this.populatePropertySection(newSection, property);
            }
        });
    }

    // Populate individual property section
    populatePropertySection(section, property) {
        const fields = {
            '.propertyCountry': property.country,
            '.propertyAddress': property.address,
            '.propertyValue': property.value,
            '.propertyCurrency': property.currency,
            '.rentalIncome': property.rentalIncome,
            '.foreignPropertyType': property.type
        };

        Object.keys(fields).forEach(selector => {
            const element = section.querySelector(selector);
            if (element && fields[selector] !== undefined) {
                element.value = fields[selector];
            }
        });
    }

    // Update save status indicator
    updateSaveStatus() {
        const lastSaved = localStorage.getItem('last_saved');
        if (lastSaved) {
            const savedDate = new Date(lastSaved);
            const now = new Date();
            const diffMinutes = Math.floor((now - savedDate) / 60000);
            
            let statusText = '';
            if (diffMinutes < 1) {
                statusText = 'Saved just now';
            } else if (diffMinutes < 60) {
                statusText = `Saved ${diffMinutes} minutes ago`;
            } else {
                const diffHours = Math.floor(diffMinutes / 60);
                statusText = `Saved ${diffHours} hours ago`;
            }
            
            // Update UI with save status if element exists
            const statusElement = document.getElementById('saveStatus');
            if (statusElement) {
                statusElement.textContent = statusText;
            }
        }
    }

    // Gather all form data
    gatherAllFormData() {
        if (window.calculationEngine) {
            return window.calculationEngine.gatherAllData();
        }
        
        // Fallback basic data gathering
        return {
            taxYear: document.getElementById('taxYear')?.value || 2024,
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            address: document.getElementById('address')?.value || '',
            bankAccountsCHF: parseFloat(document.getElementById('bankAccountsCHF')?.value || 0),
            stockValueUSD: parseFloat(document.getElementById('stockValueUSD')?.value || 0),
            swissTaxValue: parseFloat(document.getElementById('swissTaxValue')?.value || 0),
            swissMortgage: parseFloat(document.getElementById('swissMortgage')?.value || 0),
            foreignProperties: []
        };
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Form submission handlers are setup in auth.js
        // This method can be extended for additional form events
        
        // Setup keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveProgress();
            }
            
            // Ctrl+L to load
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.loadProgress();
            }
        });
    }
}

// Global functions for HTML onclick handlers
function addForeignProperty() {
    if (window.formsManager) {
        window.formsManager.addForeignProperty();
    }
}

function removeProperty(button) {
    if (window.formsManager) {
        window.formsManager.removeProperty(button);
    }
}