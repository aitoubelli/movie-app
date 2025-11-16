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
    },
    anime: { // Anime uses TV genres but filters for animation with JP origin
        'Action': 10759,
        'Adventure': 10759,
        'Animation': 16,
        'Comedy': 35,
        'Crime': 80,
        'Documentary': 99,
        'Drama': 18,
        'Fantasy': 10765,
        'Horror': 27,
        'Mystery': 9648,
        'Romance': 10749,
        'Sci-Fi': 10765,
        'Thriller': 53,
        'War': 10768,
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

// Format TMDB item to our response format (movies, TV, and anime)
const formatContentItem = (item, contentType) => {
    // Genre ID to name mapping for TMDB genres
    const genreIdToName = {
        // Movie genres
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
        27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
        10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
        // TV genres
        10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10762: 'Kids', 9648: 'Mystery', 10764: 'News',
        10763: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk',
        10768: 'War & Politics', 37: 'Western'
    };

    // Convert genre IDs to genre names
    const genreNames = (item.genre_ids || item.genres?.map(g => g.id) || [])
        .map(id => genreIdToName[id])
        .filter(name => name); // Remove undefined entries

    return {
        id: item.id,
        title: item.title || item.name,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        rating: item.vote_average || 0,
        year: (item.release_date || item.first_air_date)?.substring(0, 4) || 'Unknown',
        type: contentType,
        genres: genreNames.length > 0 ? genreNames.slice(0, 3) : ['Action'] // Default fallback
    };
};

// Fetch results for movies, TV, or anime
const fetchSingleType = async (contentType, filters, pageNum) => {
    const params = { page: pageNum };
    let endpoint;

    // Special handling for anime - always use discover with animation genre and JP origin
    if (contentType === 'anime') {
        endpoint = '/discover/tv';
        // Force animation genre and Japanese origin for anime
        params.with_genres = 16; // Animation genre
        params.with_origin_country = 'JP';

        // Apply additional filters if specified
        if (filters.genre !== 'all') {
            const genreId = getGenreId(filters.genre, 'anime');
            if (genreId && genreId !== 16) {
                // If user specifies additional genre, combine with animation
                params.with_genres = `${16},${genreId}`;
            }
        }
    } else {
        // Choose endpoint based on sortBy for movies/TV
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
    }

    // Build and merge filter parameters (skip genre for anime as it's handled above)
    const filterParams = contentType === 'anime'
        ? buildFilterParams({ ...filters, genre: 'all' }, contentType)  // Skip genre for anime
        : buildFilterParams(filters, contentType);
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
        if (type !== 'all' && type !== 'movie' && type !== 'tv' && type !== 'anime') {
            return res.status(400).json({
                success: false,
                error: 'Invalid type parameter. Must be "all", "movie", "tv", or "anime".',
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
