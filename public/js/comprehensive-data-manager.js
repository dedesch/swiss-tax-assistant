// Comprehensive Data Manager for Swiss Tax Assistant
class ComprehensiveDataManager {
    constructor() {
        this.autoSaveInterval = null;
        this.autoSaveEnabled = true;
        this.lastSaveTime = null;
        this.setupAutoSave();
    }

    // Gather all form data comprehensively
    gatherAllFormData() {
        const data = {
            timestamp: new Date().toISOString(),
            
            // Personal Information
            personalInfo: {
                firstName: this.getFieldValue('firstName'),
                lastName: this.getFieldValue('lastName'),
                address: this.getFieldValue('address'),
                taxYear: this.getFieldValue('taxYear', '2024'),
                filingStatus: this.getFieldValue('filingStatus', 'single')
            },

            // Family Information
            familyInfo: this.getFamilyData(),

            // Income Information  
            incomeInfo: {
                employmentIncome: this.getNumericValue('employmentIncome'),
                selfEmploymentIncome: this.getNumericValue('selfEmploymentIncome'),
                rentalIncome: this.getNumericValue('rentalIncome'),
                dividendsUSD: this.getNumericValue('dividendsUSD'),
                interestIncome: this.getNumericValue('interestIncome'),
                otherIncome: this.getNumericValue('otherIncome')
            },

            // Assets Information
            assetsInfo: {
                bankAccountsCHF: this.getNumericValue('bankAccountsCHF'),
                stockValueUSD: this.getNumericValue('stockValueUSD'),
                pillar3a: this.getNumericValue('pillar3a'),
                vehicleValue: this.getNumericValue('vehicleValue'),
                usdRate: this.getNumericValue('usdRate', 0.89),
                eurRate: this.getNumericValue('eurRate', 0.96)
            },

            // Swiss Properties
            swissProperties: this.getSwissPropertiesData(),

            // Foreign Properties
            foreignProperties: this.getForeignPropertiesData(),

            // Securities
            securities: this.getSecuritiesData(),

            // Debts Information
            debtsInfo: {
                swissMortgage: this.getNumericValue('swissMortgage'),
                swissMortgageInterest: this.getNumericValue('swissMortgageInterest'),
                personalLoans: this.getNumericValue('personalLoans'),
                personalLoanInterest: this.getNumericValue('personalLoanInterest'),
                foreignMortgageEUR: this.getNumericValue('foreignMortgageEUR'),
                foreignMortgageInterest: this.getNumericValue('foreignMortgageInterest')
            },

            // Professional Costs
            professionalCosts: this.getProfessionalCostsData(),

            // Pensions Information
            pensionsInfo: this.getPensionsData(),

            // Insurance Information
            insuranceInfo: {
                insurancePremiums: this.getNumericValue('insurancePremiums'),
                healthInsurance: this.getNumericValue('healthInsurance'),
                lifeInsurance: this.getNumericValue('lifeInsurance')
            },

            // Tax Form Specific Data
            taxFormData: this.getTaxFormSpecificData()
        };

        return data;
    }

    // Get family data including spouse and children
    getFamilyData() {
        const familyData = {
            spouse: null,
            children: []
        };

        // Spouse information
        if (this.getFieldValue('filingStatus') === 'married') {
            familyData.spouse = {
                firstName: this.getFieldValue('detailedSpouseFirstName') || this.getFieldValue('spouseFirstName'),
                lastName: this.getFieldValue('detailedSpouseLastName') || this.getFieldValue('spouseLastName'),
                dateOfBirth: this.getFieldValue('spouseDateOfBirth'),
                placeOfBirth: this.getFieldValue('spousePlaceOfBirth'),
                nationality: this.getFieldValue('spouseNationality'),
                employmentStatus: this.getFieldValue('spouseEmploymentStatus'),
                annualIncome: this.getNumericValue('spouseIncome'),
                ahvNumber: this.getFieldValue('spouseAHVNumber')
            };
        }

        // Children information
        const childrenCount = parseInt(this.getFieldValue('familyChildrenCount', '0'));
        for (let i = 0; i < childrenCount; i++) {
            const child = {
                firstName: this.getFieldValue(`child${i}FirstName`),
                lastName: this.getFieldValue(`child${i}LastName`),
                dateOfBirth: this.getFieldValue(`child${i}DateOfBirth`),
                placeOfBirth: this.getFieldValue(`child${i}PlaceOfBirth`),
                nationality: this.getFieldValue(`child${i}Nationality`),
                school: this.getFieldValue(`child${i}School`),
                specialNeeds: this.getFieldValue(`child${i}SpecialNeeds`),
                childcareCosts: this.getNumericValue(`child${i}ChildcareCosts`)
            };
            
            if (child.firstName || child.lastName) {
                familyData.children.push(child);
            }
        }

        return familyData;
    }

