// Swiss Tax Calculation Engine - Canton Aargau 2024/2025
class CalculationEngine {
    constructor() {
        // ESTV official exchange rates (Dec 31, 2024)
        this.exchangeRates = {
            USD: 0.89,
            EUR: 0.96,
            GBP: 1.12,
            CHF: 1.0
        };

        // Swiss tax constants (2024/2025)
        this.swissConstants = {
            // Insurance premium deduction limits
            insuranceDeductionSingle: 3400,
            insuranceDeductionJoint: 6800,
            
            // Property constants
            imputedRentRate: 0.62, // 62% of market rent (2025 update)
            
            // Professional costs
            standardMealAllowance: 15.00, // CHF per day
            standardVehicleRate: 0.70, // CHF per km
            
            // Gaming winnings threshold
            gamingWinningsThreshold: 1000000, // CHF 1 million
            
            // Child deduction
            childDeductionUnder18: 6400, // CHF per child
            
            // Dividend qualification threshold
            qualifiedDividendThreshold: 10 // 10% shareholding for "D" marking
        };
    }

    // Calculate all CHF equivalents and totals with Swiss tax validation
    calculateTotals() {
        this.updateStockEquivalents();
        this.updateForeignMortgageEquivalents();
        this.updateForeignPropertyEquivalents();
        this.updateDividendEquivalents();
        
        // Apply Swiss tax business rules
        this.validateSwissTaxRules();
        
        // Calculate Swiss tax forms if present
        this.calculateSwissFormsIfPresent();
        
        // Note: Progress update is handled by the main app after calculations
        // Removed redundant updateProgress() call to prevent infinite recursion
    }

    // Apply Swiss tax business rules and validation
    validateSwissTaxRules() {
        this.validateInsuranceDeductions();
        this.validateGamingWinnings();
        this.updateQualifiedDividends();
    }

    // Validate insurance premium deductions
    validateInsuranceDeductions() {
        const insuranceField = document.getElementById('insurancePremiums');
        if (!insuranceField) return;
        
        const filingStatus = document.getElementById('filingStatus')?.value || 'single';
        const maxAllowed = filingStatus === 'married' ? 
            this.swissConstants.insuranceDeductionJoint : 
            this.swissConstants.insuranceDeductionSingle;
        
        const currentValue = parseFloat(insuranceField.value) || 0;
        
        if (currentValue > maxAllowed) {
            insuranceField.style.borderColor = '#ff4444';
            this.showValidationError(`Insurance premium deduction cannot exceed CHF ${maxAllowed.toLocaleString()} for ${filingStatus} filing status.`);
            insuranceField.value = maxAllowed;
        } else {
            insuranceField.style.borderColor = '';
        }
    }

    // Validate gaming winnings threshold
    validateGamingWinnings() {
        const gamingField = document.getElementById('gamingWinnings');
        if (!gamingField) return;
        
        const gamingAmount = parseFloat(gamingField.value) || 0;
        
        if (gamingAmount > 0 && gamingAmount < this.swissConstants.gamingWinningsThreshold) {
            this.showValidationWarning(`Gaming winnings under CHF ${this.swissConstants.gamingWinningsThreshold.toLocaleString()} are not taxable. Consider removing this entry.`);
        }
    }

    // Update qualified dividends with "D" marking
    updateQualifiedDividends() {
        document.querySelectorAll('.shareholdingPct').forEach(shareholdingInput => {
            const shareholding = parseFloat(shareholdingInput.value) || 0;
            const securityItem = shareholdingInput.closest('.security-item');
            if (!securityItem) return;
            
            const dividendMarker = securityItem.querySelector('.dividend-marker');
            if (!dividendMarker) return;
            
            if (shareholding >= this.swissConstants.qualifiedDividendThreshold) {
                dividendMarker.classList.add('visible');
                dividendMarker.title = `Qualified dividend: ${shareholding}% shareholding (≥10%)`;
            } else {
                dividendMarker.classList.remove('visible');
            }
        });
    }

