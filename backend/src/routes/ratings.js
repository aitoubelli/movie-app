import express from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { postRating, getContentRating } from '../controllers/ratingController.js';

const router = express.Router();

// POST /api/ratings - protected route for posting ratings
router.post('/', verifyFirebaseToken, postRating);

// GET /api/ratings/:contentId - get rating stats, works for authenticated and non-authenticated users
router.get('/:contentId', getContentRating);

export default router;
