import express from 'express';
import axios from 'axios';

const router = express.Router();

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

const jikanApi = axios.create({
    baseURL: JIKAN_BASE_URL,
    timeout: 5000, // 5s timeout
});

// Jikan genre mapping (from https://api.jikan.moe/v4/genres/anime)
const jikanGenreMap = {
    'Action': 1,
    'Adventure': 2,
    'Animation': 19, // TV series, but we want general anime
    'Comedy': 4,
    'Crime': 8,
    'Documentary': 12, // Probably not applicable for anime
    'Drama': 8,
    'Fantasy': 10,
    'Horror': 14,
    'Mystery': 7,
    'Romance': 22,
    'Sci-Fi': 24,
    'Thriller': 41,
    'War': 38,
    'Western': 37, // Might not apply to anime
};

// Format Jikan anime item to TMDB-like response format
const formatAnimeItem = (item) => ({
    id: item.mal_id,
    title: item.title,
    name: item.title, // For anime, title and name are same
    poster_path: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || null,
    backdrop_path: item.images?.jpg?.large_image_url || null, // Jikan doesn't have backdrop
    release_date: item.aired?.from ? item.aired.from.split('T')[0] : null, // Use aired.from date
    first_air_date: item.aired?.from ? item.aired.from.split('T')[0] : null,
    vote_average: item.score || 0,
    vote_count: item.scored_by || 0,
    genres: item.genres?.map(g => ({ id: g.mal_id, name: g.name })) || [],
    genre_ids: item.genres?.map(g => g.mal_id) || []
});

// Map sortBy to Jikan parameters
const getJikanSortParams = (sortBy) => {
    switch (sortBy) {
        case 'popular':
            return { order_by: 'popularity', sort_order: 'asc' };
        case 'top_rated':
            return { order_by: 'score', sort_order: 'desc' };
        case 'newest':
            return { order_by: 'start_date', sort_order: 'desc' };
        case 'trending':
        default:
            return {}; // Use /seasons/now for trending
    }
};

// Fetch anime from Jikan API
const fetchAnime = async (filters, pageNum) => {
    const params = { page: pageNum, limit: 24 };

    try {
        let endpoint;
        let additionalParams = {};

        // Handle trending via /seasons/now
        if (filters.sortBy === 'trending') {
            endpoint = '/seasons/now';
        } else {
            endpoint = '/anime';

            // Map genre filter
            if (filters.genre !== 'all') {
                const normalizedGenre = filters.genre.charAt(0).toUpperCase() + filters.genre.slice(1).toLowerCase();
                const genreId = jikanGenreMap[normalizedGenre];
                if (genreId) {
                    additionalParams.genres = genreId;
                }
            }

            // Year filter using start_date
            if (filters.year !== 'all') {
                const yearStart = `${filters.year}-01-01`;
                const yearEnd = `${filters.year}-12-31`;
                additionalParams.start_date = `${yearStart},${yearEnd}`;
            }

            // Rating filter (score >= rating)
            if (filters.rating !== 'all') {
                const minRating = parseFloat(filters.rating);
                additionalParams.score = minRating;
            }

            // Search query
            if (filters.search && filters.search.length >= 2) {
                additionalParams.q = filters.search;
            }

            // Sort parameters
            Object.assign(params, getJikanSortParams(filters.sortBy));
        }

        // Apply additional filters
        Object.assign(params, additionalParams);

        const response = await jikanApi.get(endpoint, { params });
        const results = response.data.data.map(formatAnimeItem);

        return {
            results,
            totalResults: response.data.pagination.items.total || results.length * 10, // Approximate
            totalPages: response.data.pagination.last_visible_page
        };
    } catch (error) {
        if (error.response?.status === 429) {
            console.warn('Jikan API rate limit hit:', error.message);
            // Return empty results for rate limit
            return { results: [], totalResults: 0, totalPages: 0 };
        }
        console.error('Error fetching anime:', error.message);
        throw error;
    }
};

// Trending endpoint - calls /seasons/now for current season anime
router.get('/trending', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;

        const filters = {
            genre: 'all',
            year: 'all',
            rating: 'all',
            sortBy: 'trending',
            language: 'all',
            search: ''
        };

        const responseData = await fetchAnime(filters, page);

        // Transform response to match TMDB format expected by frontend
        res.json({
            success: true,
            data: {
                results: responseData.results,
                page,
                total_pages: responseData.totalPages,
                total_results: responseData.totalResults
            }
        });

    } catch (error) {
        console.error('Error fetching trending anime:', error.response?.data || error.message);

        if (error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'Anime API rate limit exceeded. Please try again later.',
            });
        }

        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Failed to fetch trending anime',
        });
    }
});

