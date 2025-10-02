import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MdFavorite,
  MdPlayArrow,
  MdChevronLeft,
  MdChevronRight,
  MdLogin,
} from "react-icons/md";
import { FaRegStar } from "react-icons/fa6";
import Navbar from "./navbar";
import { useTheme } from "./ThemeContext";

import "./home.css";

// --- Interfaces ---
interface Episode {
  number: number;
  title: string;
  url: string;
  image: string;
  released_at: string;
  season?: string;
  year?: number;
}

interface LatestAnime {
  id: number;
  mal_id?: number;
  title: string;
  image: string;
  updated_at: string;
  episode: Episode;
  synopsis?: string;
  score?: number;
  year?: number;
  status?: string;
  source?: 'anilist' | 'jikan';
}

interface Anime {
  id: number;
  title: string;
  image: string;
  banner?: string;
  score?: number;
  description?: string;
  genres?: string[];
  year?: number;
  status?: string;
  isAdult?: boolean;
  startDate?: {
    year: number;
    month: number;
    day: number;
  };
}

interface AnimeResult {
  title: string;
  url: string | null;
  thumbnail: string | null;
  language: "VF" | "VO" | "VOSTFR" | "UNKNOWN";
  episodeNumber: number | null;
  relevanceScore: number;
}

// Interface pour les animes du backend
interface AnimeBackendResult {
  title: string;
  format: "VF" | "VOSTFR";
}

// --- Constantes ---
const ANILIST_URL = "https://graphql.anilist.co";
const JIKAN_SCHEDULES_URL = "https://api.jikan.moe/v4/schedules";
const BACKEND_URL = "http://localhost:4000/api";

// --- Fonctions utilitaires pour l'API backend ---
const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.warn('Backend non accessible:', error);
    return false;
  }
};

