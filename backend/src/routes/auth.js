import express from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';

const router = express.Router();

// Protected route: GET /api/dashboard
router.get('/dashboard', verifyFirebaseToken, (req, res) => {
    res.json({
        message: "Access granted",
        user: {
            uid: req.user.uid,
            email: req.user.email
        }
    });
});

export default router;
