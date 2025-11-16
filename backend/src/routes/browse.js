import express from 'express';
import axios from 'axios';

const router = express.Router();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const tmdbApi = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
        api_key: API_KEY,
    },
});

// Validate type parameter
const validateType = (type) => {
    const validTypes = ['movie', 'tv', 'anime'];
    if (type === 'anime') return 'tv'; // Handle anime as tv with animation genre
    return validTypes.includes(type) ? type : null;
};

// Get genre IDs from names
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
const getGenreId = (genreName, type) => {
    if (genreName === 'all') return null;

    // Handle case-insensitive lookup
    const normalizedGenre = genreName.charAt(0).toUpperCase() + genreName.slice(1).toLowerCase();

    return genreMap[type]?.[normalizedGenre] || null;
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
            quality = 'all',
            search = '',
            page = 1
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const resultsPerPage = 24;

        // If there's a search query, redirect to search
        if (search && search.length >= 2) {
            return res.redirect(`/search?q=${encodeURIComponent(search)}&type=${type}&page=${page}`);
        }

        let finalResults = [];
        let totalResults = 0;
        let totalPages = 1;

        // Special handling for 'all' type to combine movies and TV shows
        if (type === 'all') {
            const itemsNeeded = resultsPerPage;
            let currentPage = pageNum;
            let collectedResults = [];
            let moviesResults = [];
            let tvResults = [];

            // Get base parameters for filtering
            let movieParams = { page: currentPage, sort_by: 'popularity.desc' };
            let tvParams = { page: currentPage, sort_by: 'popularity.desc' };

            // Apply sorting logic for 'all'
            if (sortBy === 'popular') {
                movieParams.sort_by = 'popularity.desc';
                tvParams.sort_by = 'popularity.desc';
            } else if (sortBy === 'top_rated') {
                movieParams.sort_by = 'vote_average.desc';
                tvParams.sort_by = 'vote_average.desc';
                movieParams['vote_count.gte'] = 100;
                tvParams['vote_count.gte'] = 50;
            } else if (sortBy === 'upcoming') {
                // Only movies for upcoming
                movieParams = { page: currentPage };
                tvParams = null;
            } else if (sortBy === 'now_playing') {
                movieParams = { page: currentPage };
                tvParams = { page: currentPage, sort_by: 'first_air_date.desc' };
            }

            // Apply filters
            if (genre !== 'all') {
                // For 'all', we need to get genre IDs for both movie and tv
                const movieGenreId = getGenreId(genre, 'movie');
                const tvGenreId = getGenreId(genre, 'tv');

                if (movieGenreId) movieParams.with_genres = movieGenreId;
                if (tvGenreId) tvParams.with_genres = tvGenreId;
            }

            if (year !== 'all') {
                movieParams.primary_release_year = year;
                if (tvParams) tvParams.first_air_date_year = year;
            }

            if (rating !== 'all') {
                const minRating = parseFloat(rating.replace('+', ''));
                movieParams['vote_average.gte'] = minRating;
                tvParams['vote_average.gte'] = minRating;
                movieParams['vote_count.gte'] = 10;
                tvParams['vote_count.gte'] = 10;
            }

            if (language !== 'all') {
                const langCode = language.substring(0, 2).toLowerCase();
                movieParams.with_original_language = langCode;
                tvParams.with_original_language = langCode;
            }

            console.log('All type - Movie params:', movieParams, 'TV params:', tvParams);

            // Make API calls in parallel
            const apiPromises = [];
            if (movieParams) apiPromises.push(tmdbApi.get('/discover/movie', { params: movieParams }));
            if (tvParams) apiPromises.push(tmdbApi.get('/discover/tv', { params: tvParams }));

            const responses = await Promise.allSettled(apiPromises);

            // Process responses
            responses.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const data = result.value.data;

                    // Add type identification to results
                    const formattedResults = data.results.map(item => ({
                        id: item.id, // Keep original ID for API purposes
                        uniqueId: `${item.media_type || (item.title ? 'movie' : 'tv')}_${item.id}`, // Unique key for React
                        title: item.title || item.name,
                        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                        rating: item.vote_average,
                        year: (item.release_date || item.first_air_date)?.substring(0, 4) || 'Unknown',
                        genres: item.genre_ids ? [] : [],
                        overview: item.overview,
                        type: item.media_type || (item.title ? 'movie' : 'tv')
                    }));

                    if (index === 0 && movieParams) {
                        moviesResults = formattedResults.slice(0, 12); // Take half from movies
                        totalResults += data.total_results;
                        totalPages = Math.max(totalPages, data.total_pages);
                    } else if (tvParams) {
                        tvResults = formattedResults.slice(0, 12); // Take half from TV
                        totalResults += data.total_results;
                        totalPages = Math.max(totalPages, data.total_pages);
                    }
                }
            });

            // Combine results: alternate between movies and TV shows for better mix
            finalResults = [];
            const maxLen = Math.max(moviesResults.length, tvResults.length);
            for (let i = 0; i < maxLen; i++) {
                if (i < moviesResults.length) finalResults.push(moviesResults[i]);
                if (i < tvResults.length) finalResults.push(tvResults[i]);
            }

            // Ensure exactly 24 results, prioritized by original sort
            finalResults = finalResults.slice(0, resultsPerPage);

        } else {
            // Single type handling (movie, tv, anime) - get exactly 24 results
            let collectedResults = [];

            // Map logical page to TMDB pages: page 1 = TMDB pages 1&2, page 2 = TMDB pages 3&4, etc.
            const tmdbPage1 = (pageNum * 2) - 1; // page 1 -> 1, page 2 -> 3, page 3 -> 5
            const tmdbPage2 = (pageNum * 2);     // page 1 -> 2, page 2 -> 4, page 3 -> 6
            const tmdbPages = [tmdbPage1, tmdbPage2];

            // Make up to 2 API calls to get enough results for 24 items
            for (let callIndex = 0; callIndex < 2 && collectedResults.length < resultsPerPage; callIndex++) {
                const currentPage = tmdbPages[callIndex];
                let endpoint, params = { page: currentPage };

                // Build parameters based on filters
                if (sortBy === 'popular') {
                    const validType = validateType(type);
                    if (validType === 'movie') {
                        endpoint = '/movie/popular';
                    } else if (validType === 'tv') {
                        if (type === 'anime') {
                            endpoint = '/discover/tv';
                            params.with_genres = 16;
                            params.with_origin_country = 'JP';
                            params.sort_by = 'popularity.desc';
                        } else {
                            endpoint = '/tv/popular';
                        }
                    }
                } else if (sortBy === 'top_rated') {
                    const validType = validateType(type);
                    if (validType === 'movie') {
                        endpoint = '/movie/top_rated';
                    } else if (validType === 'tv') {
                        if (type === 'anime') {
                            endpoint = '/discover/tv';
                            params.with_genres = 16;
                            params.with_origin_country = 'JP';
                            params.sort_by = 'vote_average.desc';
                            params['vote_count.gte'] = 50;
                        } else {
                            endpoint = '/tv/top_rated';
                        }
                    }
                } else if (sortBy === 'upcoming') {
                    endpoint = '/movie/upcoming';
                } else if (sortBy === 'now_playing') {
                    if (type === 'movie') {
                        endpoint = '/movie/now_playing';
                    } else {
                        endpoint = '/tv/on_the_air';
                    }
                } else {
                    endpoint = validateType(type) === 'movie' ? '/discover/movie' : '/discover/tv';
                    params.sort_by = 'popularity.desc';
                }

                // Apply filters
                if (genre !== 'all') {
                    const genreId = getGenreId(genre, validateType(type) || 'movie');
                    if (genreId) {
                        params.with_genres = genreId;
                    }
                }

                if (year !== 'all') {
                    if (type === 'movie') {
                        params.primary_release_year = year;
                    } else {
                        params.first_air_date_year = year;
                    }
                }

                if (rating !== 'all') {
                    const minRating = parseFloat(rating.replace('+', ''));
                    params['vote_average.gte'] = minRating;
                    params['vote_count.gte'] = 10;
                }

                if (language !== 'all') {
                    params.with_original_language = language.substring(0, 2).toLowerCase();
                }

                // Handle anime specific filtering
                if (type === 'anime') {
                    params.with_genres = params.with_genres ? `${params.with_genres},16` : 16;
                    params.with_origin_country = 'JP';
                }

                console.log('Single type endpoint:', endpoint, 'params:', params);

                const response = await tmdbApi.get(endpoint, { params });

                // Format response to match component interface
                const formattedResults = response.data.results.map(item => ({
                    id: item.id, // Keep original ID for API purposes
                    uniqueId: `${type === 'anime' ? 'anime' : (item.media_type || (item.title ? 'movie' : 'tv'))}_${item.id}`, // Unique key for React
                    title: item.title || item.name,
                    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                    rating: item.vote_average,
                    year: (item.release_date || item.first_air_date)?.substring(0, 4) || 'Unknown',
                    genres: item.genre_ids ? [] : [],
                    overview: item.overview,
                    type: type === 'anime' ? 'anime' : (item.media_type || (item.title ? 'movie' : 'tv'))
                }));

                // Add this page's results to collected results
                collectedResults = [...collectedResults, ...formattedResults];

                // Use the total results and pages from the first response
                if (callIndex === 0) {
                    totalResults = response.data.total_results;
                    totalPages = response.data.total_pages;
                }

                // Break if we have enough results
                if (collectedResults.length >= resultsPerPage) {
                    break;
                }
            }

            // Limit to exactly 24 results
            finalResults = collectedResults.slice(0, resultsPerPage);
        }

        res.json({
            success: true,
            results: finalResults,
            page: pageNum,
            totalPages: totalPages,
            totalResults: totalResults,
            filters: {
                type,
                genre,
                year,
                rating,
                sortBy,
                language,
                quality
            }
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
