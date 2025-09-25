import React from 'react';
import Navbar from './navbar';
import { useTheme } from './ThemeContext';
import './catalogue.css';

const Catalogue: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="catalogue">
      <Navbar darkMode={isDarkMode} toggleTheme={toggleTheme} />
      <main className="catalogue-main">
        <div className="container">
          <h1>Catalogue d'animes</h1>
          <p>Cette page sera bientôt disponible.</p>
        </div>
      </main>
    </div>
  );
};

export default Catalogue;