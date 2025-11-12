import FeaturedMovie from '../models/FeaturedMovie.js';

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
        const featuredMovies = await FeaturedMovie.find({}, 'movieId');
        const movieIds = featuredMovies.map((item) => item.movieId);

        res.json({ movieIds });
    } catch (error) {
        console.error('Error getting featured movies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
