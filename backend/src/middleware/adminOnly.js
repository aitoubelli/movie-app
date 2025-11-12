import { verifyFirebaseToken } from './auth.js';
import User from '../models/User.js';

export const adminOnly = async (req, res, next) => {
    try {
        await verifyFirebaseToken(req, res, () => { });

        const user = await User.findOne({ firebaseUid: req.user.uid });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Error in adminOnly middleware:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
