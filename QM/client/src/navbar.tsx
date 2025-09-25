import React from "react";
import { useNavigate } from "react-router-dom";
import { MdSearch, MdDarkMode, MdLightMode, MdHome, MdMovie, MdFavorite } from "react-icons/md";
import "./Navbar.css";

interface NavbarProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleTheme }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <span className="brand-text">QM</span>
          <span className="brand-subtitle">Anime</span>
        </div>

        <div className="navbar-menu">
          <button className="nav-item" onClick={() => navigate("/")}>
            <MdHome />
            <span>Accueil</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/catalogue")}>
            <MdMovie />
            <span>Catalogue</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/favorites")}>
            <MdFavorite />
            <span>Favoris</span>
          </button>
        </div>

        <div className="navbar-search">
          <div className="search-container">
            <MdSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un anime..."
              className="search-input"
            />
          </div>
        </div>

        <div className="navbar-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? <MdLightMode /> : <MdDarkMode />}
          </button>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Connexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;