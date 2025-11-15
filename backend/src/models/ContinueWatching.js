import mongoose from 'mongoose';

const continueWatchingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    movieId: {
        type: Number,
        required: true,
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    lastWatchedAt: {
        type: Date,
        default: Date.now,
    },
});

continueWatchingSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const ContinueWatching = mongoose.model('ContinueWatching', continueWatchingSchema);

export default ContinueWatching;
