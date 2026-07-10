import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import studentRoutes from './routes/student.routes.js';
import candidateRoutes from './routes/candidate.routes.js';
import electionRoutes from './routes/election.routes.js';
import voteRoutes from './routes/vote.routes.js';
import statsRoutes from './routes/stats.routes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/stats', statsRoutes);

import { setupDB } from './database/setup.js';
import pool from './database/pool.js';

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

const initializeDatabaseIfNeeded = async () => {
  try {
    const res = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admins'
      );
    `);
    
    if (!res.rows[0].exists) {
      console.log('📦 Database tables not found. Initializing database...');
      await setupDB();
      console.log('✅ Database auto-initialization complete.');
    } else {
      console.log('✅ Database already initialized.');
    }
  } catch (error) {
    console.error('❌ Error checking database initialization:', error);
  }
};

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeDatabaseIfNeeded();
});
