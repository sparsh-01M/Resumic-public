import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
// import resumeRoutes from './routes/resume.js';
import contactRoutes from './routes/contact.js';
// import githubRoutes from './routes/github.js';
// import linkedinRoutes from './routes/linkedin.js';
import blogRoutes from './routes/blog.js';
import guidesRoutes from './routes/guides.js';
import faqsRoutes from './routes/faqs.js';
import jobRoutes from './routes/jobRoutes.js';
import waitlistRouter from './routes/waitlist.js';
// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://getresumic.vercel.app',
  // 'https://www.resumic.in',
  'https://resumic-public-frontend.vercel.app',
  'https://www.channlr.com'
];

// Add any additional origins from environment variables
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

if (process.env.ALLOWED_ORIGINS) {
  const additionalOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...additionalOrigins);
}

console.log('CORS Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('combined'));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Add CORS error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    console.log('CORS Error:', {
      origin: req.headers.origin,
      method: req.method,
      url: req.url
    });
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      origin: req.headers.origin
    });
  }
  next(err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/resume', resumeRoutes);
app.use('/api/contact', contactRoutes);
// app.use('/api/auth/github', githubRoutes);
// app.use('/api/linkedin', linkedinRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/guides', guidesRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/waitlist', waitlistRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins,
      requestOrigin: req.headers.origin
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Resumic AI Backend API',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      resume: '/api/resume',
      contact: '/api/contact',
      github: '/api/auth/github',
      linkedin: '/api/linkedin',
      blog: '/api/blog',
      guides: '/api/guides',
      faqs: '/api/faqs',
      jobs: '/api/jobs'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 