    // Get Swiss properties data
    getSwissPropertiesData() {
        const properties = [];
        
        // Get properties from properties template/section
        document.querySelectorAll('.property-item:not(#propertyTemplate)').forEach(property => {
            const propertyData = {
                address: this.getFieldValueFromElement(property, '.propertyAddress'),
                municipality: this.getFieldValueFromElement(property, '.propertyMunicipality'),
                canton: this.getFieldValueFromElement(property, '.propertyCanton'),
                parcelNumber: this.getFieldValueFromElement(property, '.propertyParcel'),
                usage: this.getFieldValueFromElement(property, '.propertyUsage'),
                ownershipPct: this.getNumericValueFromElement(property, '.ownershipPct'),
                marketRent: this.getNumericValueFromElement(property, '.marketRent'),
                actualRentalIncome: this.getNumericValueFromElement(property, '.actualRentalIncome'),
                ancillaryCosts: this.getNumericValueFromElement(property, '.ancillaryCosts'),
                propertyTaxValue: this.getNumericValueFromElement(property, '.propertyTaxValue'),
                purchaseDate: this.getFieldValueFromElement(property, '.purchaseDate'),
                energyLabel: this.getFieldValueFromElement(property, '.energyLabel')
            };
            
            if (propertyData.address || propertyData.propertyTaxValue > 0) {
                properties.push(propertyData);
            }
        });

        return properties;
    }

    // Get foreign properties data
    getForeignPropertiesData() {
        const properties = [];
        
        document.querySelectorAll('.property-section').forEach(property => {
            const propertyData = {
                country: this.getFieldValueFromElement(property, '.propertyCountry'),
                address: this.getFieldValueFromElement(property, '.propertyAddress'),
                value: this.getNumericValueFromElement(property, '.propertyValue'),
                currency: this.getFieldValueFromElement(property, '.propertyCurrency'),
                rentalIncome: this.getNumericValueFromElement(property, '.rentalIncome'),
                propertyType: this.getFieldValueFromElement(property, '.foreignPropertyType')
            };
            
            if (propertyData.country || propertyData.value > 0) {
                properties.push(propertyData);
            }
        });

        return properties;
    }

    // Get securities data
    getSecuritiesData() {
        const securities = [];
        
        document.querySelectorAll('.security-item:not(#securityTemplate)').forEach(security => {
            const securityData = {
                name: this.getFieldValueFromElement(security, '.securityName'),
                quantity: this.getNumericValueFromElement(security, '.securityQuantity'),
                price: this.getNumericValueFromElement(security, '.securityPrice'),
                currency: this.getFieldValueFromElement(security, '.securityCurrency'),
                dividendIncome: this.getNumericValueFromElement(security, '.dividendIncome'),
                shareholdingPct: this.getNumericValueFromElement(security, '.shareholdingPct'),
                qualified: this.getFieldValueFromElement(security, '.qualifiedDividend') === 'true'
            };
            
            if (securityData.name || securityData.quantity > 0) {
                securities.push(securityData);
            }
        });

        return securities;
    }

    // Get professional costs data
    getProfessionalCostsData() {
        const costs = {
            standardDeduction: this.getNumericValue('standardProfessionalDeduction'),
            mealAllowances: this.getNumericValue('mealAllowances'),
            vehicleExpenses: this.getNumericValue('vehicleExpenses'),
            publicTransport: this.getNumericValue('publicTransport'),
            workClothing: this.getNumericValue('workClothing'),
            toolsEquipment: this.getNumericValue('toolsEquipment'),
            continuingEducation: this.getNumericValue('continuingEducation'),
            otherProfessionalCosts: []
        };

        // Get other professional costs
        document.querySelectorAll('.other-cost-item').forEach(costItem => {
            const cost = {
                description: this.getFieldValueFromElement(costItem, '.costDescription'),
                amount: this.getNumericValueFromElement(costItem, '.costAmount'),
                category: this.getFieldValueFromElement(costItem, '.costCategory')
            };
            
            if (cost.description || cost.amount > 0) {
                costs.otherProfessionalCosts.push(cost);
            }
        });

        return costs;
    }

