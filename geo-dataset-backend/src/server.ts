import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import cors from 'cors';
import authRoutes from './routes/auth';
import datasetRoutes from './routes/datasets';
import connectDB from './config/database';
import './config/passport';

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173','https://geo-spatial.netlify.app'], // Allow requests from your Vue.js frontend
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);
app.use('/datasets', datasetRoutes);

// Protected Route Example
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'You have access to this protected route!' });
});

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

