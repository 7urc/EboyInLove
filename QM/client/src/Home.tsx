import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MdFavorite,
  MdStar,
  MdPlayArrow,
  MdChevronLeft,
  MdChevronRight,
  MdLogin,
  MdNewReleases,
  MdSchedule,
} from "react-icons/md";
import Navbar from "./navbar";
import { useTheme } from "./ThemeContext";
import "./home.css";

const API_BASE_URL = "/api";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [latestEpisodes, setLatestEpisodes] = useState<LatestEpisode[]>([]);
  const [popularAnimes, setPopularAnimes] = useState<Anime[]>([]);
  const [topRatedAnimes, setTopRatedAnimes] = useState<Anime[]>([]);
  const [featuredList, setFeaturedList] = useState<Anime[]>([]);
  const [currentFeatured, setCurrentFeatured] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestScrollRef = useRef<HTMLDivElement | null>(null);
  const popularScrollRef = useRef<HTMLDivElement | null>(null);
  const topRatedScrollRef = useRef<HTMLDivElement | null>(null);

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer toutes les données en parallèle
        const [latestRes, popularRes, topRatedRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/anime/latest-episodes`),
          axios.get(`${API_BASE_URL}/anime/popular`),
          axios.get(`${API_BASE_URL}/anime/top-rated`),
        ]);

        setLatestEpisodes(latestRes.data);
        setPopularAnimes(shuffleArray(popularRes.data));
        setTopRatedAnimes(shuffleArray(topRatedRes.data));
        
        // Utiliser les animes populaires pour le carrousel principal
        setFeaturedList(shuffleArray(popularRes.data).slice(0, 10));
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (featuredList.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentFeatured(prev => (prev + 1) % featuredList.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [featuredList]);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: "left" | "right") => {
    if (!ref.current) return;
    const amount = 500;
    ref.current.scrollTo({
      left: dir === "left" ? ref.current.scrollLeft - amount : ref.current.scrollLeft + amount,
      behavior: "smooth",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Aujourd'hui";
    if (diffDays === 2) return "Hier";
    if (diffDays <= 7) return `Il y a ${diffDays - 1} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const handleLogin = () => navigate('/login');

  const featured = featuredList[currentFeatured];

  const LanguageBadge: React.FC<{ language: 'VF' | 'VOSTFR' }> = ({ language }) => (
    <span className={`language-badge ${language.toLowerCase()}`}>
      {language}
    </span>
  );

  const EpisodeCard: React.FC<{ episode: LatestEpisode }> = ({ episode }) => (
    <div className="episode-card" onClick={() => navigate(`/watch/${episode.animeId}`)}>
      <div className="episode-image">
        <img src={episode.image} alt={episode.animeTitle} loading="lazy" />
        <div className="episode-overlay">
          <MdPlayArrow className="play-icon" />
        </div>
        <LanguageBadge language={episode.language} />
        <div className="episode-info-overlay">
          <span className="episode-number">
            {episode.season ? `S${episode.season} ` : ''}Ep. {episode.episodeNumber}
          </span>
        </div>
      </div>
      <div className="episode-details">
        <h4 className="episode-title">{episode.animeTitle}</h4>
        <div className="episode-meta">
          <span className="episode-date">
            <MdSchedule size={14} />
            {formatDate(episode.releaseDate)}
          </span>
        </div>
      </div>
    </div>
  );

  const AnimeCard: React.FC<{ anime: Anime; rank?: number }> = ({ anime, rank }) => (
    <div className="anime-card" onClick={() => navigate(`/watch/${anime.id}`)}>
      <div className="card-image">
        <img src={anime.image} alt={anime.title} loading="lazy" />
        <div className="card-overlay">
          <MdPlayArrow className="play-icon" />
        </div>
        <LanguageBadge language={anime.language} />
        <div className="card-title">{anime.title}</div>
        {rank && <div className="rank-badge">#{rank}</div>}
        {anime.score && (
          <div className="score-badge">
            <MdStar size={12} />
            <span>{(anime.score / 10).toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );

  interface SectionProps {
    title: string;
    data: Anime[];
    scrollRef: React.RefObject<HTMLDivElement | null>;
    showRank?: boolean;
    icon?: React.ReactNode;
  }

  const Section: React.FC<SectionProps> = ({ title, data, scrollRef, showRank = false, icon }) => (
    <section className="content-section">
      <div className="section-header">
        <h2>
          {icon && <span className="section-icon">{icon}</span>}
          {title}
        </h2>
      </div>
      <div className="scroll-container">
        <button className="scroll-arrow left" onClick={() => scroll(scrollRef, "left")}>
          <MdChevronLeft />
        </button>
        <div className="horizontal-scroll" ref={scrollRef}>
          {data.slice(0, 30).map((a, i) => (
            <AnimeCard key={a.id} anime={a} rank={showRank ? i + 1 : undefined} />
          ))}
        </div>
        <button className="scroll-arrow right" onClick={() => scroll(scrollRef, "right")}>
          <MdChevronRight />
        </button>
      </div>
    </section>
  );

  const LatestEpisodesSection: React.FC = () => (
    <section className="content-section">
      <div className="section-header">
        <h2>
          <span className="section-icon"><MdNewReleases /></span>
          Derniers épisodes sortis
        </h2>
      </div>
      <div className="scroll-container">
        <button className="scroll-arrow left" onClick={() => scroll(latestScrollRef, "left")}>
          <MdChevronLeft />
        </button>
        <div className="horizontal-scroll episodes-scroll" ref={latestScrollRef}>
          {latestEpisodes.slice(0, 20).map((episode) => (
            <EpisodeCard key={`${episode.animeId}-${episode.episodeNumber}`} episode={episode} />
          ))}
        </div>
        <button className="scroll-arrow right" onClick={() => scroll(latestScrollRef, "right")}>
          <MdChevronRight />
        </button>
      </div>
    </section>
  );

  const YourAnimeSection: React.FC = () => (
    <section className="your-anime-section">
      <div className="section-header">
        <h2>Vos Animes</h2>
      </div>
      <div className="your-anime-content">
        <div className="login-prompt">
          <div className="login-message">
            <h3>Connectez-vous pour accéder à vos animes personnalisés</h3>
            <p>Retrouvez vos animes en cours de lecture, vos favoris et vos recommandations</p>
          </div>
          <button className="login-btn" onClick={handleLogin}>
            <MdLogin /> Se connecter
          </button>
        </div>
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="home">
        <Navbar darkMode={isDarkMode} toggleTheme={toggleTheme} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des animes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <Navbar darkMode={isDarkMode} toggleTheme={toggleTheme} />
        <div className="error-container">
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <Navbar darkMode={isDarkMode} toggleTheme={toggleTheme} />

      {featured && (
        <section className="hero-section">
          <div className="hero-background">
            <img src={featured.image} alt={featured.title} className="hero-bg-image" />
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <div className="hero-info">
              <h1 className="hero-title">{featured.title}</h1>
              <div className="hero-badges">
                <LanguageBadge language={featured.language} />
                {featured.year && <span className="year-badge">{featured.year}</span>}
              </div>
              <button className="hero-watch-btn" onClick={() => navigate(`/watch/${featured.id}`)}>
                <MdPlayArrow /> Regarder
              </button>
              <div className="hero-meta">
                {featured.score && (
                  <div className="hero-rating">
                    <MdStar />
                    <span>{(featured.score / 10).toFixed(1)}</span>
                  </div>
                )}
                {featured.status && <span className="hero-status">{featured.status}</span>}
              </div>
              {featured.genres && featured.genres.length > 0 && (
                <div className="hero-genres">
                  {featured.genres.slice(0, 3).map(g => (
                    <span key={g} className="hero-genre">{g}</span>
                  ))}
                </div>
              )}
              <div className="hero-actions">
                <button className="btn-favorite">
                  <MdFavorite /> Ajouter aux favoris
                </button>
              </div>
            </div>
          </div>
          <div className="hero-indicators">
            {featuredList.map((_, idx) => (
              <button
                key={idx}
                className={`indicator ${idx === currentFeatured ? "active" : ""}`}
                onClick={() => setCurrentFeatured(idx)}
              />
            ))}
          </div>
        </section>
      )}

      <main className="main-content">
        <LatestEpisodesSection />
        <YourAnimeSection />
        <Section 
          title="Animes Populaires" 
          data={popularAnimes} 
          scrollRef={popularScrollRef} 
          showRank 
          icon={<MdStar />}
        />
        <Section 
          title="Mieux Notés" 
          data={topRatedAnimes} 
          scrollRef={topRatedScrollRef} 
          icon={<MdFavorite />}
        />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 QomAnime. Découvrez le meilleur de l'anime.</p>
          <div className="footer-links">
            <a href="#">À propos</a>
            <a href="#">Contact</a>
            <a href="#">Politique de confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;