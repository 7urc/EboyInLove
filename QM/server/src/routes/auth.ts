import express from 'express';

const router = express.Router();

// Routes d'authentification
router.post('/login', (req, res) => {
  // TODO: Implémenter la logique de connexion
  res.json({ message: 'Login endpoint' });
});

router.post('/register', (req, res) => {
  // TODO: Implémenter la logique d'inscription
  res.json({ message: 'Register endpoint' });
});

router.post('/logout', (req, res) => {
  // TODO: Implémenter la logique de déconnexion
  res.json({ message: 'Logout endpoint' });
});

export default router;