import React from 'react';
import Navbar from './navbar';
import { useTheme } from './ThemeContext';

const LoginApp: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="login-app">
      <Navbar darkMode={isDarkMode} toggleTheme={toggleTheme} />
      <main className="login-main">
        <div className="container">
          <h1>Connexion</h1>
          <p>Cette page sera bientôt disponible.</p>
        </div>
      </main>
    </div>
  );
};

export default LoginApp;