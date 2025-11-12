import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    movieId: {
        type: Number,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxlength: 500,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
