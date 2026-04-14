import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import cycleRoutes from './routes/cycles.js';
import logRoutes from './routes/logs.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/auth', authRoutes);
app.use('/cycles', cycleRoutes);
app.use('/logs', logRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  res.status(status).json({ error: err.message ?? 'Server error' });
});

export default app;
