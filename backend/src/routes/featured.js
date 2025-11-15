import express from 'express';
import { adminOnly } from '../middleware/adminOnly.js';
import {
  addFeaturedMovie,
  removeFeaturedMovie,
  getFeaturedMovies,
} from '../controllers/featuredController.js';

const router = express.Router();

router.get('/featured', getFeaturedMovies);

router.post('/admin/featured', adminOnly, addFeaturedMovie);

router.delete('/admin/featured/:movieId', adminOnly, removeFeaturedMovie);

export default router;
