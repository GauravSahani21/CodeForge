import express, { Request, Response } from 'express';
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

import path from 'path';
import next from 'next';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const dev = process.env.NODE_ENV !== 'production';

// Connect DB
connectDB();

// Initialize Next.js app
const nextApp = next({ dev, dir: path.join(__dirname, '../../client') });
const handle = nextApp.getRequestHandler();

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
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/learn', learnRoutes);

app.get('/api/health', (_req: Request, res: Response) => res.json({ status: 'OK', uptime: process.uptime() }));

// Error handler
app.use(errorHandler);

// If in production, let Next.js handle all other requests
if (!dev) {
  app.use((req: Request, res: Response) => {
    return handle(req as any, res as any);
  });
}

// Start server after Next.js is prepared
const startServer = async () => {
  try {
    if (!dev) {
      console.log('⏳ Preparing Next.js...');
      await nextApp.prepare();
      console.log('✅ Next.js prepared');
    }
    
    app.listen(PORT as number, '0.0.0.0', () => {
      console.log(`🚀 CodeForge combined server running on port ${PORT}`);
      if (dev) {
        console.log(`📡 API available at http://localhost:${PORT}/api`);
      } else {
        console.log(`🌍 App available at port ${PORT}`);
      }
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
};

startServer();

export default app;
