const fs = require('fs');
const path = require('path');

// Create directory structure
const dirs = ['api', 'lib', 'public'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File contents
const files = {
  'package.json': `{
  "name": "swiss-tax-assistant",
  "version": "1.0.0",
  "description": "Swiss Tax Declaration Assistant - Full Stack Application",
  "main": "index.js",
  "scripts": {
    "dev": "vercel dev",
    "build": "echo 'No build step required'",
    "start": "vercel dev"
  },
  "dependencies": {
    "@vercel/postgres": "^0.8.0",
    "puppeteer-core": "^21.0.0",
    "chrome-aws-lambda": "^10.1.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["swiss", "tax", "declaration", "assistant", "vercel"],
  "author": "Swiss Tax Assistant",
  "license": "MIT"
}`,

  'vercel.json': `{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/pdf-report.js": {
      "maxDuration": 30
    }
  }
}`,

  'lib/db.js': `import { sql } from '@vercel/postgres';

export async function createTables() {
  try {
    // Users table
    await sql\`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`;

    // Tax calculations table
    await sql\`
      CREATE TABLE IF NOT EXISTS tax_calculations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        tax_year INTEGER NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tax_year)
      )
    \`;

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Database setup error:', error);
    throw error;
  }
}

export async function saveCalculation(userId, taxYear, calculationData) {
  try {
    const result = await sql\`
      INSERT INTO tax_calculations (user_id, tax_year, data)
      VALUES (\${userId}, \${taxYear}, \${JSON.stringify(calculationData)})
      ON CONFLICT (user_id, tax_year) 
      DO UPDATE SET data = \${JSON.stringify(calculationData)}, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    \`;
    return result.rows[0];
  } catch (error) {
    console.error('Save calculation error:', error);
    throw error;
  }
}

export async function getCalculation(userId, taxYear) {
  try {
    const result = await sql\`
      SELECT * FROM tax_calculations 
      WHERE user_id = \${userId} AND tax_year = \${taxYear}
    \`;
    return result.rows[0];
  } catch (error) {
    console.error('Get calculation error:', error);
    throw error;
  }
}`,

  'api/calculations.js': `import { createTables, saveCalculation, getCalculation } from '../lib/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('No token provided');
  return jwt.verify(token, JWT_SECRET);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Initialize database if needed
    await createTables();

    if (req.method === 'POST') {
      // Save calculation
      const userData = verifyToken(req);
      const { taxYear, calculationData } = req.body;
      
      const result = await saveCalculation(userData.userId, taxYear, calculationData);
      
      return res.status(200).json({
        success: true,
        message: 'Calculation saved successfully',
        data: result
      });
    }

    if (req.method === 'GET') {
      // Get calculation
      const userData = verifyToken(req);
      const { taxYear } = req.query;
      
      const result = await getCalculation(userData.userId, taxYear || 2024);
      
      return res.status(200).json({
        success: true,
        data: result
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}`,

  'api/user-data.js': `import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, password } = req.body;

  try {
    if (action === 'register') {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Insert user
      const result = await sql\`
        INSERT INTO users (email, password_hash)
        VALUES (\${email}, \${hashedPassword})
        RETURNING id, email
      \`;

      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        success: true,
        token,
        user: { id: user.id, email: user.email }
      });
    }

    if (action === 'login') {
      // Find user
      const result = await sql\`
        SELECT * FROM users WHERE email = \${email}
      \`;

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({
        success: true,
        token,
        user: { id: user.id, email: user.email }
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Auth error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}`,

  'api/pdf-report.js': `import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { calculationData } = req.body;

    const browser = await puppeteer.launch({
      args: chrome.args,
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });

    const page = await browser.newPage();
    
    // Generate PDF content
    const htmlContent = generatePDFContent(calculationData);
    
    await page.setContent(htmlContent);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm'
      }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="swiss-tax-report.pdf"');
    
    return res.send(pdf);

  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ error: 'PDF generation failed' });
  }
}

function generatePDFContent(data) {
  return \`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Swiss Tax Declaration Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #1e3c72; padding-bottom: 20px; }
        .section { margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .table th { background-color: #f2f2f2; font-weight: bold; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Swiss Tax Declaration Report</h1>
        <p>Tax Year: \${data.taxYear || 2024}</p>
        <p>Generated: \${new Date().toLocaleDateString('de-CH')}</p>
      </div>

      <div class="section">
        <h2>Wealth Declaration Summary</h2>
        <table class="table">
          <tr><th>Category</th><th>Amount (CHF)</th></tr>
          <tr><td>Movable Assets</td><td>\${(data.movableAssets || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
          <tr><td>Real Estate</td><td>\${(data.realEstate || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
          <tr><td>Total Assets</td><td>\${(data.totalAssets || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
          <tr><td>Total Debts</td><td>\${(data.totalDebts || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
          <tr class="total-row"><td>Net Wealth</td><td>\${(data.netWealth || 0).toLocaleString('de-CH', {minimumFractionDigits: 2})}</td></tr>
        </table>
      </div>
    </body>
    </html>
  \`;
}`
};

// Write all files
Object.entries(files).forEach(([filename, content]) => {
  const filepath = path.join(__dirname, filename);
  const dir = path.dirname(filepath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, content);
  //console.log(\`✓ Created \${filename}\`);
});

// Copy the HTML file to public/index.html
console.log('\\n✓ Project structure created successfully!');
console.log('\\nNext steps:');
console.log('1. Copy your HTML file to public/index.html');
console.log('2. Run: npm install');
console.log('3. Run: npx vercel --prod');
console.log('4. Set up environment variables in Vercel dashboard');