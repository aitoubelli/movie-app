import axios from 'axios';
import Content from '../models/Content.js';
import redisClient from '../config/redis.js';

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

// Generic functions
export async function getTrending(type, timeWindow = 'week', page = 1) {
    try {
        // check Redis cache first
        const cacheKey = `trending:${type}:${timeWindow}`;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const endpoint = `/trending/${type}/${timeWindow}`;
        const response = await tmdbApi.get(endpoint, {
            params: { page },
        });

        const upsertPromises = response.data.results.map((item) => {
            const itemData = {
                tmdbId: item.id,
                type: type,
                title: type === 'movie' ? item.title : item.name,
                overview: item.overview,
                poster_path: item.poster_path,
                backdrop_path: item.backdrop_path,
                release_date:
                    type === 'movie'
                        ? item.release_date
                            ? new Date(item.release_date)
                            : null
                        : null,
                first_air_date:
                    type === 'tv'
                        ? item.first_air_date
                            ? new Date(item.first_air_date)
                            : null
                        : null,
                genres: [],
                vote_average: item.vote_average,
                lastFetched: new Date(),
            };

            return Content.findOneAndUpdate({ tmdbId: item.id, type: type }, itemData, {
                upsert: true,
                new: true,
            }).catch((err) => {
                console.error(`Error upserting ${type} ${item.id}:`, err);
            });
        });

        Promise.allSettled(upsertPromises);

        const result = {
            type,
            success: true,
            data: response.data,
            page: response.data.page,
            totalPages: response.data.total_pages,
            totalResults: response.data.total_results,
        };

        // cache the result in Redis for 1 hour
        await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });

        return result;
    } catch (error) {
        console.error(`Error fetching trending ${type}:`, error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: `Trending ${type} not found`,
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
            error: `Failed to fetch trending ${type}`,
            status: error.response?.status || 500,
        };
    }
}

// Generic function for popular content
export async function getPopular(type, page = 1) {
    try {
        const endpoint = type === 'movie' ? '/movie/popular' : '/tv/popular';
        const response = await tmdbApi.get(endpoint, {
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
        console.error(`Error fetching popular ${type}:`, error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: `Popular ${type} not found`,
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
            error: `Failed to fetch popular ${type}`,
            status: error.response?.status || 500,
        };
    }
}

export async function getPopularMovies(page = 1) {
    return getPopular('movie', page);
}

export async function getDetails(type, id) {
    try {
        // For detailed views, always fetch fresh data to get complete information
        // Cache is used for trending/popular lists only

        const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
        const response = await tmdbApi.get(endpoint, {
            params: {
                append_to_response: 'credits',
            },
        });

        // Update cache with basic info
        const itemData = {
            tmdbId: response.data.id,
            type: type,
            title: type === 'movie' ? response.data.title : response.data.name,
            overview: response.data.overview,
            poster_path: response.data.poster_path,
            backdrop_path: response.data.backdrop_path,
            release_date:
                type === 'movie'
                    ? response.data.release_date
                        ? new Date(response.data.release_date)
                        : null
                    : null,
            first_air_date:
                type === 'tv'
                    ? response.data.first_air_date
                        ? new Date(response.data.first_air_date)
                        : null
                    : null,
            genres: response.data.genres?.map((genre) => genre.name) || [],
            vote_average: response.data.vote_average,
            lastFetched: new Date(),
        };

        await Content.findOneAndUpdate({ tmdbId: id, type: type }, itemData, {
            upsert: true,
            new: true,
        });

        return {
            type,
            success: true,
            data: response.data, // Return full TMDB response for detail views
            fromCache: false,
        };
    } catch (error) {
        console.error(`Error fetching ${type} with ID ${id}:`, error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: `${type} not found`,
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
            error: `Failed to fetch ${type} with ID ${id}`,
            status: error.response?.status || 500,
        };
    }
}

// Generic function for recommendations
export async function getRecommendations(type, id, page = 1) {
    try {
        const endpoint = type === 'movie' ? `/movie/${id}/recommendations` : `/tv/${id}/recommendations`;
        const response = await tmdbApi.get(endpoint, {
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
        console.error(
            `Error fetching recommendations for ${type} ${id}:`,
            error.response?.data || error.message,
        );

        if (error.response?.status === 404) {
            return {
                success: false,
                error: `${type} recommendations not found`,
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
            error: `Failed to fetch recommendations for ${type} ${id}`,
            status: error.response?.status || 500,
        };
    }
}

export async function getMovieRecommendations(id, page = 1) {
    return getRecommendations('movie', id, page);
}

export async function search(type, query, page = 1) {
    try {
        const endpoint = `/search/${type}`;
        const response = await tmdbApi.get(endpoint, {
            params: { query, page },
        });

        const upsertPromises = response.data.results.map((item) => {
            const itemData = {
                tmdbId: item.id,
                type: type,
                title: type === 'movie' ? item.title : item.name,
                overview: item.overview,
                poster_path: item.poster_path,
                backdrop_path: item.backdrop_path,
                release_date:
                    type === 'movie'
                        ? item.release_date
                            ? new Date(item.release_date)
                            : null
                        : null,
                first_air_date:
                    type === 'tv'
                        ? item.first_air_date
                            ? new Date(item.first_air_date)
                            : null
                        : null,
                genres: [],
                vote_average: item.vote_average,
                lastFetched: new Date(),
            };

            return Content.findOneAndUpdate({ tmdbId: item.id, type: type }, itemData, {
                upsert: true,
                new: true,
            }).catch((err) => {
                console.error(`Error upserting ${type} ${item.id}:`, err);
            });
        });

        Promise.allSettled(upsertPromises);

        const result = {
            type,
            success: true,
            data: response.data,
            page: response.data.page,
            totalPages: response.data.total_pages,
            totalResults: response.data.total_results,
        };

        return result;
    } catch (error) {
        console.error(`Error searching ${type}:`, error.response?.data || error.message);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: `${type} search not found`,
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
            error: `Failed to search ${type}`,
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
        console.error(
            `Error fetching recommendations for series ${id}:`,
            error.response?.data || error.message,
        );

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

// Anime functions
export async function getTrendingAnime(page = 1) {
    try {
        const response = await tmdbApi.get('/discover/tv', {
            params: {
                page,
                with_genres: 16,
                with_origin_country: 'JP',
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
                with_genres: 16,
                with_origin_country: 'JP',
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
        console.error(
            `Error fetching recommendations for anime ${id}:`,
            error.response?.data || error.message,
        );

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
