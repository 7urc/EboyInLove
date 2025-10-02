// Routes pour l'API backend Express.js
// À ajouter à votre serveur Express existant

import express from 'express';
import cors from 'cors';
import path from 'path';
import { scrapeFrenchAnimeLocal } from './routes/anime.js'; // Votre fonction existante

const router = express.Router();

// Middleware CORS pour permettre les requêtes depuis le frontend
router.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Ports communs pour React
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

/**
 * Endpoint pour vérifier la santé du backend
 * GET /api/health
 */
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Backend API is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * Endpoint pour récupérer tous les animes VF/VOSTFR disponibles
 * GET /api/animes
 */
router.get('/animes', (req, res) => {
    try {
        // Chemin vers votre fichier HTML contenant les données d'animes
        // Ajustez ce chemin selon votre structure de fichiers
        const htmlFilePath = path.join(process.cwd(), 'data', 'animes.html'); 
        
        // Utiliser votre fonction existante pour scraper les animes
        const animes = scrapeFrenchAnimeLocal(htmlFilePath);
        
        res.json(animes);
    } catch (error) {
        console.error('Erreur lors de la récupération des animes:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: error.message 
        });
    }
});

/**
 * Endpoint pour rechercher un anime spécifique
 * POST /api/search-anime
 * Body: { animeTitle: string }
 */
router.post('/search-anime', (req, res) => {
    try {
        const { animeTitle } = req.body;
        
        if (!animeTitle) {
            return res.status(400).json({ 
                error: 'Titre d\'anime requis',
                message: 'Le paramètre animeTitle est obligatoire'
            });
        }
        
        // Chemin vers votre fichier HTML
        const htmlFilePath = path.join(process.cwd(), 'data', 'animes.html');
        
        // Récupérer tous les animes
        const allAnimes = scrapeFrenchAnimeLocal(htmlFilePath);
        
        // Filtrer les animes correspondants
        const matchingAnimes = findAnimeMatches(animeTitle, allAnimes);
        
        res.json({
            searchTitle: animeTitle,
            results: matchingAnimes,
            totalFound: matchingAnimes.length
        });
    } catch (error) {
        console.error('Erreur lors de la recherche d\'anime:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: error.message 
        });
    }
});

/**
 * Endpoint pour rechercher la disponibilité d'un épisode spécifique
 * POST /api/search-episode
 * Body: { animeTitle: string, episodeNumber: number }
 */
router.post('/search-episode', (req, res) => {
    try {
        const { animeTitle, episodeNumber } = req.body;
        
        if (!animeTitle) {
            return res.status(400).json({ 
                error: 'Titre d\'anime requis',
                message: 'Le paramètre animeTitle est obligatoire'
            });
        }
        
        // Chemin vers votre fichier HTML
        const htmlFilePath = path.join(process.cwd(), 'data', 'animes.html');
        
        // Récupérer tous les animes
        const allAnimes = scrapeFrenchAnimeLocal(htmlFilePath);
        
        // Filtrer les animes correspondants
        const matchingAnimes = findAnimeMatches(animeTitle, allAnimes);
        
        // Convertir au format attendu par le frontend
        const results = matchingAnimes.map(anime => ({
            title: anime.title,
            url: null, // Pas d'URL spécifique dans votre scraper
            thumbnail: null, // Pas de thumbnail dans votre scraper
            language: anime.format, // "VF" ou "VOSTFR"
            episodeNumber: episodeNumber || null,
            relevanceScore: calculateRelevanceScore(animeTitle, anime.title)
        }));
        
        res.json({
            animeTitle,
            episodeNumber: episodeNumber || null,
            results,
            totalFound: results.length
        });
    } catch (error) {
        console.error('Erreur lors de la recherche d\'épisode:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: error.message 
        });
    }
});

/**
 * Endpoint pour obtenir des statistiques sur les animes
 * GET /api/stats
 */
router.get('/stats', (req, res) => {
    try {
        const htmlFilePath = path.join(process.cwd(), 'data', 'animes.html');
        const animes = scrapeFrenchAnimeLocal(htmlFilePath);
        
        const stats = {
            total: animes.length,
            vf: animes.filter(anime => anime.format === 'VF').length,
            vostfr: animes.filter(anime => anime.format === 'VOSTFR').length,
            lastUpdated: new Date().toISOString()
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: error.message 
        });
    }
});

// --- Fonctions utilitaires ---

/**
 * Trouve les correspondances d'anime basées sur le titre
 */
function findAnimeMatches(searchTitle, availableAnimes) {
    const normalizedSearch = normalizeTitle(searchTitle);
    
    return availableAnimes.filter(anime => {
        const normalizedAnimeTitle = normalizeTitle(anime.title);
        
        // Correspondance exacte
        if (normalizedAnimeTitle === normalizedSearch) {
            return true;
        }
        
        // Correspondance partielle
        if (normalizedAnimeTitle.includes(normalizedSearch) || 
            normalizedSearch.includes(normalizedAnimeTitle)) {
            return true;
        }
        
        // Correspondance avec mots-clés
        const searchWords = normalizedSearch.split(' ');
        const animeWords = normalizedAnimeTitle.split(' ');
        
        const matchingWords = searchWords.filter(word => 
            animeWords.some(animeWord => animeWord.includes(word) || word.includes(animeWord))
        );
        
        // Au moins 50% des mots correspondent
        return matchingWords.length / searchWords.length >= 0.5;
    });
}

/**
 * Normalise un titre pour la comparaison
 */
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b(the|le|la|les|un|une|des|anime|saison|season|episode|ep)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Calcule un score de pertinence
 */
function calculateRelevanceScore(searchTitle, animeTitle) {
    const normalizedSearch = normalizeTitle(searchTitle);
    const normalizedAnime = normalizeTitle(animeTitle);
    
    if (normalizedSearch === normalizedAnime) {
        return 1.0;
    }
    
    if (normalizedAnime.includes(normalizedSearch)) {
        return 0.9;
    }
    
    if (normalizedSearch.includes(normalizedAnime)) {
        return 0.8;
    }
    
    const searchWords = normalizedSearch.split(' ');
    const animeWords = normalizedAnime.split(' ');
    
    const matchingWords = searchWords.filter(word => 
        animeWords.some(animeWord => animeWord.includes(word) || word.includes(animeWord))
    );
    
    return matchingWords.length / Math.max(searchWords.length, animeWords.length);
}

export default router;

// --- Instructions d'utilisation ---
/*
Pour intégrer ces routes dans votre serveur Express existant:

1. Ajoutez ce fichier à votre projet backend
2. Dans votre fichier principal (app.js ou index.js), ajoutez:

import animeRoutes from './backend-routes.js';
app.use('/api', animeRoutes);

3. Assurez-vous d'avoir le fichier HTML avec les données d'animes dans le dossier 'data'
4. Installez les dépendances si nécessaire:
   npm install cors

5. Votre serveur devra écouter sur le port 4000:
   app.listen(4000, () => {
     console.log('Serveur démarré sur http://localhost:4000');
   });
*/