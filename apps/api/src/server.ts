import express from 'express';
import { AppDatabase } from '@forgebench/database';
import { repoRoutes } from './routes/repos';

const app = express();
app.use(express.json());

// In-memory database for the API
const db = new AppDatabase();

// Mount routes
app.use('/repos', repoRoutes(db));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

export { app, db };

// Start server if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`OpenSource Radar API running on port ${PORT}`);
  });
}
