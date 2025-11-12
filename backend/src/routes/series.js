import express from 'express';
import {
  getTrendingSeries,
  getPopularSeries,
  getSeriesById,
  getSeriesRecommendations,
} from '../services/tmdbService.js';

const router = express.Router();

router.get('/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await getTrendingSeries(page);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.status).json({
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in /trending route:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await getPopularSeries(page);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.status).json({
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in /popular route:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getSeriesById(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.status).json({
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in /:id route:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

router.get('/:id/recommendations', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const result = await getSeriesRecommendations(id, page);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.status).json({
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in /:id/recommendations route:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;
