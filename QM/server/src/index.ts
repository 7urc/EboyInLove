import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import animeRoutes from './routes/anime';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Vite et Create React App
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'QM Server is running',
    timestamp: new Date().toISOString()
  });
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur l\'API QM Anime',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      anime: '/api/anime'
    }
  });
});

// Gestion d'erreur globale
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur QM démarré sur http://localhost:${PORT}`);
  console.log(`📚 Documentation API disponible sur http://localhost:${PORT}`);
});

export default app;