// Vercel serverless function for tax calculations
import jwt from 'jsonwebtoken';
import { saveCalculation, getCalculation } from '../lib/db.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'POST') {
            // Development mode bypass - allow access without authentication
            const isDevelopment = process.env.NODE_ENV !== 'production';
            let user;
            
            if (isDevelopment) {
                // Use mock user for development with numeric ID for database compatibility
                user = {
                    userId: 999999,
                    email: 'dev@example.com'
                };
            } else {
                // Verify authentication in production
                const authHeader = req.headers.authorization;
                const token = authHeader && authHeader.split(' ')[1];

                if (!token) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                try {
                    user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
                } catch (error) {
                    return res.status(403).json({ error: 'Invalid token' });
                }
            }

            const { action, taxYear, data } = req.body;

            if (action === 'save') {
                // Save calculation data
                const saved = await saveCalculation(user.userId, taxYear || 2024, data);
                return res.json({
                    success: true,
                    message: 'Calculation saved successfully',
                    data: saved
                });
            } else if (action === 'load') {
                // Load calculation data
                const calculation = await getCalculation(user.userId, taxYear || 2024);
                return res.json({
                    success: true,
                    data: calculation ? calculation.data : null
                });
            } else {
                // Perform calculations
                const {
                    bankAccountsCHF = 0,
                    stockValueUSD = 0,
                    swissAddress = '',
                    swissTaxValue = 0,
                    swissMortgage = 0,
                    swissMortgageInterest = 0
                } = data;

                // Enhanced calculations
                const usdToChfRate = 0.92; // Approximate exchange rate
                const stockValueCHF = stockValueUSD * usdToChfRate;
                const totalLiquidAssets = bankAccountsCHF + stockValueCHF;
                const totalRealEstate = swissTaxValue;
                const totalAssets = totalLiquidAssets + totalRealEstate;
                const totalDebts = swissMortgage;
                const netWorth = totalAssets - totalDebts;

                // Tax calculations based on Canton Aargau rates
                const taxableWealth = Math.max(0, netWorth - 200000); // Basic exemption
                const wealthTax = taxableWealth * 0.002; // Simplified wealth tax rate
                const mortgageDeduction = swissMortgageInterest; // Deductible

                const calculations = {
                    totalLiquidAssets,
                    totalRealEstate,
                    totalAssets,
                    totalDebts,
                    netWorth,
                    taxableWealth,
                    wealthTax,
                    mortgageDeduction,
                    timestamp: new Date().toISOString()
                };

                return res.json({
                    success: true,
                    calculations
                });
            }
        } else if (req.method === 'GET') {
            // Development mode bypass for GET requests
            const isDevelopment = process.env.NODE_ENV !== 'production';
            let user;
            
            if (isDevelopment) {
                user = {
                    userId: 999999,
                    email: 'dev@example.com'
                };
            } else {
                // Verify authentication in production
                const authHeader = req.headers.authorization;
                const token = authHeader && authHeader.split(' ')[1];

                if (!token) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                try {
                    user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
                } catch (error) {
                    return res.status(403).json({ error: 'Invalid token' });
                }
            }
            
            // Load user's latest calculation
            const taxYear = req.query.taxYear || 2024;
            const calculation = await getCalculation(user.userId, taxYear);
            
            return res.json({
                success: true,
                data: calculation ? calculation.data : null
            });
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Calculation handler error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}