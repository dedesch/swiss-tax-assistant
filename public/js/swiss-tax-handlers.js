// Swiss Tax Form Event Handlers - Unified System
// This file ensures all Swiss tax form functions exist and are properly wired

// Global calculation function that coordinates all Swiss tax forms
function calculateTotals() {
    if (window.calculationEngine) {
        window.calculationEngine.calculateTotals();
    }
}

// Main Declaration Functions
function calculateMainDeclarationTotals() {
    if (typeof window.calculateMainDeclarationTotals === 'function') {
        return window.calculateMainDeclarationTotals();
    }
    return { totalIncome: 0, totalDeductions: 0, taxableIncome: 0 };
}

function updateFilingStatus() {
    if (typeof window.updateFilingStatus === 'function') {
        window.updateFilingStatus();
    }
    calculateTotals();
}

function validateInsuranceDeduction() {
    if (typeof window.validateInsuranceDeduction === 'function') {
        window.validateInsuranceDeduction();
    }
    calculateTotals();
}

// Securities Functions
function addSecurity() {
    if (typeof window.addSecurity === 'function') {
        window.addSecurity();
    } else {
        console.warn('addSecurity function not found, using fallback');
        // Fallback implementation
        addSecurityFallback();
    }
}

function addSecurityFallback() {
    const template = document.getElementById('securityTemplate');
    if (!template) return;
    
    const securitiesCount = document.querySelectorAll('.security-item:not(#securityTemplate)').length + 1;
    const newSecurity = template.cloneNode(true);
    newSecurity.id = '';
    newSecurity.style.display = 'block';
    
    // Update security number
    const numberSpan = newSecurity.querySelector('.security-number');
    if (numberSpan) numberSpan.textContent = securitiesCount;
    
    // Add to list
    const securitiesList = document.getElementById('securitiesList');
    if (securitiesList) {
        securitiesList.appendChild(newSecurity);
        calculateTotals();
    }
}

function removeSecurity(btn) {
    if (typeof window.removeSecurity === 'function') {
        window.removeSecurity(btn);
    } else {
        // Fallback implementation
        const securityItem = btn.closest('.security-item');
        if (securityItem) {
            securityItem.remove();
            calculateTotals();
        }
    }
}

function calculateSecuritiesTotals() {
    if (typeof window.calculateSecuritiesTotals === 'function') {
        return window.calculateSecuritiesTotals();
    } else {
        // Fallback calculation
        return calculateSecuritiesTotalsFallback();
    }
}

function calculateSecuritiesTotalsFallback() {
    const securities = document.querySelectorAll('.security-item:not(#securityTemplate)');
    let totalValue = 0;
    let totalDividends = 0;
    
    securities.forEach(security => {
        const valueSpan = security.querySelector('.securityValueCHF');
        if (valueSpan) {
            const value = parseFloat(valueSpan.textContent.replace(/[^\d.-]/g, '')) || 0;
            totalValue += value;
        }
        
        const dividendInput = security.querySelector('.dividendIncome');
        if (dividendInput) {
            totalDividends += parseFloat(dividendInput.value) || 0;
        }
    });
    
    // Update displays if they exist
    updateElementText('totalSecuritiesValue', totalValue.toLocaleString('de-CH', {minimumFractionDigits: 2}) + ' CHF');
    updateElementText('totalDividendIncome', totalDividends.toLocaleString('de-CH', {minimumFractionDigits: 2}) + ' CHF');
    
    return { totalValue, totalDividends };
}

function updateSecurityCalculations(element) {
    if (typeof window.updateSecurityCalculations === 'function') {
        window.updateSecurityCalculations(element);
    } else {
        // Fallback implementation
        const securityItem = element.closest('.security-item');
        if (!securityItem) return;
        
        const quantity = parseFloat(securityItem.querySelector('.securityQuantity').value) || 0;
        const price = parseFloat(securityItem.querySelector('.securityPrice').value) || 0;
        const currency = securityItem.querySelector('.securityCurrency').value || 'CHF';
        
        // Exchange rates (should match calculations.js)
        const exchangeRates = { 'EUR': 0.96, 'USD': 0.89, 'GBP': 1.12, 'CHF': 1.0 };
        
        const valueOriginal = quantity * price;
        const valueCHF = valueOriginal * (exchangeRates[currency] || 1);
        
        const valueSpan = securityItem.querySelector('.securityValueCHF');
        if (valueSpan) {
            valueSpan.textContent = valueCHF.toLocaleString('de-CH', {minimumFractionDigits: 2}) + ' CHF';
        }
        
        calculateTotals();
    }
}