    // Calculate Swiss forms if present
    calculateSwissFormsIfPresent() {
        // Main declaration calculations
        if (typeof calculateMainDeclarationTotals === 'function') {
            calculateMainDeclarationTotals();
        }
        
        // Securities calculations
        if (typeof calculateSecuritiesTotals === 'function') {
            calculateSecuritiesTotals();
        }
        
        // Properties calculations
        if (typeof calculatePropertiesTotals === 'function') {
            calculatePropertiesTotals();
        }
        
        // Professional costs calculations
        if (typeof calculateProfessionalTotals === 'function') {
            calculateProfessionalTotals();
        }
        
        // Debts calculations
        if (typeof calculateDebtsTotals === 'function') {
            calculateDebtsTotals();
        }
        
        // Pensions calculations
        if (typeof calculatePensionsTotals === 'function') {
            calculatePensionsTotals();
        }
    }

    // Show validation error
    showValidationError(message) {
        if (typeof showNotification === 'function') {
            showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    // Show validation warning
    showValidationWarning(message) {
        if (typeof showNotification === 'function') {
            showNotification(message, 'warning');
        } else {
            console.warn(message);
        }
    }

    // Update stock CHF equivalent
    updateStockEquivalents() {
        const stockUSD = parseFloat(document.getElementById('stockValueUSD')?.value || 0);
        const usdRate = parseFloat(document.getElementById('usdRate')?.value || 0.89);
        const stockCHF = stockUSD * usdRate;
        
        const stockEquivalent = document.getElementById('stockCHFEquivalent');
        if (stockEquivalent) {
            stockEquivalent.textContent = `CHF: ${stockCHF.toFixed(2)}`;
        }
    }

    // Update dividend CHF equivalent
    updateDividendEquivalents() {
        const dividendsUSD = parseFloat(document.getElementById('dividendsUSD')?.value || 0);
        const usdRate = parseFloat(document.getElementById('usdRate')?.value || 0.89);
        const dividendsCHF = dividendsUSD * usdRate;
        
        const dividendEquivalent = document.getElementById('dividendsCHFEquivalent');
        if (dividendEquivalent) {
            dividendEquivalent.textContent = `CHF: ${dividendsCHF.toFixed(2)}`;
        }
    }

    // Update foreign mortgage CHF equivalent
    updateForeignMortgageEquivalents() {
        const foreignMortgageEUR = parseFloat(document.getElementById('foreignMortgageEUR')?.value || 0);
        const eurRate = parseFloat(document.getElementById('eurRate')?.value || 0.96);
        const foreignMortgageCHF = foreignMortgageEUR * eurRate;
        
        const mortgageEquivalent = document.getElementById('foreignMortgageCHFEquivalent');
        if (mortgageEquivalent) {
            mortgageEquivalent.textContent = `CHF: ${foreignMortgageCHF.toFixed(2)}`;
        }

        // Update foreign interest CHF equivalent
        const foreignInterestEUR = parseFloat(document.getElementById('foreignMortgageInterest')?.value || 0);
        const foreignInterestCHF = foreignInterestEUR * eurRate;
        
        const interestEquivalent = document.getElementById('foreignInterestCHFEquivalent');
        if (interestEquivalent) {
            interestEquivalent.textContent = `CHF: ${foreignInterestCHF.toFixed(2)}`;
        }
    }

    // Update foreign property CHF equivalents
    updateForeignPropertyEquivalents() {
        document.querySelectorAll('.propertyEquivalent').forEach(equiv => {
            const propertySection = equiv.closest('.property-section');
            if (!propertySection) return;
            
            const value = parseFloat(propertySection.querySelector('.propertyValue')?.value || 0);
            const currency = propertySection.querySelector('.propertyCurrency')?.value || 'EUR';
            const rate = this.exchangeRates[currency] || 1;
            const chfValue = value * rate;
            equiv.textContent = `CHF Value: ${chfValue.toFixed(2)}`;
        });
    }

    // Generate complete tax calculation report
    generateReport() {
        const resultsPanel = document.getElementById('resultsPanel');
        if (!resultsPanel) return;
        
        resultsPanel.style.display = 'block';

        const calculationData = this.gatherAllData();
        const totals = this.calculateAllTotals(calculationData);

        this.displayWealthSummary(totals);
        this.displayAssetClassification(totals, calculationData);
        this.displayDebtClassification(totals, calculationData);
        this.displayFormsRequired(totals);
    }

    // Calculate all totals from form data
    calculateAllTotals(data) {
        const stockCHF = data.stockValueUSD * data.usdRate;
        const totalMovableAssets = data.bankAccountsCHF + stockCHF + data.pillar3a + data.vehicleValue;
        
        let totalForeignProperties = 0;
        let totalRentalIncome = 0;
        
        data.foreignProperties.forEach(prop => {
            const rate = this.exchangeRates[prop.currency] || 1;
            totalForeignProperties += prop.value * rate;
            totalRentalIncome += prop.rentalIncome * rate;
        });
        
        const totalRealEstate = data.swissTaxValue + totalForeignProperties;
        const totalAssets = totalMovableAssets + totalRealEstate;
        
        const foreignMortgageCHF = data.foreignMortgageEUR * data.eurRate;
        const privateDebts = data.swissMortgage + data.personalLoans + (totalRentalIncome > 0 ? 0 : foreignMortgageCHF);
        const businessDebts = totalRentalIncome > 0 ? foreignMortgageCHF : 0;
        const totalDebts = privateDebts + businessDebts;
        
        const netWealth = Math.max(0, totalAssets - totalDebts);

        return {
            stockCHF,
            totalMovableAssets,
            totalForeignProperties,
            totalRentalIncome,
            totalRealEstate,
            totalAssets,
            foreignMortgageCHF,
            privateDebts,
            businessDebts,
            totalDebts,
            netWealth
        };
    }

    // Display wealth summary in results panel
    displayWealthSummary(totals) {
        const wealthSummary = document.getElementById('wealthSummary');
        if (!wealthSummary) return;

        wealthSummary.innerHTML = `
            <div class="calculation-row">
                <span>Movable Assets (Section 30):</span>
                <span>CHF ${totals.totalMovableAssets.toLocaleString('de-CH', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="calculation-row">
                <span>Real Estate (Section 31):</span>
                <span>CHF ${totals.totalRealEstate.toLocaleString('de-CH', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="calculation-row">
                <span>Total Assets (Section 33):</span>
                <span>CHF ${totals.totalAssets.toLocaleString('de-CH', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="calculation-row">
                <span>Total Debts (Section 34):</span>
                <span>CHF ${totals.totalDebts.toLocaleString('de-CH', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="calculation-row">
                <span>Net Wealth (Section 35):</span>
                <span>CHF ${totals.netWealth.toLocaleString('de-CH', {minimumFractionDigits: 2})}</span>
            </div>
        `;
    }

    // Display asset classification
    displayAssetClassification(totals, data) {
        const assetClassification = document.getElementById('assetClassification');
        if (!assetClassification) return;

        let assetBreakdown = `
            <table class="summary-table">
                <tr><th>Asset Type</th><th>Value (CHF)</th><th>Classification</th></tr>
                <tr><td>Bank Accounts</td><td>${data.bankAccountsCHF.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>Movable Assets</td></tr>
                <tr><td>Stock Holdings</td><td>${totals.stockCHF.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>Movable Assets</td></tr>
                <tr><td>Pillar 3a</td><td>${data.pillar3a.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>Movable Assets</td></tr>
                <tr><td>Vehicle</td><td>${data.vehicleValue.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>Movable Assets</td></tr>
                <tr><td>Swiss Real Estate</td><td>${data.swissTaxValue.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>Private Property</td></tr>
        `;

        if (totals.totalForeignProperties > 0) {
            const classification = totals.totalRentalIncome > 0 ? 'Business Property' : 'Private Property';
            assetBreakdown += `<tr><td>Foreign Real Estate</td><td>${totals.totalForeignProperties.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>${classification}</td></tr>`;
        }

        assetBreakdown += `</table>`;
        assetClassification.innerHTML = assetBreakdown;
    }

    // Display debt classification
    displayDebtClassification(totals, data) {
        const debtClassification = document.getElementById('debtClassification');
        if (!debtClassification) return;

        const swissMortgageInterest = data.swissMortgageInterest || 0;
        const personalLoanInterest = data.personalLoanInterest || 0;
        const foreignInterestCHF = (data.foreignMortgageInterest || 0) * data.eurRate;

        const totalPrivateInterest = swissMortgageInterest + personalLoanInterest + (totals.totalRentalIncome > 0 ? 0 : foreignInterestCHF);
        const totalBusinessInterest = totals.totalRentalIncome > 0 ? foreignInterestCHF : 0;

        let debtBreakdown = `
            <table class="summary-table">
                <tr><th>Debt Type</th><th>Amount (CHF)</th><th>Classification</th><th>Interest Paid</th></tr>
                <tr><td>Swiss Mortgage</td><td>${data.swissMortgage.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>Private Debt</td><td>${swissMortgageInterest.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
                <tr><td>Personal Loans</td><td>${data.personalLoans.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>Private Debt</td><td>${personalLoanInterest.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
        `;

        if (totals.foreignMortgageCHF > 0) {
            const classification = totals.totalRentalIncome > 0 ? 'Business Debt' : 'Private Debt';
            debtBreakdown += `<tr><td>Foreign Mortgage</td><td>${totals.foreignMortgageCHF.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td><td>${classification}</td><td>${foreignInterestCHF.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>`;
        }

        debtBreakdown += `
            <tr style="border-top: 2px solid #1e3c72; font-weight: bold;">
                <td>Total Private Debts</td>
                <td>${totals.privateDebts.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td>
                <td>Deductible Interest</td>
                <td>${totalPrivateInterest.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td>
            </tr>
        `;

        if (totals.businessDebts > 0) {
            debtBreakdown += `
                <tr style="font-weight: bold;">
                    <td>Total Business Debts</td>
                    <td>${totals.businessDebts.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td>
                    <td>Business Expense</td>
                    <td>${totalBusinessInterest.toLocaleString('de-CH', {minimumFractionDigits: 2})}</td>
                </tr>
            `;
        }

        debtBreakdown += `</table>`;
        debtClassification.innerHTML = debtBreakdown;
    }

    // Display required forms
    displayFormsRequired(totals) {
        const formsRequired = document.getElementById('formsRequired');
        if (!formsRequired) return;

        let formsContent = `
            <table class="summary-table">
                <tr><th>Form</th><th>Purpose</th><th>Status</th></tr>
                <tr><td>Steuererklärung (Main Form)</td><td>Income and wealth declaration</td><td>✓ Required</td></tr>
                <tr><td>Wertschriften- und Guthabenverzeichnis</td><td>Securities and assets register</td><td>${totals.stockCHF > 0 || totals.totalMovableAssets > 1000 ? '✓ Required' : '○ Not needed'}</td></tr>
                <tr><td>Liegenschaftenverzeichnis</td><td>Real estate register</td><td>${totals.totalRealEstate > 0 ? '✓ Required' : '○ Not needed'}</td></tr>
        `;

        if (totals.totalRentalIncome > 0) {
            formsContent += `<tr><td>Geschäftsbericht</td><td>Business income report</td><td>✓ Required (Rental Income)</td></tr>`;
        }

        formsContent += `</table>`;

        // Add recommendations
        if (totals.netWealth === 0) {
            formsContent += `<div class="info" style="margin-top: 15px;"><strong>Wealth Tax:</strong> No wealth tax owed (negative net wealth = CHF 0 for tax purposes)</div>`;
        }

        const totalDeductibleInterest = totals.totalDebts > 0 ? 5000 : 0; // Estimated
        if (totalDeductibleInterest > 2000) {
            formsContent += `<div class="info" style="margin-top: 10px;"><strong>Tax Optimization:</strong> Significant deductible interest will reduce your taxable income substantially.</div>`;
        }

        if (totals.totalRentalIncome > 0) {
            formsContent += `<div class="warning" style="margin-top: 10px;"><strong>Business Classification:</strong> Your rental income of CHF ${totals.totalRentalIncome.toLocaleString('de-CH', {minimumFractionDigits: 2})} requires business tax treatment.</div>`;
        }

        formsRequired.innerHTML = formsContent;
    }

    // Gather all form data
    gatherAllData() {
        const data = {
            taxYear: document.getElementById('taxYear')?.value || 2024,
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            address: document.getElementById('address')?.value || '',
            
            // Assets
            bankAccountsCHF: parseFloat(document.getElementById('bankAccountsCHF')?.value || 0),
            stockValueUSD: parseFloat(document.getElementById('stockValueUSD')?.value || 0),
            pillar3a: parseFloat(document.getElementById('pillar3a')?.value || 0),
            vehicleValue: parseFloat(document.getElementById('vehicleValue')?.value || 0),
            dividendsUSD: parseFloat(document.getElementById('dividendsUSD')?.value || 0),
            interestIncome: parseFloat(document.getElementById('interestIncome')?.value || 0),
            
            // Exchange rates
            usdRate: parseFloat(document.getElementById('usdRate')?.value || 0.89),
            eurRate: parseFloat(document.getElementById('eurRate')?.value || 0.96),
            
            // Properties
            swissAddress: document.getElementById('swissAddress')?.value || '',
            swissTaxValue: parseFloat(document.getElementById('swissTaxValue')?.value || 0),
            swissPropertyType: document.getElementById('swissPropertyType')?.value || '',
            swissImputedRent: parseFloat(document.getElementById('swissImputedRent')?.value || 0),
            
            // Debts
            swissMortgage: parseFloat(document.getElementById('swissMortgage')?.value || 0),
            swissMortgageInterest: parseFloat(document.getElementById('swissMortgageInterest')?.value || 0),
            personalLoans: parseFloat(document.getElementById('personalLoans')?.value || 0),
            personalLoanInterest: parseFloat(document.getElementById('personalLoanInterest')?.value || 0),
            foreignMortgageEUR: parseFloat(document.getElementById('foreignMortgageEUR')?.value || 0),
            foreignMortgageInterest: parseFloat(document.getElementById('foreignMortgageInterest')?.value || 0),
            
            // Foreign properties
            foreignProperties: []
        };

        // Gather foreign properties
        document.querySelectorAll('.property-section').forEach(section => {
            const countrySelect = section.querySelector('.propertyCountry');
            if (countrySelect) { // Only foreign properties have country selects
                const property = {
                    country: countrySelect.value || '',
                    address: section.querySelector('.propertyAddress')?.value || '',
                    value: parseFloat(section.querySelector('.propertyValue')?.value || 0),
                    currency: section.querySelector('.propertyCurrency')?.value || 'EUR',
                    rentalIncome: parseFloat(section.querySelector('.rentalIncome')?.value || 0),
                    type: section.querySelector('.foreignPropertyType')?.value || 'personal'
                };
                if (property.value > 0 || property.rentalIncome > 0) {
                    data.foreignProperties.push(property);
                }
            }
        });

        return data;
    }

    // Update quick summary in calculate tab
    updateQuickSummary() {
        const data = this.gatherAllData();
        const totals = this.calculateAllTotals(data);
        
        const quickTotalAssets = document.getElementById('quickTotalAssets');
        const quickTotalDebts = document.getElementById('quickTotalDebts');
        const quickNetWealth = document.getElementById('quickNetWealth');
        
        if (quickTotalAssets) quickTotalAssets.textContent = totals.totalAssets.toLocaleString('de-CH', {minimumFractionDigits: 2}) + ' CHF';
        if (quickTotalDebts) quickTotalDebts.textContent = totals.totalDebts.toLocaleString('de-CH', {minimumFractionDigits: 2}) + ' CHF';
        if (quickNetWealth) quickNetWealth.textContent = totals.netWealth.toLocaleString('de-CH', {minimumFractionDigits: 2}) + ' CHF';
    }

    // Generate PDF with complete calculation data
    async downloadPDF() {
        try {
            const calculationData = this.gatherAllData();
            const totals = this.calculateAllTotals(calculationData);
            
            const pdfData = {
                ...calculationData,
                movableAssets: totals.totalMovableAssets,
                realEstate: totals.totalRealEstate,
                totalAssets: totals.totalAssets,
                totalDebts: totals.totalDebts,
                netWealth: totals.netWealth,
                bankAccounts: calculationData.bankAccountsCHF,
                stockHoldings: totals.stockCHF,
                swissRealEstate: calculationData.swissTaxValue,
                foreignRealEstate: totals.totalForeignProperties,
                rentalIncome: totals.totalRentalIncome,
                swissMortgage: calculationData.swissMortgage,
                personalLoans: calculationData.personalLoans,
                foreignMortgage: totals.foreignMortgageCHF
            };
            
            const result = await api.generatePDF(pdfData);
            if (result.success) {
                showNotification('PDF report opened in new window!', 'success');
            } else {
                showNotification('Failed to generate PDF report', 'error');
            }
        } catch (error) {
            console.error('PDF error:', error);
            showNotification('Failed to generate PDF report', 'error');
        }
    }
}