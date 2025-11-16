import express from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { getDetails } from '../services/tmdbService.js';
import ContinueWatching from '../models/ContinueWatching.js';

const router = express.Router();

// Helper function to validate content type
const validateContentType = (type) => {
    const validTypes = ['movie', 'tv', 'anime'];
    return validTypes.includes(type);
};

// Continue watching GET endpoint (requires authentication)
router.get('/', verifyFirebaseToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        // Get user's continue watching entries
        const continueWatchingEntries = await ContinueWatching.find({ userId }).sort({ lastWatchedAt: -1 });

        if (!continueWatchingEntries || continueWatchingEntries.length === 0) {
            return res.json({
                success: true,
                data: {
                    results: [],
                    page: 1,
                    total_pages: 1,
                    total_results: 0,
                },
                page: 1,
                totalPages: 1,
                totalResults: 0,
            });
        }

        // Get content details for each entry
        const contentDetails = [];

        for (const entry of continueWatchingEntries) {
            try {
                // Map content types: treat anime as TV for TMDB (since TMDB anime are TV shows)
                const tmdbType = entry.contentType === 'anime' ? 'tv' : entry.contentType;
                const result = await getDetails(tmdbType, entry.contentId);

                if (result && result.success) {
                    // Add content type to the response data for frontend to know which route to use
                    contentDetails.push({
                        ...result.data,
                        progress: entry.progress || 0,
                        contentType: entry.contentType,
                    });
                }
            } catch (error) {
                console.error(`Error fetching details for ${entry.contentType} ${entry.contentId}:`, error);
            }
        }

        res.json({
            success: true,
            data: {
                results: contentDetails,
                page: 1,
                total_pages: 1,
                total_results: contentDetails.length,
            },
            page: 1,
            totalPages: 1,
            totalResults: contentDetails.length,
        });
    } catch (error) {
        console.error('Error in /continue-watching GET route:', error);
        res.status(500).json({
            error: 'Internal server error',
        });
    }
});

// Continue watching POST endpoint (requires authentication)
router.post('/', verifyFirebaseToken, async (req, res) => {
    try {
        const { contentId, contentType } = req.body;
        const userId = req.user.uid;

        if (!contentId || isNaN(parseInt(contentId))) {
            return res.status(400).json({
                error: 'Valid contentId is required',
            });
        }

        if (!contentType || !validateContentType(contentType)) {
            return res.status(400).json({
                error: 'Valid contentType (movie, tv, or anime) is required',
            });
        }

        // Add or update continue watching entry with progress 0
        const continueWatchingEntry = await ContinueWatching.findOneAndUpdate(
            { userId, contentId: parseInt(contentId), contentType },
            {
                userId,
                contentId: parseInt(contentId),
                contentType,
                progress: 0,
                lastWatchedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            message: 'Content added to continue watching',
            data: continueWatchingEntry,
        });
    } catch (error) {
        console.error('Error in POST /continue-watching route:', error);
        res.status(500).json({
            error: 'Internal server error',
        });
    }
});

export default router;
