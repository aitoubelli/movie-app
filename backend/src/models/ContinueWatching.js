import mongoose from 'mongoose';

const continueWatchingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    contentId: {
        type: Number,
        required: true,
    },
    contentType: {
        type: String,
        enum: ['movie', 'tv', 'anime'],
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

continueWatchingSchema.index({ userId: 1, contentId: 1, contentType: 1 }, { unique: true });

const ContinueWatching = mongoose.model('ContinueWatching', continueWatchingSchema);

export default ContinueWatching;
