// Integration avec l'API backend pour les animes VF/VOSTFR
// API Backend: http://localhost:4000

/**
 * Interface pour les résultats d'animes du backend
 */
export interface AnimeBackendResult {
    title: string;
    format: "VF" | "VOSTFR";
}

/**
 * Interface pour les résultats de recherche d'épisodes (format existant)
 */
export interface AnimeResult {
    title: string;
    url: string | null;
    thumbnail: string | null;
    language: "VF" | "VO" | "VOSTFR" | "UNKNOWN";
    episodeNumber: number | null;
    relevanceScore: number;
}

/**
 * Récupère tous les animes disponibles en VF/VOSTFR depuis le backend
 * @returns {Promise<AnimeBackendResult[]>} Liste des animes disponibles
 */
export async function fetchAvailableAnimes(): Promise<AnimeBackendResult[]> {
    try {
        const response = await fetch('http://localhost:4000/api/animes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const animes = await response.json();
        return animes;
    } catch (error) {
        console.error('Erreur lors de la récupération des animes:', error);
        return [];
    }
}

/**
 * Recherche si un anime spécifique est disponible en VF/VOSTFR
 * @param {string} animeTitle - Le titre de l'anime à rechercher
 * @returns {Promise<AnimeResult[]>} Résultats de disponibilité
 */
export async function searchAnimeAvailability(animeTitle: string): Promise<AnimeResult[]> {
    try {
        // Récupérer tous les animes disponibles
        const availableAnimes = await fetchAvailableAnimes();
        
        // Rechercher des correspondances avec le titre fourni
        const matches = findAnimeMatches(animeTitle, availableAnimes);
        
        // Convertir au format AnimeResult
        const results: AnimeResult[] = matches.map(anime => ({
            title: anime.title,
            url: null, // Pas d'URL spécifique dans votre backend
            thumbnail: null, // Pas de thumbnail dans votre backend
            language: anime.format === "VF" ? "VF" : "VOSTFR",
            episodeNumber: null, // Pas de numéro d'épisode spécifique
            relevanceScore: calculateRelevanceScore(animeTitle, anime.title)
        }));

        return results;
    } catch (error) {
        console.error('Erreur lors de la recherche de disponibilité:', error);
        return [];
    }
}

/**
 * Trouve les correspondances d'anime basées sur le titre
 * @param {string} searchTitle - Titre recherché
 * @param {AnimeBackendResult[]} availableAnimes - Liste des animes disponibles
 * @returns {AnimeBackendResult[]} Animes correspondants
 */
function findAnimeMatches(searchTitle: string, availableAnimes: AnimeBackendResult[]): AnimeBackendResult[] {
    const normalizedSearch = normalizeTitle(searchTitle);
    
    return availableAnimes.filter(anime => {
        const normalizedAnimeTitle = normalizeTitle(anime.title);
        
        // Correspondance exacte
        if (normalizedAnimeTitle === normalizedSearch) {
            return true;
        }
        
        // Correspondance partielle (contient)
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
 * Normalise un titre d'anime pour la comparaison
 * @param {string} title - Titre à normaliser
 * @returns {string} Titre normalisé
 */
function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Supprimer la ponctuation
        .replace(/\s+/g, ' ') // Normaliser les espaces
        .trim()
        // Supprimer les mots communs
        .replace(/\b(the|le|la|les|un|une|des|anime|saison|season|episode|ep)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Calcule un score de pertinence entre deux titres
 * @param {string} searchTitle - Titre recherché
 * @param {string} animeTitle - Titre de l'anime
 * @returns {number} Score entre 0 et 1
 */
function calculateRelevanceScore(searchTitle: string, animeTitle: string): number {
    const normalizedSearch = normalizeTitle(searchTitle);
    const normalizedAnime = normalizeTitle(animeTitle);
    
    // Correspondance exacte
    if (normalizedSearch === normalizedAnime) {
        return 1.0;
    }
    
    // Correspondance par inclusion
    if (normalizedAnime.includes(normalizedSearch)) {
        return 0.9;
    }
    
    if (normalizedSearch.includes(normalizedAnime)) {
        return 0.8;
    }
    
    // Score basé sur les mots en commun
    const searchWords = normalizedSearch.split(' ');
    const animeWords = normalizedAnime.split(' ');
    
    const matchingWords = searchWords.filter(word => 
        animeWords.some(animeWord => animeWord.includes(word) || word.includes(animeWord))
    );
    
    const wordScore = matchingWords.length / Math.max(searchWords.length, animeWords.length);
    
    // Score basé sur la similarité de Levenshtein (simplifié)
    const similarityScore = calculateStringSimilarity(normalizedSearch, normalizedAnime);
    
    return Math.max(wordScore, similarityScore);
}

/**
 * Calcule la similarité entre deux chaînes (simplifié)
 * @param {string} str1 - Première chaîne
 * @param {string} str2 - Deuxième chaîne
 * @returns {number} Score de similarité entre 0 et 1
 */
function calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
        return 1.0;
    }
    
    // Simple implementation without full Levenshtein distance
    let matches = 0;
    const minLength = Math.min(str1.length, str2.length);
    
    for (let i = 0; i < minLength; i++) {
        if (str1[i] === str2[i]) {
            matches++;
        }
    }
    
    return matches / longer.length;
}

/**
 * Récupère la disponibilité d'un épisode spécifique (compatible avec l'interface existante)
 * @param {string} animeTitle - Titre de l'anime
 * @param {number} episodeNumber - Numéro de l'épisode
 * @returns {Promise<AnimeResult[]>} Résultats de disponibilité
 */
export async function fetchEpisodeAvailabilityFromBackend(
    animeTitle: string, 
    episodeNumber: number
): Promise<AnimeResult[]> {
    try {
        // Utiliser la fonction de recherche existante
        const results = await searchAnimeAvailability(animeTitle);
        
        // Ajouter le numéro d'épisode aux résultats
        return results.map(result => ({
            ...result,
            episodeNumber
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération de la disponibilité de l\'épisode:', error);
        return [];
    }
}

/**
 * Vérifie si le backend est accessible
 * @returns {Promise<boolean>} True si le backend est accessible
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:4000/api/health', {
            method: 'GET',
            timeout: 5000,
        });
        return response.ok;
    } catch (error) {
        console.warn('Backend non accessible:', error);
        return false;
    }
}