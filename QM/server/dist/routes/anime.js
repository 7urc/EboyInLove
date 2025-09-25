"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_cache_1 = __importDefault(require("node-cache"));
const api = require('anime-vostfr');
const router = express_1.default.Router();
const cache = new node_cache_1.default({ stdTTL: 3600 }); // Cache for 1 hour
// Fonction pour normaliser les données d'anime
const processAnimeData = (animeList, language) => {
    return animeList.map((anime, index) => ({
        id: anime.url ? anime.url.split('/').pop() || `anime_${index}` : `anime_${index}`,
        title: anime.title || 'Titre inconnu',
        image: anime.image || '',
        score: anime.score ? parseFloat(anime.score) : undefined,
        year: anime.year ? parseInt(anime.year) : undefined,
        genres: anime.genres || [],
        language,
        url: anime.url || '',
        status: 'RELEASING' // Par défaut, peut être mis à jour plus tard
    }));
};
// Fonction pour créer de faux derniers épisodes (simulation)
const generateLatestEpisodes = (animeList) => {
    const episodes = [];
    const now = new Date();
    // Prendre quelques animes populaires et simuler des nouveaux épisodes
    animeList.slice(0, 15).forEach((anime, index) => {
        const episodeNumber = (Math.floor(Math.random() * 12) + 1).toString();
        const season = Math.random() > 0.7 ? (Math.floor(Math.random() * 3) + 1).toString() : undefined;
        const daysAgo = Math.floor(Math.random() * 7);
        episodes.push({
            animeId: anime.id,
            animeTitle: anime.title,
            episodeNumber,
            season,
            language: anime.language,
            releaseDate: new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000)),
            image: anime.image,
            url: anime.url
        });
    });
    // Trier par date de sortie (plus récent en premier)
    return episodes.sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());
};
// Route pour obtenir les derniers épisodes sortis
router.get('/latest-episodes', async (req, res) => {
    try {
        const cacheKey = 'latest_episodes';
        let cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        console.log('Chargement des données anime...');
        // Charger les données VF et VOSTFR en parallèle
        const [dataVOSTFR, dataVF] = await Promise.all([
            api.loadAnime().catch(() => []),
            api.loadAnimeVF().catch(() => [])
        ]);
        console.log(`Données chargées: ${dataVOSTFR.length} VOSTFR, ${dataVF.length} VF`);
        // Traiter les données
        const processedVOSTFR = processAnimeData(dataVOSTFR, 'VOSTFR');
        const processedVF = processAnimeData(dataVF, 'VF');
        // Combiner et générer les derniers épisodes
        const allAnimes = [...processedVOSTFR, ...processedVF];
        const latestEpisodes = generateLatestEpisodes(allAnimes);
        cache.set(cacheKey, latestEpisodes);
        res.json(latestEpisodes);
    }
    catch (error) {
        console.error('Erreur lors du chargement des derniers épisodes:', error);
        res.status(500).json({
            error: 'Erreur lors du chargement des derniers épisodes',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});
// Route pour obtenir les animes populaires
router.get('/popular', async (req, res) => {
    try {
        const cacheKey = 'popular_animes';
        let cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        console.log('Chargement des animes populaires...');
        const [dataVOSTFR, dataVF] = await Promise.all([
            api.loadAnime().catch(() => []),
            api.loadAnimeVF().catch(() => [])
        ]);
        const popularVOSTFR = api.popularAnime(dataVOSTFR) || [];
        const popularVF = api.popularAnime(dataVF) || [];
        const processedVOSTFR = processAnimeData(popularVOSTFR, 'VOSTFR');
        const processedVF = processAnimeData(popularVF, 'VF');
        const combined = [...processedVOSTFR, ...processedVF];
        cache.set(cacheKey, combined);
        res.json(combined);
    }
    catch (error) {
        console.error('Erreur lors du chargement des animes populaires:', error);
        res.status(500).json({
            error: 'Erreur lors du chargement des animes populaires',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});
// Route pour obtenir les animes avec les meilleurs scores
router.get('/top-rated', async (req, res) => {
    try {
        const cacheKey = 'top_rated_animes';
        let cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        console.log('Chargement des animes les mieux notés...');
        const [dataVOSTFR, dataVF] = await Promise.all([
            api.loadAnime().catch(() => []),
            api.loadAnimeVF().catch(() => [])
        ]);
        const topVOSTFR = api.bestScoreAnime(dataVOSTFR) || [];
        const topVF = api.bestScoreAnime(dataVF) || [];
        const processedVOSTFR = processAnimeData(topVOSTFR, 'VOSTFR');
        const processedVF = processAnimeData(topVF, 'VF');
        const combined = [...processedVOSTFR, ...processedVF]
            .filter(anime => anime.score && anime.score > 0)
            .sort((a, b) => (b.score || 0) - (a.score || 0));
        cache.set(cacheKey, combined);
        res.json(combined);
    }
    catch (error) {
        console.error('Erreur lors du chargement des animes les mieux notés:', error);
        res.status(500).json({
            error: 'Erreur lors du chargement des animes les mieux notés',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});
// Route pour obtenir les films d'anime
router.get('/movies', async (req, res) => {
    try {
        const cacheKey = 'anime_movies';
        let cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        console.log('Chargement des films d\'anime...');
        const [dataVOSTFR, dataVF] = await Promise.all([
            api.loadAnime().catch(() => []),
            api.loadAnimeVF().catch(() => [])
        ]);
        const moviesVOSTFR = api.movieAnime(dataVOSTFR) || [];
        const moviesVF = api.movieAnime(dataVF) || [];
        const processedVOSTFR = processAnimeData(moviesVOSTFR, 'VOSTFR');
        const processedVF = processAnimeData(moviesVF, 'VF');
        const combined = [...processedVOSTFR, ...processedVF];
        cache.set(cacheKey, combined);
        res.json(combined);
    }
    catch (error) {
        console.error('Erreur lors du chargement des films d\'anime:', error);
        res.status(500).json({
            error: 'Erreur lors du chargement des films d\'anime',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});
// Route pour rechercher des animes
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Paramètre de recherche manquant' });
        }
        const cacheKey = `search_${q.toLowerCase()}`;
        let cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        console.log(`Recherche d'animes pour: ${q}`);
        const [dataVOSTFR, dataVF] = await Promise.all([
            api.loadAnime().catch(() => []),
            api.loadAnimeVF().catch(() => [])
        ]);
        const searchVOSTFR = api.searchAnime(dataVOSTFR, q) || [];
        const searchVF = api.searchAnime(dataVF, q) || [];
        const processedVOSTFR = processAnimeData(searchVOSTFR, 'VOSTFR');
        const processedVF = processAnimeData(searchVF, 'VF');
        const combined = [...processedVOSTFR, ...processedVF];
        cache.set(cacheKey, combined, 1800); // Cache de recherche pour 30 minutes
        res.json(combined);
    }
    catch (error) {
        console.error('Erreur lors de la recherche:', error);
        res.status(500).json({
            error: 'Erreur lors de la recherche',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});
// Route pour obtenir les détails d'un anime
router.get('/details/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `anime_details_${id}`;
        let cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        // Cette route nécessiterait l'URL complète de l'anime
        // Pour l'instant, on retourne une erreur
        res.status(501).json({
            error: 'Fonctionnalité en cours de développement',
            message: 'Les détails d\'anime nécessitent l\'URL complète de l\'anime'
        });
    }
    catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        res.status(500).json({
            error: 'Erreur lors du chargement des détails',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});
// Route pour vider le cache (utile pour le développement)
router.post('/clear-cache', (req, res) => {
    cache.flushAll();
    res.json({ message: 'Cache vidé avec succès' });
});
exports.default = router;
//# sourceMappingURL=anime.js.map