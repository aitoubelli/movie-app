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
    poster_path: String,
    backdrop_path: String,
    release_date: Date,
    first_air_date: Date,
    genres: [String],
    vote_average: Number,
    lastFetched: {
        type: Date,
        default: Date.now,
    },
});

// Compound unique index on (tmdbId, type)
contentSchema.index({ tmdbId: 1, type: 1 }, { unique: true });

const Content = mongoose.model('Content', contentSchema);

export default Content;
