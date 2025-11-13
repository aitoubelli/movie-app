import express from 'express';
import {
  getTrendingMovies,
  getPopularMovies,
  getMovieById,
  getMovieRecommendations,
  searchMovies,
} from '../services/tmdbService.js';

const router = express.Router();

router.get('/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await getTrendingMovies(page);

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
    const result = await getPopularMovies(page);

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
    const result = await getMovieById(id);

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
    const result = await getMovieRecommendations(id, page);

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

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;

    if (!q || q.length < 2) {
      return res.status(400).json({
        error: 'Query parameter "q" must be at least 2 characters long',
      });
    }

    const result = await searchMovies(q, page);

    if (result.success) {
      res.json({
        results: result.data.results,
        page: result.page,
        total_pages: result.totalPages,
      });
    } else {
      res.status(result.status).json({
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error in /search route:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;