function updateDividendMarker(element) {
    if (typeof window.updateDividendMarker === 'function') {
        window.updateDividendMarker(element);
    } else {
        // Fallback implementation
        const securityItem = element.closest('.security-item');
        if (!securityItem) return;
        
        const shareholdingPct = parseFloat(element.value) || 0;
        const dividendMarker = securityItem.querySelector('.dividend-marker');
        
        if (dividendMarker) {
            if (shareholdingPct >= 10) {
                dividendMarker.classList.add('visible');
                dividendMarker.title = `Qualified dividend: ${shareholdingPct}% shareholding (≥10%)`;
            } else {
                dividendMarker.classList.remove('visible');
            }
        }
    }
}

// Properties Functions
function addProperty() {
    if (typeof window.addProperty === 'function') {
        window.addProperty();
    } else {
        addPropertyFallback();
    }
}

function addPropertyFallback() {
    const template = document.getElementById('propertyTemplate');
    if (!template) return;
    
    const propertiesCount = document.querySelectorAll('.property-item:not(#propertyTemplate)').length + 1;
    const newProperty = template.cloneNode(true);
    newProperty.id = '';
    newProperty.style.display = 'block';
    
    const numberSpan = newProperty.querySelector('.property-number');
    if (numberSpan) numberSpan.textContent = propertiesCount;
    
    const propertiesList = document.getElementById('propertiesList');
    if (propertiesList) {
        propertiesList.appendChild(newProperty);
        calculateTotals();
    }
}

function removeProperty(btn) {
    if (typeof window.removeProperty === 'function') {
        window.removeProperty(btn);
    } else {
        const propertyItem = btn.closest('.property-item');
        if (propertyItem) {
            propertyItem.remove();
            calculateTotals();
        }
    }
}

function calculatePropertiesTotals() {
    if (typeof window.calculatePropertiesTotals === 'function') {
        return window.calculatePropertiesTotals();
    } else {
        return calculatePropertiesTotalsFallback();
    }
}

function calculatePropertiesTotalsFallback() {
    const properties = document.querySelectorAll('.property-item:not(#propertyTemplate)');
    let totalTaxValue = 0;
    let totalRentalIncome = 0;
    let totalImputedRent = 0;
    
    properties.forEach(property => {
        const taxValue = parseFloat(property.querySelector('.propertyTaxValue').value) || 0;
        const ownershipPct = parseFloat(property.querySelector('.ownershipPct').value) || 100;
        totalTaxValue += taxValue * (ownershipPct / 100);
        
        const actualRental = parseFloat(property.querySelector('.actualRentalIncome').value) || 0;
        const usage = property.querySelector('.propertyUsage').value;
        if (usage === 'rent' || usage === 'mixed') {
            totalRentalIncome += actualRental * (ownershipPct / 100);
        }
        
        const marketRent = parseFloat(property.querySelector('.marketRent').value) || 0;
        const imputedRent = marketRent * 12 * 0.62 * (ownershipPct / 100); // 62% rate
        if (usage === 'own' || usage === 'mixed') {
            totalImputedRent += imputedRent;
        }
    });
    
    updateElementText('totalPropertyTaxValue', totalTaxValue.toLocaleString('de-CH', {minimumFractionDigits: 2}) + ' CHF');
    updateElementText('totalRentalIncome', totalRentalIncome.toLocaleString('de-CH', {minimumFractionDigits: 2}) + ' CHF');
    updateElementText('totalImputedRent', totalImputedRent.toLocaleString('de-CH', {minimumFractionDigits: 2}) + ' CHF');
    
    return { totalTaxValue, totalRentalIncome, totalImputedRent };
}

function updatePropertyCalculations(element) {
    if (typeof window.updatePropertyCalculations === 'function') {
        window.updatePropertyCalculations(element);
    } else {
        calculateTotals();
    }
}

// Debts Functions
function addDebt() {
    if (typeof window.addDebt === 'function') {
        window.addDebt();
    } else {
        addDebtFallback();
    }
}

