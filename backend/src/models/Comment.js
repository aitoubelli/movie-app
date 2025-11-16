import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userAvatar: {
        type: Number,
        default: 0,
        min: 0,
        max: 19,
    },
    text: {
        type: String,
        required: true,
        maxlength: 500,
    },
    likes: {
        type: [String], // Array of user IDs who liked this reply
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const commentSchema = new mongoose.Schema({
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
    userName: {
        type: String,
        required: true,
    },
    userAvatar: {
        type: Number,
        default: 0,
        min: 0,
        max: 19,
    },
    text: {
        type: String,
        required: true,
        maxlength: 500,
    },
    likes: {
        type: [String], // Array of user IDs who liked this comment
        default: [],
    },
    replies: [replySchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
