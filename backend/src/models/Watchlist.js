import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    movieId: {
        type: Number,
        required: true,
    },
});

watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

export default Watchlist;