    // Get pensions data
    getPensionsData() {
        const pensions = [];
        
        document.querySelectorAll('.pension-item:not(#pensionTemplate)').forEach(pension => {
            const pensionData = {
                type: this.getFieldValueFromElement(pension, '.pensionType'),
                provider: this.getFieldValueFromElement(pension, '.pensionProvider'),
                annualAmount: this.getNumericValueFromElement(pension, '.pensionAmount'),
                startDate: this.getFieldValueFromElement(pension, '.pensionStartDate'),
                taxable: this.getFieldValueFromElement(pension, '.pensionTaxable') === 'true'
            };
            
            if (pensionData.provider || pensionData.annualAmount > 0) {
                pensions.push(pensionData);
            }
        });

        return pensions;
    }

    // Get tax form specific data that might be populated by document processing
    getTaxFormSpecificData() {
        return {
            gross_salary_annual: this.getNumericValue('gross_salary_annual'),
            closing_balance: this.getNumericValue('closing_balance'),
            outstanding_balance: this.getNumericValue('outstanding_balance'),
            total_portfolio_value: this.getNumericValue('total_portfolio_value'),
            property_tax_assessment: this.getNumericValue('property_tax_assessment'),
            rental_income_annual: this.getNumericValue('rental_income_annual')
        };
    }

    // Helper method to get field value
    getFieldValue(fieldId, defaultValue = '') {
        const element = document.getElementById(fieldId);
        return element ? element.value.trim() : defaultValue;
    }

    // Helper method to get numeric value
    getNumericValue(fieldId, defaultValue = 0) {
        const value = parseFloat(this.getFieldValue(fieldId, '0'));
        return isNaN(value) ? defaultValue : value;
    }

    // Helper method to get field value from element context
    getFieldValueFromElement(parent, selector, defaultValue = '') {
        const element = parent.querySelector(selector);
        return element ? element.value.trim() : defaultValue;
    }

    // Helper method to get numeric value from element context  
    getNumericValueFromElement(parent, selector, defaultValue = 0) {
        const value = parseFloat(this.getFieldValueFromElement(parent, selector, '0'));
        return isNaN(value) ? defaultValue : value;
    }

    // Save comprehensive data
    async saveAllData() {
        if (!window.api || !window.api.isAuthenticated()) {
            console.warn('Cannot save data: user not authenticated');
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const comprehensiveData = this.gatherAllFormData();
            const taxYear = comprehensiveData.personalInfo.taxYear || '2024';

            const result = await window.api.saveCalculation(taxYear, {
                action: 'save',
                taxYear: taxYear,
                data: comprehensiveData
            });

            if (result.success) {
                this.lastSaveTime = new Date();
                console.log('Comprehensive data saved successfully');
                this.showSaveStatus(true);
            } else {
                console.error('Failed to save comprehensive data:', result.error);
                this.showSaveStatus(false, result.error);
            }

            return result;
        } catch (error) {
            console.error('Error saving comprehensive data:', error);
            this.showSaveStatus(false, error.message);
            return { success: false, error: error.message };
        }
    }

