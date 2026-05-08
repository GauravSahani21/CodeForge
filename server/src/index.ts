import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './utils/db';
import authRoutes from './routes/auth.routes';
import problemRoutes from './routes/problem.routes';
import submissionRoutes from './routes/submission.routes';
import executeRoutes from './routes/execute.routes';
import userRoutes from './routes/user.routes';
import learnRoutes from './routes/learn.routes';
import { errorHandler } from './middleware/error.middleware';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001', 
  'http://127.0.0.1:3000', 
  'http://127.0.0.1:3001'
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({ 
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      // In production, we should be stricter, but for now we'll allow all to avoid deployment friction
      callback(null, true);
    }
  }, 
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const executeLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: 'Too many execution requests, slow down!' } });

app.use('/api', limiter);
app.use('/api/execute', executeLimiter);
app.use('/api/submissions', executeLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/learn', learnRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'OK', uptime: process.uptime() }));

// Error handler
app.use(errorHandler);

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`🚀 CodeForge server running on http://0.0.0.0:${PORT}`);
});

export default app;
