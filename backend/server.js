import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import moviesRouter from './src/routes/movies.js';
import authRouter from './src/routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

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

app.use('/api/movies', moviesRouter);
app.use('/api', authRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
