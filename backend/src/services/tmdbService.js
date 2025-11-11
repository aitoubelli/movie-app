import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

if (!API_KEY) {
    throw new Error('TMDB_API_KEY is not defined in environment variables');
}

const tmdbApi = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
        api_key: API_KEY,
    },
});

export async function getTrendingMovies(page = 1) {
    try {
        const response = await tmdbApi.get('/trending/movie/week', {
            params: { page },
        });

        return {
            success: true,
            data: response.data,
            page: response.data.page,
            totalPages: response.data.total_pages,
            totalResults: response.data.total_results,
        };
    } catch (error) {
        console.error('Error fetching trending movies:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Trending movies not found',
                status: 404,
            };
        }

        if (error.response?.status === 429) {
            return {
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                status: 429,
            };
        }

        return {
            success: false,
            error: 'Failed to fetch trending movies',
            status: error.response?.status || 500,
        };
    }
}

export async function getPopularMovies(page = 1) {
    try {
        const response = await tmdbApi.get('/movie/popular', {
            params: { page },
        });

        return {
            success: true,
            data: response.data,
            page: response.data.page,
            totalPages: response.data.total_pages,
            totalResults: response.data.total_results,
        };
    } catch (error) {
        console.error('Error fetching popular movies:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Popular movies not found',
                status: 404,
            };
        }

        if (error.response?.status === 429) {
            return {
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                status: 429,
            };
        }

        return {
            success: false,
            error: 'Failed to fetch popular movies',
            status: error.response?.status || 500,
        };
    }
}

export async function getMovieById(id) {
    try {
        const response = await tmdbApi.get(`/movie/${id}`, {
            params: {
                append_to_response: 'credits',
            },
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error(`Error fetching movie with ID ${id}:`, error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Movie not found',
                status: 404,
            };
        }

        if (error.response?.status === 429) {
            return {
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                status: 429,
            };
        }

        return {
            success: false,
            error: `Failed to fetch movie with ID ${id}`,
            status: error.response?.status || 500,
        };
    }
}
