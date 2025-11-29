import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDatabase from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import exerciseRoutes from './routes/exercises.js';
import taskRoutes from './routes/tasks.js';
import journalRoutes from './routes/journals.js';
import workoutRoutes from './routes/workouts.js';
import triggerRoutes from './routes/triggers.js';
import challengeRoutes from './routes/challenges.js';
import nutritionRoutes from './routes/nutritions.js';
import socialRoutes from './routes/socials.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

connectDatabase();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(compression());

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/journals', authMiddleware, journalRoutes);
app.use('/api/workouts', authMiddleware, workoutRoutes);
app.use('/api/triggers', authMiddleware, triggerRoutes);
app.use('/api/challenges', authMiddleware, challengeRoutes);
app.use('/api/nutrition', authMiddleware, nutritionRoutes);
app.use('/api/social', authMiddleware, socialRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
});
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Shukuma Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  process.exit(1);
});
