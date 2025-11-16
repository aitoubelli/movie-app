import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import redisClient from './src/config/redis.js';
import moviesRouter from './src/routes/movies.js';
import seriesRouter from './src/routes/series.js';
import authRouter from './src/routes/auth.js';
import watchlistRouter from './src/routes/watchlist.js';
import commentsRouter from './src/routes/comments.js';
import ratingsRouter from './src/routes/ratings.js';
import featuredRouter from './src/routes/featured.js';
import continueWatchingRouter from './src/routes/continueWatching.js';
import recommendationsRouter from './src/routes/recommendations.js';
import browseRouter from './src/routes/browse.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }),
);

app.get('/health', (req, res) => {
    const healthStatus = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(healthStatus);
});

app.get('/', (req, res) => {
    res.send('Movie App Backend is running!');
});

mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-app', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

redisClient.connect().catch((error) => {
    console.error('Redis connection error:', error);
});

app.use('/api/movies', moviesRouter);
app.use('/api/series', seriesRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/auth', authRouter);
app.use('/api', featuredRouter);
app.use('/api/continue-watching', continueWatchingRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/browse', browseRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
