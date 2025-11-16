import Rating from '../models/Rating.js';

const validateContentId = (contentId) => {
    const id = parseInt(contentId, 10);
    return !isNaN(id) && id > 0;
};

const validateContentType = (contentType) => {
    return contentType === 'movie' || contentType === 'series' || contentType === 'anime';
};

const validateRating = (rating) => {
    const numRating = parseInt(rating, 10);
    return !isNaN(numRating) && numRating >= 1 && numRating <= 10;
};

export const postRating = async (req, res) => {
    try {
        const { contentId, contentType, rating } = req.body;
        const userId = req.user.uid;

        if (!validateContentId(contentId)) {
            return res.status(400).json({ error: 'Invalid contentId. Must be a positive integer.' });
        }

        if (!validateContentType(contentType)) {
            return res.status(400).json({ error: 'Invalid contentType. Must be movie, series, or anime.' });
        }

        if (!validateRating(rating)) {
            return res.status(400).json({ error: 'Invalid rating. Must be between 1 and 10.' });
        }

        // Try to find existing rating or create new one
        const existingRating = await Rating.findOneAndUpdate(
            { contentId, contentType, userId },
            {
                rating: parseInt(rating),
                updatedAt: new Date()
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        res.status(200).json({
            message: existingRating.createdAt === existingRating.updatedAt
                ? 'Rating submitted successfully'
                : 'Rating updated successfully'
        });
    } catch (error) {
        console.error('Error posting rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getContentRating = async (req, res) => {
    try {
        const { contentId } = req.params;
        const { contentType } = req.query;
        const userId = req.user ? req.user.uid : null;

        if (!validateContentId(contentId)) {
            return res.status(400).json({ error: 'Invalid contentId. Must be a positive integer.' });
        }

        if (!validateContentType(contentType)) {
            return res.status(400).json({ error: 'Invalid contentType. Must be movie, series, or anime.' });
        }

        // Get all ratings for this content
        const ratings = await Rating.find({ contentId, contentType });

        // Calculate average rating
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
            : 0;

        // Get user's rating if authenticated
        let userRating = null;
        if (userId) {
            const userRatingDoc = await Rating.findOne({ contentId, contentType, userId });
            if (userRatingDoc) {
                userRating = userRatingDoc.rating;
            }
        }

        res.json({
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            totalRatings: ratings.length,
            userRating,
            hasUserRated: userRating !== null
        });
    } catch (error) {
        console.error('Error getting content rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