function addDebtFallback() {
    const template = document.getElementById('debtTemplate');
    if (!template) return;
    
    const debtsCount = document.querySelectorAll('.debt-item:not(#debtTemplate)').length + 1;
    const newDebt = template.cloneNode(true);
    newDebt.id = '';
    newDebt.style.display = 'block';
    
    const numberSpan = newDebt.querySelector('.debt-number');
    if (numberSpan) numberSpan.textContent = debtsCount;
    
    const debtsList = document.getElementById('debtsList');
    if (debtsList) {
        debtsList.appendChild(newDebt);
        calculateTotals();
    }
}

function removeDebt(btn) {
    if (typeof window.removeDebt === 'function') {
        window.removeDebt(btn);
    } else {
        const debtItem = btn.closest('.debt-item');
        if (debtItem) {
            debtItem.remove();
            calculateTotals();
        }
    }
}

function calculateDebtsTotals() {
    if (typeof window.calculateDebtsTotals === 'function') {
        return window.calculateDebtsTotals();
    }
    return { grandTotal: 0, totalInterest: 0 };
}

function updateDebtCalculations(element) {
    if (typeof window.updateDebtCalculations === 'function') {
        window.updateDebtCalculations(element);
    } else {
        calculateTotals();
    }
}

// Professional Costs Functions
function calculateProfessionalTotals() {
    if (typeof window.calculateProfessionalTotals === 'function') {
        return window.calculateProfessionalTotals();
    }
    return { grandTotal: 0 };
}

function updateCommutingCalculations() {
    if (typeof window.updateCommutingCalculations === 'function' && window.updateCommutingCalculations !== updateCommutingCalculations) {
        window.updateCommutingCalculations();
    } else {
        calculateTotals();
    }
}

// Pensions Functions
function addPension() {
    if (typeof window.addPension === 'function') {
        window.addPension();
    } else {
        addPensionFallback();
    }
}

function addPensionFallback() {
    const template = document.getElementById('pensionTemplate');
    if (!template) return;
    
    const pensionsCount = document.querySelectorAll('.pension-item:not(#pensionTemplate)').length + 1;
    const newPension = template.cloneNode(true);
    newPension.id = '';
    newPension.style.display = 'block';
    
    const numberSpan = newPension.querySelector('.pension-number');
    if (numberSpan) numberSpan.textContent = pensionsCount;
    
    const pensionsList = document.getElementById('pensionsList');
    if (pensionsList) {
        pensionsList.appendChild(newPension);
        calculateTotals();
    }
}

function removePension(btn) {
    if (typeof window.removePension === 'function') {
        window.removePension(btn);
    } else {
        const pensionItem = btn.closest('.pension-item');
        if (pensionItem) {
            pensionItem.remove();
            calculateTotals();
        }
    }
}

function calculatePensionsTotals() {
    if (typeof window.calculatePensionsTotals === 'function') {
        return window.calculatePensionsTotals();
    }
    return { totalGross: 0, totalTaxable: 0 };
}

// Utility Functions
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Ensure all functions are globally accessible
window.calculateTotals = calculateTotals;
window.calculateMainDeclarationTotals = calculateMainDeclarationTotals;
window.updateFilingStatus = updateFilingStatus;
window.validateInsuranceDeduction = validateInsuranceDeduction;
window.addSecurity = addSecurity;
window.removeSecurity = removeSecurity;
window.calculateSecuritiesTotals = calculateSecuritiesTotals;
window.updateSecurityCalculations = updateSecurityCalculations;
window.updateDividendMarker = updateDividendMarker;
window.addProperty = addProperty;
window.removeProperty = removeProperty;
window.calculatePropertiesTotals = calculatePropertiesTotals;
window.updatePropertyCalculations = updatePropertyCalculations;
window.addDebt = addDebt;
window.removeDebt = removeDebt;
window.calculateDebtsTotals = calculateDebtsTotals;
window.updateDebtCalculations = updateDebtCalculations;
window.calculateProfessionalTotals = calculateProfessionalTotals;
window.updateCommutingCalculations = updateCommutingCalculations;
window.addPension = addPension;
window.removePension = removePension;
window.calculatePensionsTotals = calculatePensionsTotals;

console.log('Swiss Tax Handlers loaded successfully');