import express from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import {
    addToWatchlist,
    removeFromWatchlist,
    getWatchlist,
} from '../controllers/watchlistController.js';

const router = express.Router();

router.use(verifyFirebaseToken);


router.get('/', getWatchlist);

router.post('/', addToWatchlist);

router.delete('/:movieId', removeFromWatchlist);

export default router;
