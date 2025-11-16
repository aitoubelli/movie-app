import express from 'express';
import axios from 'axios';

const router = express.Router();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const tmdbApi = axios.create({
    baseURL: TMDB_BASE_URL,
    timeout: 5000, // 5s timeout as requested
    params: {
        api_key: API_KEY,
    },
});

// Get genre IDs from names - read-only mapping
const genreMap = {
    movie: {
        'Action': 28,
        'Adventure': 12,
        'Animation': 16,
        'Comedy': 35,
        'Crime': 80,
        'Documentary': 99,
        'Drama': 18,
        'Fantasy': 14,
        'Horror': 27,
        'Mystery': 9648,
        'Romance': 10749,
        'Sci-Fi': 878,
        'Thriller': 53,
        'War': 10752,
        'Western': 37,
    },
    tv: {
        'Action': 10759,  // Action & Adventure
        'Adventure': 10759,  // Action & Adventure (covered by Action)
        'Animation': 16,
        'Comedy': 35,
        'Crime': 80,
        'Documentary': 99,
        'Drama': 18,
        'Fantasy': 10765,  // Fantasy & Sci-Fi
        'Horror': 27,
        'Mystery': 9648,
        'Romance': 10749,
        'Sci-Fi': 10765,  // Sci-Fi & Fantasy (covered by Fantasy)
        'Thriller': 53,
        'War': 10768,  // War & Politics
        'Western': 37,
    }
};

// Map to TMDB genres
const getGenreId = (genreName, contentType) => {
    if (genreName === 'all') return null;

    // Handle case-insensitive lookup
    const normalizedGenre = genreName.charAt(0).toUpperCase() + genreName.slice(1).toLowerCase();

    return genreMap[contentType]?.[normalizedGenre] || null;
};

// Map sortBy to TMDB parameters
const getSortParams = (sortBy, contentType) => {
    switch (sortBy) {
        case 'popular':
            return { sort_by: 'popularity.desc' };
        case 'top_rated':
            return {
                sort_by: 'vote_average.desc',
                'vote_count.gte': contentType === 'movie' ? 100 : 50
            };
        case 'newest':
            return {
                sort_by: contentType === 'movie' ? 'release_date.desc' : 'first_air_date.desc'
            };
        case 'trending':
            return null; // Use trending endpoint instead
        default:
            return { sort_by: 'popularity.desc' };
    }
};

// Build complete TMDB params for filters
const buildFilterParams = (filters, contentType) => {
    const params = {};

    // Genre filter
    if (filters.genre !== 'all') {
        const genreId = getGenreId(filters.genre, contentType);
        if (genreId) {
            params.with_genres = genreId;
        }
    }

    // Year filter
    if (filters.year !== 'all') {
        params[contentType === 'movie' ? 'primary_release_year' : 'first_air_date_year'] = filters.year;
    }

    // Rating filter (exact value, no padding)
    if (filters.rating !== 'all') {
        const minRating = parseFloat(filters.rating);
        params['vote_average.gte'] = minRating;
        params['vote_count.gte'] = 1; // Ensure some quality
    }

    // Language filter
    if (filters.language !== 'all') {
        params.with_original_language = filters.language.toLowerCase();
    }

    return params;
};

// Removed anime handling - now handled by separate /api/anime route

// Format TMDB item to our response format (movies & TV only)
const formatContentItem = (item, contentType) => ({
    id: item.id,
    title: item.title || item.name,
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    rating: item.vote_average || 0,
    year: (item.release_date || item.first_air_date)?.substring(0, 4) || 'Unknown',
    type: contentType,
    genres: item.genre_ids || [] // Include genre IDs like TMDB provides
});

