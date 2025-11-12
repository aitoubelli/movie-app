import Watchlist from '../models/Watchlist.js';


const validateMovieId = (movieId) => {
    const id = parseInt(movieId, 10);
    return !isNaN(id) && id > 0;
};

export const addToWatchlist = async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.user.uid;

        if (!validateMovieId(movieId)) {
            return res.status(400).json({ error: 'Invalid movieId. Must be a positive integer.' });
        }


        const watchlistEntry = new Watchlist({ userId, movieId });
        await watchlistEntry.save();

        res.status(201).json({ message: 'Movie added to watchlist successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(200).json({ message: 'Movie already in watchlist' });
        }
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const removeFromWatchlist = async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.user.uid;

        if (!validateMovieId(movieId)) {
            return res.status(400).json({ error: 'Invalid movieId. Must be a positive integer.' });
        }

        const result = await Watchlist.deleteOne({ userId, movieId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Movie not found in watchlist' });
        }

        res.json({ message: 'Movie removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getWatchlist = async (req, res) => {
    try {
        const userId = req.user.uid;

        const watchlist = await Watchlist.find({ userId }, 'movieId');
        const movieIds = watchlist.map((item) => item.movieId);

        res.json({ movieIds });
    } catch (error) {
        console.error('Error getting watchlist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
