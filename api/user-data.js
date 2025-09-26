// Vercel serverless function for user authentication
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail } from '../lib/supabase.js';

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
        const { action, email, password } = req.body;

        if (action === 'register') {
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters' });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = await createUser(email, hashedPassword);
            
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET || (() => { 
                    console.error('CRITICAL: JWT_SECRET environment variable is not set'); 
                    throw new Error('JWT_SECRET must be configured'); 
                })(),
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                token,
                user: { id: user.id, email: user.email }
            });

        } else if (action === 'login') {
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const user = await getUserByEmail(email);
            
            if (!user) {
                return res.status(400).json({ error: 'Invalid email or password' });
            }

            const isValid = await bcrypt.compare(password, user.password_hash);

            if (!isValid) {
                return res.status(400).json({ error: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET || (() => { 
                    console.error('CRITICAL: JWT_SECRET environment variable is not set'); 
                    throw new Error('JWT_SECRET must be configured'); 
                })(),
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                token,
                user: { id: user.id, email: user.email }
            });

        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('User data handler error:', error);
        if (error.message === 'Email already exists') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
}