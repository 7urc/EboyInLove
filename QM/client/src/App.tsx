import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import Home from './Home';
import Catalogue from './Catalogue';
import LoginApp from './LoginApp';
import './index.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/login" element={<LoginApp />} />
          <Route path="/watch/:id" element={<div>Page de lecture (à implémenter)</div>} />
          <Route path="/favorites" element={<div>Page des favoris (à implémenter)</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;