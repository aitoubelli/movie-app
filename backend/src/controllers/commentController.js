import Comment from '../models/Comment.js';

const validateContentId = (contentId) => {
    const id = parseInt(contentId, 10);
    return !isNaN(id) && id > 0;
};

const validateContentType = (contentType) => {
    return contentType === 'movie' || contentType === 'series' || contentType === 'anime';
};

const validateSortBy = (sortBy) => {
    return sortBy === 'newest' || sortBy === 'top';
};

const validateText = (text) => {
    return text && text.length >= 1 && text.length <= 500;
};

export const postComment = async (req, res) => {
    try {
        const { contentId, contentType, text } = req.body;
        const userId = req.user ? req.user.firebaseUid : null;

        if (!req.user || !userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!validateContentId(contentId)) {
            return res.status(400).json({ error: 'Invalid contentId. Must be a positive integer.' });
        }

        if (!validateContentType(contentType)) {
            return res.status(400).json({ error: 'Invalid contentType. Must be "movie", "series", or "anime".' });
        }

        if (!validateText(text)) {
            return res.status(400).json({ error: 'Invalid text. Must be between 1 and 500 characters.' });
        }

        // Get user data to get avatar and proper username/name
        const User = (await import('../models/User.js')).default;
        const user = await User.findOne({ firebaseUid: userId });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const userName = user.username || user.name || user.email;
        const userAvatar = user.avatar || 0;

        const comment = new Comment({ contentId, contentType, userId, userName, userAvatar, text });
        await comment.save();

        res.status(201).json({ message: 'Comment posted successfully' });
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getCommentsByContent = async (req, res) => {
    try {
        const { contentId } = req.params;
        const { contentType, sortBy } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!validateContentId(contentId)) {
            return res.status(400).json({ error: 'Invalid contentId. Must be a positive integer.' });
        }

        if (!validateContentType(contentType)) {
            return res.status(400).json({ error: 'Invalid contentType. Must be movie, series, or anime.' });
        }

        if (sortBy && !validateSortBy(sortBy)) {
            return res.status(400).json({ error: 'Invalid sortBy. Must be either "newest" or "top".' });
        }

        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                error:
                    'Invalid pagination parameters. Page and limit must be positive integers, limit cannot exceed 100.',
            });
        }

        const skip = (page - 1) * limit;

        // Get total count for pagination calculation
        const totalComments = await Comment.countDocuments({ contentId, contentType });
        const totalPages = Math.ceil(totalComments / limit);

        // Build sort object based on sortBy parameter
        const sortOption = sortBy === 'top' ? { likes: -1, createdAt: -1 } : { createdAt: -1 };

        const comments = await Comment.find({ contentId, contentType })
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        res.json({
            comments,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const postReply = async (req, res) => {
    try {
        const { commentId, text } = req.body;
        const userId = req.user.firebaseUid;

        if (!commentId) {
            return res.status(400).json({ error: 'commentId is required' });
        }

        if (!validateText(text)) {
            return res.status(400).json({ error: 'Invalid text. Must be between 1 and 500 characters.' });
        }

        // Get user data to get avatar and proper username/name
        const User = (await import('../models/User.js')).default;
        const user = await User.findOne({ firebaseUid: userId });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const userName = user.username || user.name || user.email;
        const userAvatar = user.avatar || 0;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const newReply = {
            userId,
            userName,
            userAvatar,
            text: text.trim(),
            likes: [],
            createdAt: new Date(),
        };

        comment.replies.push(newReply);
        await comment.save();

        res.status(201).json({ message: 'Reply posted successfully' });
    } catch (error) {
        console.error('Error posting reply:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.firebaseUid;

        if (!commentId) {
            return res.status(400).json({ error: 'commentId is required' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user already liked this comment
        const likeIndex = comment.likes.indexOf(userId);

        if (likeIndex > -1) {
            // User already liked, so remove the like (unlike)
            comment.likes.splice(likeIndex, 1);
        } else {
            // User hasn't liked, so add the like
            comment.likes.push(userId);
        }

        await comment.save();

        res.status(200).json({
            message: likeIndex > -1 ? 'Comment unliked successfully' : 'Comment liked successfully',
            likesCount: comment.likes.length
        });
    } catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const likeReply = async (req, res) => {
    try {
        const { replyId } = req.params;
        const userId = req.user.firebaseUid;

        if (!replyId) {
            return res.status(400).json({ error: 'replyId is required' });
        }

        const comment = await Comment.findOne({ 'replies._id': replyId });
        if (!comment) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        const reply = comment.replies.id(replyId);
        if (!reply) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        // Check if user already liked this reply
        const likeIndex = reply.likes.indexOf(userId);

        if (likeIndex > -1) {
            // User already liked, so remove the like (unlike)
            reply.likes.splice(likeIndex, 1);
        } else {
            // User hasn't liked, so add the like
            reply.likes.push(userId);
        }

        await comment.save();

        res.status(200).json({
            message: likeIndex > -1 ? 'Reply unliked successfully' : 'Reply liked successfully',
            likesCount: reply.likes.length
        });
    } catch (error) {
        console.error('Error liking reply:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
