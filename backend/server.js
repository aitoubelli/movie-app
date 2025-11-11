import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