    // Load comprehensive data
    async loadAllData() {
        if (!window.api || !window.api.isAuthenticated()) {
            console.warn('Cannot load data: user not authenticated');
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const taxYear = this.getFieldValue('taxYear', '2024');
            const result = await window.api.loadCalculation(taxYear);

            if (result.success && result.data) {
                this.populateFormData(result.data);
                console.log('Comprehensive data loaded successfully');
                showNotification('Data loaded successfully', 'success');
            } else {
                console.log('No saved data found for tax year', taxYear);
            }

            return result;
        } catch (error) {
            console.error('Error loading comprehensive data:', error);
            showNotification('Failed to load data: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    // Populate form data from loaded comprehensive data
    populateFormData(data) {
        // Personal Information
        if (data.personalInfo) {
            this.setFieldValue('firstName', data.personalInfo.firstName);
            this.setFieldValue('lastName', data.personalInfo.lastName);
            this.setFieldValue('address', data.personalInfo.address);
            this.setFieldValue('taxYear', data.personalInfo.taxYear);
            this.setFieldValue('filingStatus', data.personalInfo.filingStatus);
        }

        // Family Information
        if (data.familyInfo) {
            if (data.familyInfo.spouse) {
                const spouse = data.familyInfo.spouse;
                this.setFieldValue('detailedSpouseFirstName', spouse.firstName);
                this.setFieldValue('detailedSpouseLastName', spouse.lastName);
                this.setFieldValue('spouseFirstName', spouse.firstName);
                this.setFieldValue('spouseLastName', spouse.lastName);
                this.setFieldValue('spouseDateOfBirth', spouse.dateOfBirth);
                this.setFieldValue('spousePlaceOfBirth', spouse.placeOfBirth);
                this.setFieldValue('spouseNationality', spouse.nationality);
                this.setFieldValue('spouseEmploymentStatus', spouse.employmentStatus);
                this.setFieldValue('spouseIncome', spouse.annualIncome);
                this.setFieldValue('spouseAHVNumber', spouse.ahvNumber);
            }

            if (data.familyInfo.children && data.familyInfo.children.length > 0) {
                this.setFieldValue('familyChildrenCount', data.familyInfo.children.length);
                
                // Trigger children forms creation if function exists
                if (typeof updateChildrenForms === 'function') {
                    updateChildrenForms();
                }

                // Populate children data
                data.familyInfo.children.forEach((child, i) => {
                    this.setFieldValue(`child${i}FirstName`, child.firstName);
                    this.setFieldValue(`child${i}LastName`, child.lastName);
                    this.setFieldValue(`child${i}DateOfBirth`, child.dateOfBirth);
                    this.setFieldValue(`child${i}PlaceOfBirth`, child.placeOfBirth);
                    this.setFieldValue(`child${i}Nationality`, child.nationality);
                    this.setFieldValue(`child${i}School`, child.school);
                    this.setFieldValue(`child${i}SpecialNeeds`, child.specialNeeds);
                    this.setFieldValue(`child${i}ChildcareCosts`, child.childcareCosts);
                });
            }
        }

        // Income Information
        if (data.incomeInfo) {
            Object.keys(data.incomeInfo).forEach(key => {
                this.setFieldValue(key, data.incomeInfo[key]);
            });
        }

        // Assets Information
        if (data.assetsInfo) {
            Object.keys(data.assetsInfo).forEach(key => {
                this.setFieldValue(key, data.assetsInfo[key]);
            });
        }

        // Debts Information
        if (data.debtsInfo) {
            Object.keys(data.debtsInfo).forEach(key => {
                this.setFieldValue(key, data.debtsInfo[key]);
            });
        }

        // Insurance Information
        if (data.insuranceInfo) {
            Object.keys(data.insuranceInfo).forEach(key => {
                this.setFieldValue(key, data.insuranceInfo[key]);
            });
        }

        // Tax Form Data
        if (data.taxFormData) {
            Object.keys(data.taxFormData).forEach(key => {
                this.setFieldValue(key, data.taxFormData[key]);
            });
        }

        // Update calculations after loading
        if (window.calculationEngine) {
            setTimeout(() => window.calculationEngine.calculateTotals(), 100);
        }

        // Update progress
        if (window.taxApp) {
            setTimeout(() => window.taxApp.updateProgress(), 200);
        }
    }

    // Helper method to set field value
    setFieldValue(fieldId, value) {
        const element = document.getElementById(fieldId);
        if (element && value !== undefined && value !== null) {
            element.value = value;
            element.dispatchEvent(new Event('change'));
        }
    }

    // Setup auto-save functionality
    setupAutoSave() {
        if (this.autoSaveEnabled) {
            // Save every 30 seconds
            this.autoSaveInterval = setInterval(() => {
                this.autoSave();
            }, 30000);

            // Save when user switches tabs or leaves page
            window.addEventListener('beforeunload', () => {
                this.autoSave();
            });
        }
    }

    // Auto-save function
    async autoSave() {
        if (!window.api || !window.api.isAuthenticated()) {
            return;
        }

        try {
            await this.saveAllData();
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    // Show save status indicator
    showSaveStatus(success, errorMessage = '') {
        const statusEl = document.getElementById('saveStatus');
        if (statusEl) {
            if (success) {
                statusEl.textContent = `Saved ${new Date().toLocaleTimeString()}`;
                statusEl.className = 'save-status success';
            } else {
                statusEl.textContent = 'Save failed: ' + errorMessage;
                statusEl.className = 'save-status error';
            }
            
            // Clear status after 3 seconds
            setTimeout(() => {
                if (statusEl) statusEl.textContent = '';
            }, 3000);
        }
    }

    // Manual save function for UI buttons
    async manualSave() {
        showNotification('Saving your progress...', 'info');
        const result = await this.saveAllData();
        
        if (result.success) {
            showNotification('All data saved successfully!', 'success');
        } else {
            showNotification('Failed to save data: ' + result.error, 'error');
        }
        
        return result;
    }

    // Destroy auto-save
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
}

// Global instance
window.comprehensiveDataManager = new ComprehensiveDataManager();

// Global functions for save/load operations
window.saveProgress = function() {
    return window.comprehensiveDataManager.manualSave();
};

window.loadProgress = function() {
    return window.comprehensiveDataManager.loadAllData();
};

// Enhanced save progress function for backward compatibility
window.saveAllProgress = function() {
    return window.comprehensiveDataManager.manualSave();
};