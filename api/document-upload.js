// Vercel serverless function for document upload and processing
import jwt from 'jsonwebtoken';
import multer from 'multer';
import DocumentProcessor from '../lib/document-processor.js';
import { createTables } from '../lib/supabase.js';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
        }
    }
});

// Initialize document processor
const documentProcessor = new DocumentProcessor();

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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Use multer middleware for file upload
    return new Promise((resolve) => {
        upload.single('document')(req, res, async (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    res.status(400).json({ error: 'File size too large. Maximum size is 10MB.' });
                } else {
                    res.status(400).json({ error: err.message });
                }
                return resolve();
            }

            try {
                // Verify authentication - required for all users
                const authHeader = req.headers.authorization;
                const token = authHeader && authHeader.split(' ')[1];

                if (!token) {
                    res.status(401).json({ error: 'Authentication required' });
                    return resolve();
                }

                let user;
                try {
                    // Verify JWT_SECRET is properly configured
                    if (!process.env.JWT_SECRET) {
                        console.error('CRITICAL: JWT_SECRET environment variable is not set');
                        res.status(500).json({ error: 'Server configuration error' });
                        return resolve();
                    }
                    user = jwt.verify(token, process.env.JWT_SECRET);
                } catch (error) {
                    res.status(403).json({ error: 'Invalid token' });
                    return resolve();
                }

                if (!req.file) {
                    res.status(400).json({ error: 'No file uploaded' });
                    return resolve();
                }

                // Process document using OpenAI Vision
                const result = await documentProcessor.processDocument(
                    req.file.buffer,
                    req.file.originalname,
                    req.file.mimetype
                );

                if (!result.success) {
                    res.status(400).json({
                        success: false,
                        error: result.error
                    });
                    return resolve();
                }

                res.json({
                    success: true,
                    message: 'Document processed successfully',
                    documentType: result.documentType,
                    extractedData: result.extractedData,
                    fileName: result.fileName,
                    userId: user.userId,
                    timestamp: new Date().toISOString()
                });
                return resolve();

            } catch (error) {
                console.error('Document upload error:', error);
                res.status(500).json({ error: 'Document processing failed' });
                return resolve();
            }
        });
    });
}

// Required for Vercel to handle file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};