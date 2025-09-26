// Vercel serverless function for PDF report generation
import jwt from 'jsonwebtoken';

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

    try {
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

        const { calculationData, reportType = 'summary' } = req.body;

        if (!calculationData) {
            return res.status(400).json({ error: 'Calculation data is required' });
        }

        // Generate PDF report (simplified - can be enhanced with jsPDF)
        const reportData = {
            userId: user.userId,
            email: user.email,
            reportType,
            calculations: calculationData,
            generatedAt: new Date().toISOString(),
            reportId: `tax-report-${user.userId}-${Date.now()}`
        };

        // In a full implementation, you would use jsPDF here to generate actual PDF
        // For now, return structured data that can be used by frontend PDF generation
        return res.json({
            success: true,
            message: 'PDF report data generated',
            reportData,
            downloadUrl: `/api/pdf-download/${reportData.reportId}`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        return res.status(500).json({ error: 'PDF generation failed' });
    }
}