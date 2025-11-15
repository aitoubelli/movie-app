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
            username: user.username,
            name: user.name,
            avatar: user.avatar,
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
        let user = await User.findOne({ firebaseUid: req.user.uid });

        // If user doesn't exist, create one with Firebase data
        if (!user) {
            user = new User({
                firebaseUid: req.user.uid,
                email: req.user.email || '',
                name: req.user.name || '',
                username: '',
                avatar: 0,
                role: 'user',
            });
            await user.save();
        } else {
            // Update name if it differs from Firebase and user hasn't set a custom name
            if (req.user.name && user.name !== req.user.name) {
                user.name = req.user.name;
                await user.save();
            }
        }

        res.json({
            uid: user.firebaseUid,
            email: user.email,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected route: PUT /api/profile
router.put('/profile', verifyFirebaseToken, async (req, res) => {
    try {
        const { username, name, avatar } = req.body;

        // Username validation
        if (username !== undefined && typeof username !== 'string') {
            return res.status(400).json({ error: 'Invalid username format' });
        }

        // Name validation (required)
        if (name === undefined || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'Valid name is required' });
        }

        if (avatar !== undefined && (typeof avatar !== 'number' || avatar < 0 || avatar > 19)) {
            return res.status(400).json({ error: 'Invalid avatar selection' });
        }

        const updateData = {
            name: name.trim(),
            avatar,
        };

        // Only update username if provided
        if (username !== undefined) {
            updateData.username = username.trim();
        }

        const user = await User.findOneAndUpdate(
            { firebaseUid: req.user.uid },
            updateData,
            { new: true, runValidators: true },
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                uid: user.firebaseUid,
                email: user.email,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

export default router;