// Fetch results for movies or TV only (24 results per page)
const fetchSingleType = async (contentType, filters, pageNum) => {
    const params = { page: pageNum };
    let endpoint;

    // Choose endpoint based on sortBy
    if (filters.sortBy === 'trending') {
        endpoint = `/trending/${contentType}/day`;
    } else {
        const sortParams = getSortParams(filters.sortBy, contentType);
        if (sortParams) {
            Object.assign(params, sortParams);
        }

        // Use discover when we have filters, or popular/top_rated for others
        const hasFilters = filters.genre !== 'all' || filters.year !== 'all' ||
            filters.rating !== 'all' || filters.language !== 'all';

        if (hasFilters) {
            endpoint = `/discover/${contentType}`;
        } else {
            if (filters.sortBy === 'popular') {
                endpoint = `/${contentType}/popular`;
            } else if (filters.sortBy === 'top_rated') {
                endpoint = `/${contentType}/top_rated`;
            } else {
                endpoint = `/discover/${contentType}`;
            }
        }
    }

    // Build and merge filter parameters
    const filterParams = buildFilterParams(filters, contentType);
    Object.assign(params, filterParams);

    try {
        const response = await tmdbApi.get(endpoint, { params });
        const results = response.data.results.map(item =>
            formatContentItem(item, contentType)
        );

        return {
            results,
            totalResults: response.data.total_results,
            totalPages: response.data.total_pages
        };
    } catch (error) {
        console.error(`Error fetching ${contentType}:`, error.message);
        throw error;
    }
};

// Fetch and interleave movies and TV for type="all"
const fetchAllTypes = async (filters, pageNum) => {
    try {
        // Fetch movies and TV separately for this page
        const [movieData, tvData] = await Promise.all([
            fetchSingleType('movie', { ...filters, type: 'movie' }, pageNum),
            fetchSingleType('tv', { ...filters, type: 'tv' }, pageNum)
        ]);

        const movies = movieData.results || [];
        const tvShows = tvData.results || [];

        // Interleave: movie, tv, movie, tv...
        const interleaved = [];
        const maxLen = Math.max(movies.length, tvShows.length);

        for (let i = 0; i < maxLen && interleaved.length < 24; i++) {
            if (i < movies.length) interleaved.push(movies[i]);
            if (i < tvShows.length && interleaved.length < 24) interleaved.push(tvShows[i]);
        }

        return {
            results: interleaved,
            totalResults: movieData.totalResults + tvData.totalResults,
            totalPages: Math.max(movieData.totalPages, tvData.totalPages)
        };
    } catch (error) {
        console.error('Error fetching all types:', error.message);
        throw error;
    }
};

router.get('/', async (req, res) => {
    try {
        const {
            type = 'all',
            genre = 'all',
            year = 'all',
            rating = 'all',
            sortBy = 'popular',
            language = 'all',
            search = '',
            page = 1
        } = req.query;

        const pageNum = parseInt(page) || 1;

        // If there's a search query, redirect to search
        if (search && search.length >= 2) {
            return res.redirect(`/search?q=${encodeURIComponent(search)}&type=${type}&page=${page}`);
        }

        // Validate type parameter
        if (type !== 'all' && type !== 'movie' && type !== 'tv') {
            return res.status(400).json({
                success: false,
                error: 'Invalid type parameter. Must be "all", "movie", or "tv".',
            });
        }

        const filters = { type, genre, year, rating, sortBy, language };

        let responseData;

        if (type === 'all') {
            // Fetch movies and TV, then interleave
            responseData = await fetchAllTypes(filters, pageNum);
        } else {
            // Single type: movie or tv only
            responseData = await fetchSingleType(type, filters, pageNum);
        }

        res.json({
            success: true,
            results: responseData.results,
            page: pageNum,
            totalPages: responseData.totalPages,
            totalResults: responseData.totalResults,
            appliedFilters: filters
        });

    } catch (error) {
        console.error('Error in browse route:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                error: 'Content not found',
            });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
            });
        }

        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Failed to fetch browse content',
        });
    }
});

// Get genres endpoint
router.get('/genres', async (req, res) => {
    try {
        const { type = 'movie' } = req.query;
        const endpoint = type === 'movie' ? '/genre/movie/list' : '/genre/tv/list';

        const response = await tmdbApi.get(endpoint);

        res.json({
            success: true,
            genres: response.data.genres
        });
    } catch (error) {
        console.error('Error fetching genres:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch genres',
        });
    }
});

export default router;
