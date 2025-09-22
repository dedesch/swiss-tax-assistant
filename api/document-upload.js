// Document Upload API Handler
import DocumentProcessor from '../lib/document-processor.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

// JWT_SECRET configuration with development fallback
const JWT_SECRET = process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production');
    }
    console.warn('WARNING: Using default JWT_SECRET for development. Set JWT_SECRET environment variable for production.');
    return 'dev_secret_change_in_production_' + Date.now();
})();
const documentProcessor = new DocumentProcessor();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; // PDF removed for clarity
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'), false);
        }
    }
});

// Verify JWT token
function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No valid authorization token provided');
    }
    
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
}

export default async function handler(req, res) {
    // Restrictive CORS headers for authenticated endpoint
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5000', 'https://localhost:5000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const userData = verifyToken(req);

        if (req.method === 'POST') {
            // Handle file upload
            upload.single('document')(req, res, async (err) => {
                if (err) {
                    console.error('Upload error:', err);
                    return res.status(400).json({
                        success: false,
                        error: err.message
                    });
                }

                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        error: 'No file uploaded'
                    });
                }

                try {
                    // Process the document
                    const result = await documentProcessor.processDocument(
                        req.file.buffer,
                        req.file.originalname,
                        req.file.mimetype
                    );

                    if (result.success) {
                        return res.status(200).json({
                            success: true,
                            message: 'Document processed successfully',
                            data: {
                                documentType: result.documentType,
                                extractedData: result.extractedData,
                                fileName: result.fileName,
                                processingTime: new Date().toISOString()
                            }
                        });
                    } else {
                        return res.status(400).json({
                            success: false,
                            error: result.error
                        });
                    }

                } catch (processingError) {
                    console.error('Document processing error:', processingError);
                    return res.status(500).json({
                        success: false,
                        error: 'Failed to process document: ' + processingError.message
                    });
                }
            });
        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

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