import express from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import {
    getPopular,
    getTrending,
    getPopularAnime,
    getTrendingAnime,
} from '../services/tmdbService.js';
import Watchlist from '../models/Watchlist.js';

const router = express.Router();

router.use(verifyFirebaseToken);

// Helper function to get personalized recommendations with mixed content types
const getPersonalizedRecommendations = async (userId) => {
    try {
        // Get user's watchlist
        const watchlist = await Watchlist.find({ userId }, 'movieId');
        const watchlistIds = watchlist.map((item) => item.movieId);

        // Fetch content from multiple sources and mix them
        const promises = [
            // Get trending movies
            getTrending('movie', 'week', 1).then(result => ({
                ...result,
                type: 'movie',
                category: 'trending'
            })),
            // Get trending TV series
            getTrending('tv', 'week', 1).then(result => ({
                ...result,
                type: 'series',
                category: 'trending'
            })),
            // Get trending anime
            getTrendingAnime(1).then(result => ({
                ...result,
                type: 'anime',
                category: 'trending'
            })),
            // Get popular movies
            getPopular('movie', 1).then(result => ({
                ...result,
                type: 'movie',
                category: 'popular'
            })),
            // Get popular TV series
            getPopular('tv', 1).then(result => ({
                ...result,
                type: 'series',
                category: 'popular'
            })),
            // Get popular anime
            getPopularAnime(1).then(result => ({
                ...result,
                type: 'anime',
                category: 'popular'
            })),
        ];

        const results = await Promise.allSettled(promises);
        const successfulResults = results
            .filter(result => result.status === 'fulfilled' && result.value.success)
            .map(result => result.value);

        if (successfulResults.length === 0) {
            return { success: false, error: 'Failed to fetch any content' };
        }

        // Mix and shuffle content from different sources
        const mixedContent = [];
        const contentByType = {
            movie: [],
            series: [],
            anime: []
        };

        // Group content by type
        successfulResults.forEach(result => {
            if (result.data?.results) {
                result.data.results.forEach(item => {
                    const contentWithType = {
                        ...item,
                        contentType: result.type,
                        // Ensure consistent field names
                        title: item.title || item.name,
                        release_date: item.release_date || item.first_air_date,
                    };
                    contentByType[result.type].push(contentWithType);
                });
            }
        });

        // Take 4 items from each type to create a balanced mix
        Object.keys(contentByType).forEach(type => {
            const items = contentByType[type];
            if (items.length > 0) {
                // Shuffle the array
                for (let i = items.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [items[i], items[j]] = [items[j], items[i]];
                }
                // Take 4 items per type
                mixedContent.push(...items.slice(0, 4));
            }
        });

        // Final shuffle of all mixed content
        for (let i = mixedContent.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mixedContent[i], mixedContent[j]] = [mixedContent[j], mixedContent[i]];
        }

        // Return up to 12 mixed recommendations
        return {
            success: true,
            data: {
                results: mixedContent.slice(0, 12),
            },
            totalPages: 1,
            page: 1,
            totalResults: mixedContent.length
        };

    } catch (error) {
        console.error('Error in personalized recommendations:', error);
        return { success: false, error: 'Internal server error' };
    }
};

router.get('/personalized', async (req, res) => {
    try {
        const userId = req.user.uid;
        const page = parseInt(req.query.page) || 1;

        const result = await getPersonalizedRecommendations(userId, page);

        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json({
                error: result.error,
            });
        }
    } catch (error) {
        console.error('Error in /personalized route:', error);
        res.status(500).json({
            error: 'Internal server error',
        });
    }
});

export default router;
