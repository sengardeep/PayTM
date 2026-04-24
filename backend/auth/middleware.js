import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js';

export const authMiddleware = (req,res,next)=>{
    const authHeader = req.headers.authorization;

    // Require a bearer token so downstream handlers can trust req.userId.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token,JWT_SECRET);

        // Reject malformed tokens that do not carry the expected subject field.
        if (!decoded?.userId) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        req.userId = decoded.userId;
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};