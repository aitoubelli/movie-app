import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    contentId: {
        type: Number,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
        enum: ['movie', 'series', 'anime'],
    },
    userId: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index to ensure one rating per user per content
ratingSchema.index({ contentId: 1, contentType: 1, userId: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
