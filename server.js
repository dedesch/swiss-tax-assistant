import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Import API handlers
import { calculationsHandler, userDataHandler, pdfReportHandler, documentUploadHandler } from './api-handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security check: ensure JWT_SECRET is configured
if (!process.env.JWT_SECRET) {
    console.error('SECURITY WARNING: JWT_SECRET environment variable is not set!');
    console.error('This is required for secure authentication. Application may not function properly.');
}

// Configure CORS for Replit deployment
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cache control headers for development
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.all('/api/calculations', calculationsHandler);
app.all('/api/user-data', userDataHandler);
app.all('/api/pdf-report', pdfReportHandler);
app.all('/api/document-upload', documentUploadHandler);

// Handle root route - landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle app route - tax declaration interface
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Swiss Tax Assistant running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;