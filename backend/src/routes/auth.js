import express from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Protected route: GET /api/dashboard
router.get('/dashboard', verifyFirebaseToken, (req, res) => {
    res.json({
        message: 'Access granted',
        user: {
            uid: req.user.uid,
            email: req.user.email,
        },
    });
});

// Protected route: GET /api/auth/me
router.get('/me', verifyFirebaseToken, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user.uid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            uid: user.firebaseUid,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected route: GET /api/profile
router.get('/profile', verifyFirebaseToken, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user.uid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            uid: user.firebaseUid,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
