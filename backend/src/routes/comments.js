import express from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { postComment, getCommentsByMovie } from '../controllers/commentController.js';

const router = express.Router();

// POST /api/comments - protected route for posting comments
router.post('/', verifyFirebaseToken, postComment);

// GET /api/comments/:movieId - public route for getting comments by movie
router.get('/:movieId', getCommentsByMovie);

export default router;
