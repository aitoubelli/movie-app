import express from 'express';
import {
  getTrending,
  getPopularSeries,
  getDetails,
  getSeriesRecommendations,
} from '../services/tmdbService.js';

// Helper function to validate type parameter
const validateType = (type) => {
  const validTypes = ['movie', 'tv'];
  return validTypes.includes(type);
};

const router = express.Router();

router.get('/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await getTrending('tv', 'week', page);

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
    const result = await getDetails('tv', id);

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

// New route for content details with type in path
router.get('/content/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!validateType(type)) {
      return res.status(400).json({
        error: 'Invalid type parameter. Must be "movie" or "tv"',
      });
    }

    const result = await getDetails(type, id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.status).json({
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in /content/:type/:id route:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;
