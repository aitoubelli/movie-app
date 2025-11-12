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

// Movie functions
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

export async function getMovieRecommendations(id, page = 1) {
    try {
        const response = await tmdbApi.get(`/movie/${id}/recommendations`, {
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
        console.error(`Error fetching recommendations for movie ${id}:`, error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Movie recommendations not found',
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
            error: `Failed to fetch recommendations for movie ${id}`,
            status: error.response?.status || 500,
        };
    }
}

// Series functions
export async function getTrendingSeries(page = 1) {
    try {
        const response = await tmdbApi.get('/trending/tv/week', {
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
        console.error('Error fetching trending series:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Trending series not found',
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
            error: 'Failed to fetch trending series',
            status: error.response?.status || 500,
        };
    }
}

export async function getPopularSeries(page = 1) {
    try {
        const response = await tmdbApi.get('/tv/popular', {
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
        console.error('Error fetching popular series:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Popular series not found',
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
            error: 'Failed to fetch popular series',
            status: error.response?.status || 500,
        };
    }
}

export async function getSeriesById(id) {
    try {
        const response = await tmdbApi.get(`/tv/${id}`, {
            params: {
                append_to_response: 'credits',
            },
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error(`Error fetching series with ID ${id}:`, error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Series not found',
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
            error: `Failed to fetch series with ID ${id}`,
            status: error.response?.status || 500,
        };
    }
}

export async function getSeriesRecommendations(id, page = 1) {
    try {
        const response = await tmdbApi.get(`/tv/${id}/recommendations`, {
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
        console.error(`Error fetching recommendations for series ${id}:`, error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Series recommendations not found',
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
            error: `Failed to fetch recommendations for series ${id}`,
            status: error.response?.status || 500,
        };
    }
}

// Anime functions (using discover endpoint with animation genre and Japanese origin)
export async function getTrendingAnime(page = 1) {
    try {
        const response = await tmdbApi.get('/discover/tv', {
            params: {
                page,
                with_genres: 16, // Animation genre
                with_origin_country: 'JP', // Japanese origin
                sort_by: 'popularity.desc',
            },
        });

        return {
            success: true,
            data: response.data,
            page: response.data.page,
            totalPages: response.data.total_pages,
            totalResults: response.data.total_results,
        };
    } catch (error) {
        console.error('Error fetching trending anime:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Trending anime not found',
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
            error: 'Failed to fetch trending anime',
            status: error.response?.status || 500,
        };
    }
}

export async function getPopularAnime(page = 1) {
    try {
        const response = await tmdbApi.get('/discover/tv', {
            params: {
                page,
                with_genres: 16, // Animation genre
                with_origin_country: 'JP', // Japanese origin
                sort_by: 'vote_average.desc',
            },
        });

        return {
            success: true,
            data: response.data,
            page: response.data.page,
            totalPages: response.data.total_pages,
            totalResults: response.data.total_results,
        };
    } catch (error) {
        console.error('Error fetching popular anime:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Popular anime not found',
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
            error: 'Failed to fetch popular anime',
            status: error.response?.status || 500,
        };
    }
}

export async function getAnimeById(id) {
    try {
        const response = await tmdbApi.get(`/tv/${id}`, {
            params: {
                append_to_response: 'credits',
            },
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error(`Error fetching anime with ID ${id}:`, error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Anime not found',
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
            error: `Failed to fetch anime with ID ${id}`,
            status: error.response?.status || 500,
        };
    }
}

export async function getAnimeRecommendations(id, page = 1) {
    try {
        const response = await tmdbApi.get(`/tv/${id}/recommendations`, {
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
        console.error(`Error fetching recommendations for anime ${id}:`, error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Anime recommendations not found',
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
            error: `Failed to fetch recommendations for anime ${id}`,
            status: error.response?.status || 500,
        };
    }
}
