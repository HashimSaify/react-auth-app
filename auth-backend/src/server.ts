import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';

// Load environment variables from .env
dotenv.config();

const app = express();

// Use PORT from .env or default to 5000
const PORT = process.env.PORT || 5000;

// ---------- GLOBAL MIDDLEWARES ---------- //

// Allow requests from React frontend (http://localhost:3000)
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// Parse JSON request bodies (so req.body works)
app.use(express.json());

// ---------- SIMPLE TEST ROUTE ---------- //

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
  });
});

// ---------- AUTH ROUTES ---------- //

// All routes defined in authRoutes will be prefixed with /api/auth
// For example, POST /api/auth/signup
app.use('/api/auth', authRoutes);

// ---------- START SERVER AFTER DB CONNECTS ---------- //

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Connected to MongoDB`);
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
