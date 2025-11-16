import FeaturedMovie from '../models/FeaturedMovie.js';
import { getPopular, getPopularAnime } from '../services/tmdbService.js';

const validateMovieId = (movieId) => {
    const id = parseInt(movieId, 10);
    return !isNaN(id) && id > 0;
};

export const addFeaturedMovie = async (req, res) => {
    try {
        const { movieId } = req.body;
        const featuredBy = req.user.uid;

        if (!validateMovieId(movieId)) {
            return res.status(400).json({ error: 'Invalid movieId. Must be a positive integer.' });
        }

        const featuredMovie = new FeaturedMovie({ movieId, featuredBy });
        await featuredMovie.save();

        res.status(201).json({ message: 'Movie added to featured list successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(200).json({ message: 'Movie already featured' });
        }
        console.error('Error adding featured movie:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const removeFeaturedMovie = async (req, res) => {
    try {
        const { movieId } = req.params;

        if (!validateMovieId(movieId)) {
            return res.status(400).json({ error: 'Invalid movieId. Must be a positive integer.' });
        }

        const result = await FeaturedMovie.deleteOne({ movieId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Movie not found in featured list' });
        }

        res.json({ message: 'Movie removed from featured list successfully' });
    } catch (error) {
        console.error('Error removing featured movie:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getFeaturedMovies = async (req, res) => {
    try {
        let featuredMovies = await FeaturedMovie.find({}, 'movieId');

        // If fewer than 10 featured movies exist, seed with popular defaults
        if (featuredMovies.length < 10) {
            const existingMovieIds = featuredMovies.map(item => item.movieId);
            const defaultFeaturedMovies = [
                { movieId: 19995 },  // Avatar
                { movieId: 299534 }, // Avengers: Endgame
                { movieId: 693134 }, // Dune: Part Two
                { movieId: 545611 }, // Everything Everywhere All at Once
                { movieId: 872585 }, // Oppenheimer
                { movieId: 507089 }, // Godzilla vs. Kong
                { movieId: 553512 }, // Spider-Man: No Way Home
                { movieId: 129 },     // Spirited Away
                { movieId: 330457 }, // Frozen II
                { movieId: 428078 }  // Mortal Kombat
            ].filter(movie => !existingMovieIds.includes(movie.movieId));

            // Only add movies that don't already exist
            if (defaultFeaturedMovies.length > 0) {
                try {
                    const moviesToAdd = defaultFeaturedMovies.slice(0, 10 - featuredMovies.length).map(movie => ({
                        ...movie,
                        featuredBy: 'system' // Default system user for seeded movies
                    }));
                    await FeaturedMovie.insertMany(moviesToAdd);
                    featuredMovies = await FeaturedMovie.find({}, 'movieId');
                } catch (insertError) {
                    console.error('Error seeding default featured movies:', insertError);
                    // Continue with existing movies if seeding fails
                }
            }
        }

        const movieIds = featuredMovies.map((item) => item.movieId);

        res.json({ movieIds });
    } catch (error) {
        console.error('Error getting featured movies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPopularByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        let data;
        if (category === 'anime') {
            // For anime, use TMDB anime popular function
            data = await getPopularAnime(1); // Get first page of popular anime
        } else {
            // Map frontend categories to TMDB types
            const typeMap = {
                movies: 'movie',
                series: 'tv'
            };
            const tmdbType = typeMap[category] || 'movie';
            data = await getPopular(tmdbType, 1); // Get first page of popular content
        }

        if (!data.success) {
            return res.status(data.status || 500).json({ error: data.error });
        }

        // Transform the data to match what the frontend expects for the carousel
        const movies = data.data.results.slice(0, 10).map(movie => ({ // Limit to 10 items
            id: movie.id,
            title: movie.title || movie.name || 'Unknown Title',
            description: movie.overview || movie.synopsis || 'No description available.',
            rating: movie.vote_average || movie.score || 0,
            poster: movie.poster_path && movie.poster_path.startsWith('http')
                ? movie.poster_path
                : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/fallback-poster.svg'),
            backdrop: movie.backdrop_path && movie.backdrop_path.startsWith('http')
                ? movie.backdrop_path
                : (movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null)
        }));

        res.json(movies);
    } catch (error) {
        console.error('Error getting popular content by category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