const fetchAvailableAnimes = async (): Promise<AnimeBackendResult[]> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/animes`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des animes:', error);
    return [];
  }
};

const searchAnimeAvailability = async (animeTitle: string): Promise<AnimeResult[]> => {
  try {
    const response = await axios.post(`${BACKEND_URL}/search-anime`, {
      animeTitle
    });
    
    return response.data.results.map((anime: any) => ({
      title: anime.title,
      url: null,
      thumbnail: null,
      language: anime.format, // "VF" ou "VOSTFR"
      episodeNumber: null,
      relevanceScore: anime.relevanceScore || 0
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche de disponibilité:', error);
    return [];
  }
};

// --- Composant principal ---
const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [featuredAnimes, setFeaturedAnimes] = useState<Anime[]>([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [latestEpisodes, setLatestEpisodes] = useState<LatestAnime[]>([]);
  const [recentEpisodes, setRecentEpisodes] = useState<LatestAnime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [backendStatus, setBackendStatus] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRecentRef = useRef<HTMLDivElement>(null);

  // --- Fonctions utilitaires ---
  const getDayName = (date: Date): string => {
    const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    return jours[date.getDay()];
  };

  const getSeasonNumber = (season: string): number => {
    const seasons: Record<string, number> = {
      WINTER: 1,
      SPRING: 2,
      SUMMER: 3,
      FALL: 4,
    };
    return seasons[season] || 1;
  };

  const fetchEnglishTitle = async (malId: number, fallback: string): Promise<string> => {
    try {
      const query = `
        query ($idMal: Int) {
          Media(idMal: $idMal, type: ANIME) {
            title {
              english
              romaji
            }
          }
        }
      `;
      const { data } = await axios.post(ANILIST_URL, {
        query,
        variables: { idMal: malId },
      });
      const titles = data.data.Media?.title;
      return titles?.english || titles?.romaji || fallback;
    } catch (error) {
      console.error("Erreur récupération titre anglais AniList:", error);
      return fallback;
    }
  };

  // Fonction modifiée pour utiliser le backend local
  const fetchEpisodeAvailability = async (animeTitle: string, episodeNumber: number) => {
    // Vérifier d'abord si le backend est disponible
    if (!backendStatus) {
      console.warn('Backend non disponible, impossible de vérifier la disponibilité');
      return [];
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/search-episode`, {
        animeTitle,
        episodeNumber,
      });
      return response.data.results as AnimeResult[];
    } catch (error) {
      console.error("Erreur lors de la recherche des épisodes:", error);
      // Fallback vers l'ancien endpoint si le nouveau ne fonctionne pas
      try {
        const fallbackResponse = await axios.post("http://localhost:4000/api/search-episode", {
          animeTitle,
          episodeNumber,
        });
        return fallbackResponse.data.results as AnimeResult[];
      } catch (fallbackError) {
        console.error("Erreur fallback:", fallbackError);
        return [];
      }
    }
  };

  // --- Récupération des données ---
  const fetchFeaturedAnimes = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      let season: string;
      if (month >= 1 && month <= 3) season = "winter";
      else if (month >= 4 && month <= 6) season = "spring";
      else if (month >= 7 && month <= 9) season = "summer";
      else season = "fall";

      const { data } = await axios.get(`https://api.jikan.moe/v4/seasons/${year}/${season}`);
      const animesRaw = data.data
        .filter((anime: any) => !anime.explicit_genres?.length)
        .filter((anime: any) => anime.aired?.from)
        .filter((anime: any) => new Date(anime.aired.from) <= new Date())
        .map((anime: any) => ({
          id: anime.mal_id,
          fallbackTitle: anime.title,
          image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
          banner: anime.trailer?.images?.maximum_image_url || anime.images?.jpg?.large_image_url,
          score: anime.score,
          description: anime.synopsis,
          genres: anime.genres?.map((g: any) => g.name) || [],
          year: anime.year,
          status: anime.status,
          members: anime.members,
        }));

      const animes = await Promise.all(
        animesRaw.map(async (anime: any) => {
          const englishTitle = await fetchEnglishTitle(anime.id, anime.fallbackTitle);
          return {
            ...anime,
            title: englishTitle,
          };
        })
      );

      const sorted = animes.sort((a: any, b: any) => {
        if (b.members !== a.members) return b.members - a.members;
        return (b.score || 0) - (a.score || 0);
      });

      setFeaturedAnimes(sorted.slice(0, 20));
    } catch (error) {
      console.error("Erreur lors de la récupération des animes populaires récents:", error);
    }
  };

  const fetchJikanSchedules = async (): Promise<LatestAnime[]> => {
    try {
      const now = new Date();
      const dayName = getDayName(now).toLowerCase();
      
      // Jikan utilise les noms de jours en anglais
      const dayMapping: Record<string, string> = {
        'lundi': 'monday',
        'mardi': 'tuesday',
        'mercredi': 'wednesday',
        'jeudi': 'thursday',
        'vendredi': 'friday',
        'samedi': 'saturday',
        'dimanche': 'sunday'
      };

      const englishDay = dayMapping[dayName] || 'monday';
      
      const { data } = await axios.get(`${JIKAN_SCHEDULES_URL}?filter=${englishDay}`);
      
      const jikanAnimes: LatestAnime[] = data.data
        .filter((anime: any) => !anime.explicit_genres?.length)
        .filter((anime: any) => anime.broadcast?.time)
        .map((anime: any) => {
          // Créer une date pour aujourd'hui avec l'heure de diffusion
          const [hours, minutes] = (anime.broadcast?.time || '00:00').split(':');
          const airingDate = new Date();
          airingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          return {
            id: anime.mal_id,
            mal_id: anime.mal_id,
            title: anime.title_english || anime.title,
            image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
            updated_at: airingDate.toISOString(),
            episode: {
              number: anime.episodes || 1,
              title: `Épisode ${anime.episodes || 1}`,
              url: anime.url,
              image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
              released_at: airingDate.toISOString(),
              season: anime.season?.toUpperCase(),
              year: anime.year,
            },
            synopsis: anime.synopsis,
            score: anime.score ? anime.score * 10 : undefined,
            year: anime.year,
            status: anime.status,
            source: 'jikan' as const,
          };
        });

      return jikanAnimes;
    } catch (error) {
      console.error("Erreur lors de la récupération des schedules Jikan:", error);
      return [];
    }
  };

  const fetchLatestEpisodes = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
      const todayEnd = todayStart + 86400;
      
      // Récupérer les animes d'AniList
      const query = `
        query ($page: Int, $perPage: Int, $todayStart: Int, $todayEnd: Int) {
          Page(page: $page, perPage: $perPage) {
            airingSchedules(airingAt_greater: $todayStart, airingAt_lesser: $todayEnd, sort: TIME_DESC) {
              id
              airingAt
              episode
              media {
                id
                idMal
                title {
                  english
                  romaji
                }
                coverImage { large }
                bannerImage
                averageScore
                seasonYear
                season
                status
                genres
                description
                isAdult
                startDate { year month day }
              }
            }
          }
        }
      `;
      const { data } = await axios.post(ANILIST_URL, {
        query,
        variables: { page: 1, perPage: 50, todayStart, todayEnd },
      });

      const schedules = data.data.Page.airingSchedules || [];
      const allAnimes = new Map<string, LatestAnime>();
      const malIdTracker = new Set<number>();

      // Ajouter les animes d'AniList
      schedules
        .filter((s: any) => !s.media.isAdult)
        .forEach((s: any) => {
          const airingAt = new Date(s.airingAt * 1000);
          const malId = s.media.idMal;
          const uniqueKey = `${malId || s.media.id}-${s.episode}`;
          
          if (!allAnimes.has(uniqueKey)) {
            if (malId) {
              malIdTracker.add(malId);
            }
            
            const englishTitle = s.media.title.english || s.media.title.romaji;
            allAnimes.set(uniqueKey, {
              id: s.media.id,
              mal_id: malId,
              title: englishTitle,
              image: s.media.coverImage.large,
              updated_at: airingAt.toISOString(),
              episode: {
                number: s.episode,
                title: `Épisode ${s.episode}`,
                url: `https://anilist.co/anime/${s.media.id}`,
                image: s.media.coverImage.large,
                released_at: airingAt.toISOString(),
                season: s.media.season,
                year: s.media.seasonYear,
              },
              score: s.media.averageScore,
              year: s.media.seasonYear,
              status: s.media.status,
              source: 'anilist' as const,
            });
          }
        });

      // Récupérer les animes de Jikan
      const jikanAnimes = await fetchJikanSchedules();
      
      // Ajouter les animes de Jikan en évitant les doublons
      let jikanAdded = 0;
      jikanAnimes.forEach((jikanAnime) => {
        const malId = jikanAnime.mal_id;
        
        // Vérifier si le mal_id existe déjà dans le tracker
        if (malId && !malIdTracker.has(malId)) {
          const uniqueKey = `${malId}-${jikanAnime.episode.number}`;
          
          // Double vérification avec la clé unique
          if (!allAnimes.has(uniqueKey)) {
            allAnimes.set(uniqueKey, jikanAnime);
            malIdTracker.add(malId);
            jikanAdded++;
          }
        }
      });

      const mappedAnimes = Array.from(allAnimes.values()).sort(
        (a: LatestAnime, b: LatestAnime) =>
          new Date(a.episode.released_at).getTime() - new Date(b.episode.released_at).getTime()
      );

      console.log(`Total animes chargés: ${mappedAnimes.length} (AniList: ${schedules.length}, Jikan ajoutés: ${jikanAdded})`);
      
      setLatestEpisodes(mappedAnimes);
    } catch (error) {
      console.error("Erreur lors de la récupération des épisodes du jour:", error);
      setLatestEpisodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentEpisodes = async () => {
    setIsLoadingRecent(true);
    try {
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const startTimestamp = Math.floor(tenDaysAgo.getTime() / 1000);
      const endTimestamp = Math.floor(now.getTime() / 1000);

      const query = `
        query ($page: Int, $perPage: Int, $startTime: Int, $endTime: Int) {
          Page(page: $page, perPage: $perPage) {
            airingSchedules(airingAt_greater: $startTime, airingAt_lesser: $endTime, sort: TIME_DESC) {
              id
              airingAt
              episode
              media {
                id
                idMal
                title {
                  english
                  romaji
                }
                coverImage { large }
                bannerImage
                averageScore
                seasonYear
                season
                status
                genres
                description
                isAdult
                startDate { year month day }
              }
            }
          }
        }
      `;

      const { data } = await axios.post(ANILIST_URL, {
        query,
        variables: { page: 1, perPage: 100, startTime: startTimestamp, endTime: endTimestamp },
      });

      const schedules = data.data.Page.airingSchedules || [];
      const uniqueAnimes = new Map<string, LatestAnime>();

      schedules
        .filter((s: any) => !s.media.isAdult)
        .forEach((s: any) => {
          const airingAt = new Date(s.airingAt * 1000);
          const key = `${s.media.id}-${s.episode}`;
          
          if (!uniqueAnimes.has(key)) {
            const englishTitle = s.media.title.english || s.media.title.romaji;
            uniqueAnimes.set(key, {
              id: s.media.id,
              mal_id: s.media.idMal,
              title: englishTitle,
              image: s.media.coverImage.large,
              updated_at: airingAt.toISOString(),
              episode: {
                number: s.episode,
                title: `Épisode ${s.episode}`,
                url: `https://anilist.co/anime/${s.media.id}`,
                image: s.media.coverImage.large,
                released_at: airingAt.toISOString(),
                season: s.media.season,
                year: s.media.seasonYear,
              },
              score: s.media.averageScore,
              year: s.media.seasonYear,
              status: s.media.status,
              source: 'anilist' as const,
            });
          }
        });

      const mappedAnimes = Array.from(uniqueAnimes.values()).sort(
        (a: LatestAnime, b: LatestAnime) =>
          new Date(b.episode.released_at).getTime() - new Date(a.episode.released_at).getTime()
      );

      setRecentEpisodes(mappedAnimes);
    } catch (error) {
      console.error("Erreur lors de la récupération des épisodes récents:", error);
      setRecentEpisodes([]);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  // --- Effets ---
  useEffect(() => {
    const initializeBackend = async () => {
      const isHealthy = await checkBackendHealth();
      setBackendStatus(isHealthy);
      
      if (isHealthy) {
        console.log('✅ Backend connecté et prêt');
      } else {
        console.warn('⚠️ Backend non accessible - les badges VF/VOSTFR pourraient ne pas s\'afficher');
      }
    };

    const fetchData = async () => {
      await Promise.all([
        initializeBackend(),
        fetchFeaturedAnimes(), 
        fetchLatestEpisodes(), 
        fetchRecentEpisodes()
      ]);
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (featuredAnimes.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev < featuredAnimes.length - 1 ? prev + 1 : 0));
    }, 5000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [featuredAnimes]);

  // --- Gestion du défilement horizontal ---
  const handleScroll = (direction: "left" | "right", ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    const scrollAmount = 500;
    const currentScroll = ref.current.scrollLeft;
    const maxScroll = ref.current.scrollWidth - ref.current.clientWidth;
    let newScroll: number;
    if (direction === "left") {
      newScroll = Math.max(0, currentScroll - scrollAmount);
    } else {
      newScroll = Math.min(maxScroll, currentScroll + scrollAmount);
    }
    ref.current.scrollTo({ left: newScroll, behavior: "smooth" });
  };

  // --- Gestion du clic sur un épisode ---
  const handleEpisodeClick = (anime: LatestAnime) => {
    window.open(anime.episode.url, "_blank");
  };

  // --- Composants enfants ---
  const EpisodeCard: React.FC<{ anime: LatestAnime }> = ({ anime }) => {
    const [availability, setAvailability] = useState<AnimeResult[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const airingTime = new Date(anime.episode.released_at);
    const now = new Date();
    const isUpcoming = airingTime > now;
    const formattedTime = airingTime.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    useEffect(() => {
      const fetchAvailability = async () => {
        if (!backendStatus) return; // Ne pas essayer si le backend n'est pas disponible
        
        setIsLoadingAvailability(true);
        try {
          const results = await fetchEpisodeAvailability(anime.title, anime.episode.number);
          setAvailability(results);
        } catch (error) {
          console.error('Erreur lors de la récupération de la disponibilité:', error);
        } finally {
          setIsLoadingAvailability(false);
        }
      };
      
      fetchAvailability();
    }, [anime.title, anime.episode.number, backendStatus]);

    const hasVF = availability.some((result) => result.language === "VF");
    const hasVOSTFR = availability.some((result) => result.language === "VOSTFR");

    return (
      <div className="carte-anime" onClick={() => handleEpisodeClick(anime)}>
        <div className="badge-episode">Épisode {anime.episode.number}</div>
        <div className="image-anime">
          <img src={anime.image} alt={anime.title} loading="lazy" />
        </div>
        <div className="titre-anime">{anime.title}</div>
        <div className="infos-episode">
          <p className="titre-episode">{anime.episode.title}</p>
          <div className="infos-supplementaires">
            {anime.episode.season && (
              <span className="saison">Saison {getSeasonNumber(anime.episode.season)}</span>
            )}
            {anime.score && (
              <span className="score">
                <FaRegStar /> {anime.score}
              </span>
            )}
            {anime.year && <span className="annee">{anime.year}</span>}
          </div>
          <p className="heure-sortie">
            {isUpcoming ? "Sors à" : "Sorti à"} {formattedTime}
          </p>
          <div className="disponibilite">
            {isLoadingAvailability ? (
              <span className="badge-loading">Chargement...</span>
            ) : (
              <>
                {hasVF && <span className="badge-vf">VF</span>}
                {hasVOSTFR && <span className="badge-vostfr">VOSTFR</span>}
                {!hasVF && !hasVOSTFR && backendStatus && (
                  <span className="badge-unavailable">Non disponible</span>
                )}
                {!backendStatus && (
                  <span className="badge-offline">Backend offline</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const BackendStatus: React.FC = () => (
    <div className={`backend-status ${backendStatus ? 'online' : 'offline'}`}>
      <span className="status-indicator">
        {backendStatus ? '🟢' : '🔴'}
      </span>
      <span className="status-text">
        Backend {backendStatus ? 'connecté' : 'déconnecté'}
      </span>
    </div>
  );

  const LatestEpisodesSection: React.FC = () => (
    <section className="section-animes">
      <div className="section-titre">
        <h2>Sorties du {getDayName(new Date())}</h2>
        {isLoading && <span className="loading-indicator">Chargement...</span>}
        <BackendStatus />
      </div>
      <div className="conteneur-scroll">
        <button
          className="fleche-scroll gauche"
          onClick={() => handleScroll("left", scrollRef)}
          aria-label="Défiler vers la gauche"
        >
          <MdChevronLeft />
        </button>
        <div className="liste-animes" ref={scrollRef}>
          {latestEpisodes.length > 0 ? (
            latestEpisodes.map((anime) => (
              <EpisodeCard key={`${anime.mal_id || anime.id}-${anime.episode.number}`} anime={anime} />
            ))
          ) : (
            !isLoading && <p>Aucun épisode trouvé pour aujourd'hui</p>
          )}
        </div>
        <button
          className="fleche-scroll droite"
          onClick={() => handleScroll("right", scrollRef)}
          aria-label="Défiler vers la droite"
        >
          <MdChevronRight />
        </button>
      </div>
    </section>
  );

  const RecentEpisodesSection: React.FC = () => (
    <section className="section-animes">
      <div className="section-titre">
        <h2>Derniers épisodes</h2>
        {isLoadingRecent && <span className="loading-indicator">Chargement...</span>}
      </div>
      <div className="conteneur-scroll">
        <button
          className="fleche-scroll gauche"
          onClick={() => handleScroll("left", scrollRecentRef)}
          aria-label="Défiler vers la gauche"
        >
          <MdChevronLeft />
        </button>
        <div className="liste-animes" ref={scrollRecentRef}>
          {recentEpisodes.length > 0 ? (
            recentEpisodes.map((anime) => (
              <EpisodeCard key={`${anime.id}-${anime.episode.number}-recent`} anime={anime} />
            ))
          ) : (
            !isLoadingRecent && <p>Aucun épisode récent trouvé</p>
          )}
        </div>
        <button
          className="fleche-scroll droite"
          onClick={() => handleScroll("right", scrollRecentRef)}
          aria-label="Défiler vers la droite"
        >
          <MdChevronRight />
        </button>
      </div>
    </section>
  );

  const UserAnimesSection: React.FC = () => (
    <section className="section-vos-animes">
      <div className="section-titre">
        <h2>Vos Animes</h2>
      </div>
      <div className="contenu-vos-animes">
        <div className="bloc-login">
          <div className="message-login">
            <h3>Connectez-vous pour retrouver vos animes</h3>
            <p>Reprenez facilement là où vous vous êtes arrêtés.</p>
          </div>
          <button className="btn-login" onClick={() => navigate("/login")}>
            <MdLogin /> Se connecter
          </button>
        </div>
      </div>
    </section>
  );

  // --- Rendu principal ---
  const currentFeatured = featuredAnimes[currentFeaturedIndex];
  const cleanDescription = currentFeatured?.description?.replace(/<[^>]*>/g, "") || "";

  return (
    <div className="page-accueil" data-theme={isDarkMode ? "dark" : "light"}>
      <Navbar darkMode={isDarkMode} toggleTheme={toggleTheme} />
      {currentFeatured && (
        <section className="section-vedette">
          <div className="fond-vedette">
            <img
              src={currentFeatured.banner || currentFeatured.image}
              alt={currentFeatured.title}
              className="image-fond"
            />
            <div className="overlay"></div>
          </div>
          <div className="contenu-vedette">
            <h1 className="titre-vedette">{currentFeatured.title}</h1>
            <button
              className="btn-regarder"
              onClick={() => navigate(`/watch/${currentFeatured.id}`)}
            >
              <MdPlayArrow /> Regarder
            </button>
            <div className="infos-vedette">
              {currentFeatured.score && (
                <span className="note">
                  <FaRegStar /> {(currentFeatured.score / 10).toFixed(1)}
                </span>
              )}
              {currentFeatured.year && <span className="annee">{currentFeatured.year}</span>}
              {currentFeatured.status && <span className="statut">{currentFeatured.status}</span>}
            </div>
            {cleanDescription && (
              <p className="description-vedette">{cleanDescription.slice(0, 250)}...</p>
            )}
            {currentFeatured.genres && (
              <div className="genres">
                {currentFeatured.genres.slice(0, 3).map((genre) => (
                  <span key={genre} className="genre">
                    {genre}
                  </span>
                ))}
              </div>
            )}
            <div className="actions-vedette">
              <button className="btn-favoris">
                <MdFavorite /> Ajouter aux favoris
              </button>
            </div>
          </div>
        </section>
      )}
      <main className="contenu-principal">
        <UserAnimesSection />
        <LatestEpisodesSection />
        <RecentEpisodesSection />
      </main>
      <footer className="pied-page">
        <div className="contenu-footer">
          <p>&copy; 2025 QomAnime. Découvrez le meilleur de l'anime.</p>
          <div className="liens-footer">
            <a href="#about">À propos</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Politique de confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;