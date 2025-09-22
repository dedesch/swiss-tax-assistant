// Document Processing Service using OpenAI Vision API
// Referenced from javascript_openai integration blueprint
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// The newest OpenAI model is "gpt-5" which was released August 7, 2025. Do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class DocumentProcessor {
    constructor() {
        this.supportedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf'
        ];
    }

    // Process uploaded document and extract information
    async processDocument(fileBuffer, fileName, fileType) {
        try {
            let base64Image;
            
            // Handle different file types
            if (fileType.startsWith('image/')) {
                base64Image = fileBuffer.toString('base64');
            } else if (fileType === 'application/pdf') {
                // For PDF, return structured error instead of throwing
                return {
                    success: false,
                    error: 'PDF processing is not yet supported. Please upload a screenshot or image of your PDF document instead.',
                    data: null
                };
            } else {
                throw new Error(`Unsupported file type: ${fileType}`);
            }

            // Analyze document using OpenAI Vision
            const documentType = await this.identifyDocumentType(base64Image);
            const extractedData = await this.extractInformation(base64Image, documentType);

            return {
                success: true,
                documentType,
                extractedData,
                fileName
            };

        } catch (error) {
            console.error('Document processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Identify the type of document
    async identifyDocumentType(base64Image) {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Use gpt-4o for vision capabilities
            messages: [
                {
                    role: "system",
                    content: "You are a document classification expert specializing in Swiss tax-related documents. Identify the type of document from the image and respond with JSON format."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analyze this document image and classify it as one of the following types: salary_statement, bank_statement, insurance_document, mortgage_statement, investment_statement, property_document, other. Respond with JSON: {\"document_type\": \"type\", \"confidence\": 0.0-1.0, \"language\": \"language_detected\"}"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ],
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 500
        });

        try {
            const result = JSON.parse(response.choices[0].message.content);
            return result;
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            // Fallback result
            return {
                document_type: 'other',
                confidence: 0.5,
                language: 'unknown'
            };
        }
    }

    // Extract specific information based on document type
    async extractInformation(base64Image, documentType) {
        const prompts = this.getExtractionPrompts(documentType.document_type);
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Use gpt-4o for vision capabilities
            messages: [
                {
                    role: "system",
                    content: prompts.system
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompts.user
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ],
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1500
        });

        let extractedData;
        try {
            extractedData = JSON.parse(response.choices[0].message.content);
        } catch (parseError) {
            console.error('JSON parsing error during extraction:', parseError);
            // Fallback empty data
            extractedData = {};
        }
        return this.mapToTaxFields(extractedData, documentType.document_type);
    }

    // Get specific extraction prompts for different document types
    getExtractionPrompts(documentType) {
        const prompts = {
            salary_statement: {
                system: "You are a Swiss tax expert. Extract relevant information from salary statements/pay slips for tax declaration purposes.",
                user: `Extract the following information from this Swiss salary statement/pay slip:
                - gross_salary_annual: Total annual gross salary
                - gross_salary_monthly: Monthly gross salary
                - net_salary: Net salary after deductions
                - employer_name: Company/employer name
                - employee_name: Employee full name
                - period: Pay period (month/year)
                - social_security_deductions: AHV/IV/EO deductions
                - unemployment_insurance: ALV deductions
                - pension_contributions: Pension fund contributions (2nd pillar)
                - withholding_tax: Withholding tax amount
                - other_deductions: Other deductions
                
                Respond with JSON format. Use null for any fields not found. All monetary amounts should be in CHF.`
            },
            bank_statement: {
                system: "You are a Swiss banking and tax expert. Extract relevant information from bank statements for tax purposes.",
                user: `Extract the following information from this Swiss bank statement:
                - bank_name: Name of the bank
                - account_holder: Account holder name
                - account_number: Account number (last 4 digits only for privacy)
                - statement_period: Statement period (from/to dates)
                - closing_balance: Account balance at end of period
                - opening_balance: Account balance at start of period
                - interest_earned: Interest income earned
                - dividend_income: Dividend payments received
                - foreign_transactions: Any foreign currency transactions
                - average_balance: Average account balance if shown
                
                Respond with JSON format. Use null for any fields not found. All monetary amounts should be in CHF.`
            },
            insurance_document: {
                system: "You are a Swiss insurance and tax expert. Extract relevant information from insurance documents for tax deduction purposes.",
                user: `Extract the following information from this Swiss insurance document:
                - insurance_company: Insurance company name
                - policy_holder: Policy holder name
                - insurance_type: Type of insurance (health, life, liability, etc.)
                - annual_premium: Annual premium amount
                - premium_paid_2024: Premium paid in 2024
                - deductible_amount: Tax-deductible amount
                - policy_number: Policy number
                - coverage_period: Coverage period
                
                Respond with JSON format. Use null for any fields not found. All monetary amounts should be in CHF.`
            },
            mortgage_statement: {
                system: "You are a Swiss mortgage and tax expert. Extract relevant information from mortgage statements for tax purposes.",
                user: `Extract the following information from this Swiss mortgage statement:
                - lender_name: Mortgage lender/bank name
                - borrower_name: Borrower name
                - property_address: Property address
                - outstanding_balance: Outstanding mortgage balance
                - interest_rate: Current interest rate
                - interest_paid_2024: Interest paid in 2024
                - principal_payments: Principal payments made
                - monthly_payment: Monthly payment amount
                - loan_term: Remaining loan term
                
                Respond with JSON format. Use null for any fields not found. All monetary amounts should be in CHF.`
            },
            investment_statement: {
                system: "You are a Swiss investment and tax expert. Extract relevant information from investment statements for tax purposes.",
                user: `Extract the following information from this Swiss investment/securities statement:
                - broker_name: Broker/bank name
                - account_holder: Account holder name
                - statement_period: Statement period
                - total_portfolio_value: Total portfolio value
                - dividend_income: Dividend income received
                - interest_income: Interest income
                - realized_gains: Realized capital gains
                - unrealized_gains: Unrealized gains/losses
                - securities_list: List of major holdings with values
                - foreign_withholding_tax: Foreign withholding taxes paid
                
                Respond with JSON format. Use null for any fields not found. All monetary amounts should be in CHF.`
            }
        };

        return prompts[documentType] || {
            system: "You are a document analysis expert. Extract any relevant financial or tax-related information.",
            user: "Extract any financial or tax-related information from this document. Respond with JSON format."
        };
    }

    // Map extracted data to Swiss tax form fields
    mapToTaxFields(extractedData, documentType) {
        const fieldMappings = {
            salary_statement: {
                'employmentIncome': extractedData.gross_salary_annual,
                'firstName': extractedData.employee_name?.split(' ')[0],
                'lastName': extractedData.employee_name?.split(' ').slice(1).join(' ')
            },
            bank_statement: {
                'bankAccountsCHF': extractedData.closing_balance,
                'interestIncome': extractedData.interest_earned,
                'dividendsUSD': extractedData.dividend_income // Will need currency conversion
            },
            insurance_document: {
                'insurancePremiums': extractedData.deductible_amount || extractedData.annual_premium
            },
            mortgage_statement: {
                'swissMortgage': extractedData.outstanding_balance,
                'swissMortgageInterest': extractedData.interest_paid_2024
            },
            investment_statement: {
                'stockValueUSD': extractedData.total_portfolio_value,
                'dividendsUSD': extractedData.dividend_income,
                'interestIncome': extractedData.interest_income
            }
        };

        const mappedFields = fieldMappings[documentType] || {};
        
        return {
            extractedData,
            taxFormFields: mappedFields,
            suggestions: this.generateSuggestions(extractedData, documentType)
        };
    }

    // Generate suggestions for the user
    generateSuggestions(extractedData, documentType) {
        const suggestions = [];

        switch (documentType) {
            case 'salary_statement':
                if (extractedData.withholding_tax) {
                    suggestions.push('Consider claiming withholding tax as a deduction or credit.');
                }
                if (extractedData.pension_contributions) {
                    suggestions.push('Pension contributions are automatically deducted and reduce your taxable income.');
                }
                break;
            case 'bank_statement':
                if (extractedData.foreign_transactions) {
                    suggestions.push('Foreign transactions may require additional reporting. Check if any foreign accounts need to be declared.');
                }
                if (extractedData.interest_earned > 200) {
                    suggestions.push('Interest income above CHF 200 should be reported on your tax declaration.');
                }
                break;
            case 'investment_statement':
                if (extractedData.foreign_withholding_tax) {
                    suggestions.push('Foreign withholding taxes can often be claimed as a credit against Swiss taxes.');
                }
                break;
        }

        return suggestions;
    }
}

export default DocumentProcessor;