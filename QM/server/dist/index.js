"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const anime_1 = __importDefault(require("./routes/anime"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Vite et Create React App
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/anime', anime_1.default);
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
app.use((error, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=index.js.map