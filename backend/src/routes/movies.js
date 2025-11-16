import express from 'express';
import axios from 'axios';
import { verifyFirebaseToken } from '../middleware/auth.js';
import {
    getTrending,
    getPopular,
    getDetails,
    getRecommendations,
    search,
} from '../services/tmdbService.js';
import ContinueWatching from '../models/ContinueWatching.js';

const router = express.Router();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const tmdbApi = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
        api_key: API_KEY,
    },
});

// Helper function to validate type parameter
const validateType = (type) => {
    const validTypes = ['movie', 'tv'];
    return validTypes.includes(type);
};

router.get('/trending', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const type = req.query.type || 'movie';

        if (!validateType(type)) {
            return res.status(400).json({
                error: 'Invalid type parameter. Must be "movie" or "tv"',
            });
        }

        const result = await getTrending(type, 'week', page);

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
        const type = req.query.type || 'movie';

        if (!validateType(type)) {
            return res.status(400).json({
                error: 'Invalid type parameter. Must be "movie" or "tv"',
            });
        }

        const result = await getPopular(type, page);

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

router.get('/now-playing', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;

        const response = await tmdbApi.get('/movie/now_playing', {
            params: { page },
        });

        const result = {
            success: true,
            data: response.data,
            page: response.data.page,
            totalPages: response.data.total_pages,
            totalResults: response.data.total_results,
        };

        res.json(result);
    } catch (error) {
        console.error('Error fetching now playing movies:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            return res.status(404).json({
                error: 'Now playing movies not found',
            });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({
                error: 'Rate limit exceeded. Please try again later.',
            });
        }

        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch now playing movies',
        });
    }
});



router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const type = req.query.type || 'movie';

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
        const type = req.query.type || 'movie';

        if (!validateType(type)) {
            return res.status(400).json({
                error: 'Invalid type parameter. Must be "movie" or "tv"',
            });
        }

        const result = await getRecommendations(type, id, page);

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
        const { q, type } = req.query;
        const page = parseInt(req.query.page) || 1;
        const searchType = type || 'movie';

        if (!q || q.length < 2) {
            return res.status(400).json({
                error: 'Query parameter "q" must be at least 2 characters long',
            });
        }

        if (!validateType(searchType)) {
            return res.status(400).json({
                error: 'Invalid type parameter. Must be "movie" or "tv"',
            });
        }

        const result = await search(searchType, q, page);

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
