import express from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { postComment, getCommentsByContent, postReply, likeComment, likeReply } from '../controllers/commentController.js';

const router = express.Router();

// POST /api/comments - protected route for posting comments
router.post('/', verifyFirebaseToken, postComment);

// GET /api/comments/:contentId - public route for getting comments by content
router.get('/:contentId', getCommentsByContent);

// POST /api/comments/reply - protected route for posting replies
router.post('/reply', verifyFirebaseToken, postReply);

// POST /api/comments/:commentId/like - protected route for liking comments
router.post('/:commentId/like', verifyFirebaseToken, likeComment);

// POST /api/comments/reply/:replyId/like - protected route for liking replies
router.post('/reply/:replyId/like', verifyFirebaseToken, likeReply);

export default router;