// Popular endpoint - anime sorted by popularity
router.get('/popular', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;

        const filters = {
            genre: 'all',
            year: 'all',
            rating: 'all',
            sortBy: 'popular',
            language: 'all',
            search: ''
        };

        const responseData = await fetchAnime(filters, page);

        // Transform response to match TMDB format expected by frontend
        res.json({
            success: true,
            data: {
                results: responseData.results,
                page,
                total_pages: responseData.totalPages,
                total_results: responseData.totalResults
            }
        });

    } catch (error) {
        console.error('Error fetching popular anime:', error.response?.data || error.message);

        if (error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'Anime API rate limit exceeded. Please try again later.',
            });
        }

        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Failed to fetch popular anime',
        });
    }
});

// Now-playing endpoint - recent/current season anime
router.get('/now-playing', async (req, res) => {
    try {
        // For anime, "now-playing" means recent/current seasons
        const page = parseInt(req.query.page) || 1;

        // Use seasons/now endpoint for current season anime
        const response = await jikanApi.get('/seasons/now', {
            params: { page, limit: 24 }
        });

        const results = response.data.data.map(formatAnimeItem);

        // Transform response to match TMDB format expected by frontend
        res.json({
            success: true,
            data: {
                results,
                page,
                total_pages: response.data.pagination.last_visible_page,
                total_results: response.data.pagination.items.total || results.length * 10
            }
        });

    } catch (error) {
        console.error('Error fetching now-playing anime:', error.response?.data || error.message);

        if (error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'Anime API rate limit exceeded. Please try again later.',
            });
        }

        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Failed to fetch now-playing anime',
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const {
            genre = 'all',
            year = 'all',
            rating = 'all',
            sortBy = 'popular',
            language = 'all', // Not used by Jikan (only Japanese anime)
            search = '',
            page = 1
        } = req.query;

        const pageNum = parseInt(page) || 1;

        // Validate sortBy
        if (!['popular', 'top_rated', 'newest', 'trending'].includes(sortBy)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid sortBy parameter. Must be "popular", "top_rated", "newest", or "trending".',
            });
        }

        const filters = { genre, year, rating, sortBy, language, search };

        const responseData = await fetchAnime(filters, pageNum);

        res.json({
            success: true,
            results: responseData.results,
            page: pageNum,
            totalPages: responseData.totalPages,
            totalResults: responseData.totalResults,
            appliedFilters: filters
        });

    } catch (error) {
        console.error('Error in anime route:', error.response?.data || error.message);

        if (error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'Anime API rate limit exceeded. Please try again later.',
            });
        }

        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Failed to fetch anime content',
        });
    }
});

// Get individual anime details by MAL ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const response = await jikanApi.get(`/anime/${id}/full`);
        const anime = response.data.data;

        // Transform Jikan data to TMDB-like format expected by frontend
        const transformedAnime = {
            id: anime.mal_id,
            name: anime.title,
            poster_path: anime.images?.jpg?.large_image_url || null,
            backdrop_path: anime.images?.jpg?.large_image_url || null, // Jikan doesn't have backdrop
            first_air_date: anime.aired?.from || anime.year?.toString(),
            overview: anime.synopsis || 'No description available.',
            vote_average: anime.score || 0,
            vote_count: anime.scored_by || 0,
            episode_run_time: [anime.duration ? parseInt(anime.duration.split(' ')[0]) : 24], // Extract minutes
            number_of_seasons: anime.season ? 1 : null, // Jikan doesn't have seasons info easily
            number_of_episodes: anime.episodes || 1,
            genres: anime.genres?.map(genre => ({
                id: genre.mal_id,
                name: genre.name
            })) || [],
            credits: {
                cast: [] // Jikan doesn't provide detailed cast info in basic endpoint
            },
            production_companies: anime.studios?.map(studio => ({
                id: studio.mal_id,
                name: studio.name
            })) || []
        };

        res.json({
            success: true,
            data: transformedAnime
        });

    } catch (error) {
        console.error('Error fetching anime details:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                error: 'Anime not found',
            });
        }

        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Failed to fetch anime details',
        });
    }
});

// Get anime genres endpoint
router.get('/genres', async (req, res) => {
    try {
        const response = await jikanApi.get('/genres/anime');

        res.json({
            success: true,
            genres: response.data.data.map(genre => ({
                id: genre.mal_id,
                name: genre.name
            }))
        });
    } catch (error) {
        console.error('Error fetching anime genres:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch anime genres',
        });
    }
});

export default router;
