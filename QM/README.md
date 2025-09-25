# QM Anime - Plateforme de streaming d'animes

Une plateforme moderne de streaming d'animes utilisant l'API anime-vostfr pour fournir du contenu en VF et VOSTFR.

## 🚀 Fonctionnalités

- **Derniers épisodes sortis** : Découvrez les nouveaux épisodes avec badges VF/VOSTFR
- **Animes populaires** : Classement des animes les plus regardés
- **Animes mieux notés** : Les animes avec les meilleures évaluations
- **Interface moderne** : Design responsive avec mode sombre/clair
- **Recherche** : Système de recherche intégré
- **Badges de langue** : Indication claire VF/VOSTFR pour chaque contenu

## 🛠️ Technologies utilisées

### Backend
- **Node.js** avec TypeScript
- **Express.js** pour l'API REST
- **anime-vostfr** pour les données d'animes
- **node-cache** pour la mise en cache
- **CORS** pour les requêtes cross-origin

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **React Router** pour la navigation
- **Axios** pour les requêtes HTTP
- **React Icons** pour les icônes

## 📦 Installation

1. Clonez le repository
```bash
git clone <votre-repo>
cd QM
```

2. Exécutez le script d'installation
```bash
./setup.sh
```

3. Démarrez le serveur (Terminal 1)
```bash
cd server
npm run dev
```

4. Démarrez le client (Terminal 2)
```bash
cd client
npm run dev
```

## 🌐 URLs

- **Client** : http://localhost:3000
- **API** : http://localhost:3001
- **API Health** : http://localhost:3001/api/health

## 📡 Endpoints API

### Animes
- `GET /api/anime/latest-episodes` - Derniers épisodes sortis
- `GET /api/anime/popular` - Animes populaires
- `GET /api/anime/top-rated` - Animes mieux notés
- `GET /api/anime/movies` - Films d'anime
- `GET /api/anime/search?q=terme` - Recherche d'animes
- `POST /api/anime/clear-cache` - Vider le cache

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion

## 🎨 Thèmes

L'application supporte deux thèmes :
- **Mode sombre** (par défaut)
- **Mode clair**

## 🔧 Configuration

### Variables d'environnement (optionnel)
```env
PORT=3001
NODE_ENV=development
```

### Cache
- Durée par défaut : 1 heure
- Recherches : 30 minutes
- Cache automatique pour optimiser les performances

## 📱 Responsive Design

L'interface s'adapte automatiquement aux différentes tailles d'écran :
- Desktop (> 768px)
- Tablet (768px - 480px)
- Mobile (< 480px)

## 🚧 Fonctionnalités à venir

- [ ] Système d'authentification complet
- [ ] Lecteur vidéo intégré
- [ ] Liste de favoris personnalisée
- [ ] Historique de visionnage
- [ ] Notifications pour nouveaux épisodes
- [ ] Système de commentaires
- [ ] Recommandations personnalisées

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## ⚠️ Avertissement

Cette application utilise l'API anime-vostfr pour récupérer les données d'animes. Assurez-vous de respecter les conditions d'utilisation de cette API.

## 🐛 Rapporter un bug

Si vous trouvez un bug, merci de créer une issue avec :
- Description du problème
- Étapes pour reproduire
- Navigateur et version
- Screenshots si applicable