import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['movie', 'tv'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    overview: String,
    posterPath: String,
    backdropPath: String,
    releaseDate: Date,
    genres: [String],
    rating: Number,
    lastFetched: {
        type: Date,
        default: Date.now,
    },
});

// Compound unique index on (tmdbId, type)
contentSchema.index({ tmdbId: 1, type: 1 }, { unique: true });

const Content = mongoose.model('Content', contentSchema);

export default Content;
