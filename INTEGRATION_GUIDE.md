# Guide d'intégration de l'API Backend VF/VOSTFR

## 📋 Résumé des modifications

J'ai modifié votre application React pour intégrer votre API backend qui peut scraper les animes VF/VOSTFR depuis un fichier HTML. Voici ce qui a été implémenté :

### ✨ Nouvelles fonctionnalités

1. **Vérification de disponibilité en temps réel** : Chaque épisode affiche maintenant des badges VF/VOSTFR basés sur votre backend
2. **Status de connexion backend** : Indicateur visuel de l'état de connexion avec votre API
3. **Fallback gracieux** : L'application fonctionne même si le backend est hors ligne
4. **Interface utilisateur améliorée** : Nouveaux badges et indicateurs de chargement

## 🚀 Installation et configuration

### 1. Backend (Express.js)

**Étape 1 : Ajouter les routes à votre serveur**

Dans votre fichier principal Express (`app.js` ou `index.js`) :

```javascript
import express from 'express';
import cors from 'cors';
import animeRoutes from './backend-routes.js'; // Le fichier que j'ai créé

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Routes
app.use('/api', animeRoutes);

// Démarrage du serveur
app.listen(4000, () => {
    console.log('🚀 Serveur backend démarré sur http://localhost:4000');
});
```

**Étape 2 : Structure des fichiers**

```
votre-backend/
├── app.js                 # Votre fichier principal
├── backend-routes.js      # Les nouvelles routes (fichier créé)
├── routes/
│   └── anime.js          # Votre fonction scrapeFrenchAnimeLocal existante
└── data/
    └── animes.html       # Votre fichier HTML avec les données d'animes
```

**Étape 3 : Installer les dépendances**

```bash
npm install cors express
```

### 2. Frontend (React)

**Étape 1 : Remplacer le composant Home**

Remplacez le contenu de votre fichier `Home.jsx` par le contenu du fichier `home-updated.jsx` que j'ai créé.

**Étape 2 : Ajouter les styles CSS**

Ajoutez le contenu du fichier `backend-styles.css` à votre fichier CSS principal ou importez-le directement :

```javascript
import './backend-styles.css';
```

**Étape 3 : Installer les dépendances (si nécessaire)**

```bash
npm install axios
```

## 🔧 Configuration des endpoints

### Endpoints disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/health` | GET | Vérification de l'état du backend |
| `/api/animes` | GET | Récupération de tous les animes VF/VOSTFR |
| `/api/search-anime` | POST | Recherche d'un anime spécifique |
| `/api/search-episode` | POST | Recherche de la disponibilité d'un épisode |
| `/api/stats` | GET | Statistiques sur les animes disponibles |

### Exemple d'utilisation

**Recherche d'un épisode :**
```javascript
POST http://localhost:4000/api/search-episode
Content-Type: application/json

{
    "animeTitle": "One Piece",
    "episodeNumber": 1000
}
```

**Réponse :**
```json
{
    "animeTitle": "One Piece",
    "episodeNumber": 1000,
    "results": [
        {
            "title": "One Piece",
            "url": null,
            "thumbnail": null,
            "language": "VF",
            "episodeNumber": 1000,
            "relevanceScore": 1.0
        },
        {
            "title": "One Piece",
            "url": null,
            "thumbnail": null,
            "language": "VOSTFR",
            "episodeNumber": 1000,
            "relevanceScore": 1.0
        }
    ],
    "totalFound": 2
}
```

## 🎨 Interface utilisateur

### Nouveaux éléments visuels

1. **Badge de status backend** : Affiché dans le coin supérieur droit des sections
   - 🟢 **Connecté** : Backend accessible
   - 🔴 **Déconnecté** : Backend hors ligne

2. **Badges de disponibilité** :
   - **VF** : Version française disponible (vert)
   - **VOSTFR** : Version sous-titrée française disponible (bleu)
   - **Non disponible** : Aucune version trouvée (rouge)
   - **Backend offline** : Impossible de vérifier (gris)
   - **Chargement...** : Vérification en cours (gris avec animation)

3. **Tooltips informatifs** : Survolez les badges pour plus d'informations

## 🔄 Logique de fonctionnement

### 1. Vérification de santé du backend

Au démarrage de l'application, le frontend vérifie si le backend est accessible via `/api/health`.

### 2. Recherche de disponibilité

Pour chaque épisode affiché :
1. Le frontend envoie le titre de l'anime à `/api/search-episode`
2. Le backend compare avec sa base de données scraped
3. Il retourne les formats disponibles (VF/VOSTFR)
4. Le frontend affiche les badges correspondants

### 3. Algorithme de correspondance

Le backend utilise plusieurs méthodes pour matcher les titres :
- Correspondance exacte
- Correspondance partielle (contient)
- Correspondance par mots-clés (au moins 50% des mots)
- Score de pertinence calculé

## 🐛 Résolution de problèmes

### Backend non accessible

**Symptômes** :
- Badge rouge "Backend déconnecté"
- Badges "Backend offline" sur les épisodes

**Solutions** :
1. Vérifiez que votre serveur Express fonctionne sur le port 4000
2. Vérifiez la configuration CORS
3. Assurez-vous que le fichier HTML avec les données existe

### Aucun badge VF/VOSTFR affiché

**Causes possibles** :
1. Le fichier HTML ne contient pas de données
2. Les titres d'anime ne correspondent pas exactement
3. Erreur dans la fonction de scraping

**Solutions** :
1. Vérifiez le contenu du fichier HTML
2. Testez l'endpoint `/api/animes` directement
3. Ajustez l'algorithme de correspondance si nécessaire

### Erreurs CORS

**Symptômes** :
- Erreurs de CORS dans la console du navigateur

**Solutions** :
1. Vérifiez la configuration CORS dans le backend
2. Ajoutez l'URL de votre frontend aux origines autorisées

## 📊 Monitoring et logs

### Logs utiles

Le backend logge automatiquement :
- Les requêtes de recherche
- Les erreurs de scraping
- Les correspondances trouvées

### Métriques disponibles

Utilisez l'endpoint `/api/stats` pour obtenir :
- Nombre total d'animes
- Répartition VF/VOSTFR
- Dernière mise à jour

## 🔮 Améliorations futures possibles

1. **Cache intelligent** : Mise en cache des résultats pour améliorer les performances
2. **Mise à jour automatique** : Rescraping périodique du fichier HTML
3. **Base de données** : Migration vers une vraie base de données pour de meilleures performances
4. **API externe** : Intégration avec d'autres sources de données d'animes
5. **Synchronisation** : Mise à jour en temps réel des disponibilités

## 📝 Notes techniques

- **Performance** : Les requêtes de disponibilité sont faites en parallèle pour chaque épisode
- **Timeout** : Les requêtes vers le backend ont un timeout de 5 secondes
- **Fallback** : Si le backend est inaccessible, l'application fonctionne normalement sans les badges
- **Responsive** : Les nouveaux éléments sont optimisés pour mobile

## 🎯 Prochaines étapes

1. **Testez l'intégration** en démarrant votre backend sur le port 4000
2. **Vérifiez les données** en accédant à `http://localhost:4000/api/animes`
3. **Ajustez la correspondance** si nécessaire selon vos données
4. **Personnalisez les styles** selon votre charte graphique

L'intégration est maintenant complète ! Votre application React affichera automatiquement la disponibilité VF/VOSTFR des épisodes basée sur votre backend local. 🚀