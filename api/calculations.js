import { saveCalculation, getCalculation } from '../lib/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production-please';

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization token provided');
  }
  
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET);
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const userData = verifyToken(req);

    if (req.method === 'POST') {
      // Save calculation
      const { taxYear, calculationData } = req.body;
      
      if (!taxYear || !calculationData) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: taxYear and calculationData'
        });
      }
      
      const result = await saveCalculation(userData.userId, taxYear, calculationData);
      
      return res.status(200).json({
        success: true,
        message: 'Calculation saved successfully',
        data: {
          id: result.id,
          taxYear: result.tax_year,
          savedAt: result.updated_at
        }
      });
    }

    if (req.method === 'GET') {
      // Get calculation
      const taxYear = parseInt(req.query.taxYear) || new Date().getFullYear();
      
      const result = await getCalculation(userData.userId, taxYear);
      
      return res.status(200).json({
        success: true,
        data: result
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}