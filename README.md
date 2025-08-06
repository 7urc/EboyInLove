# Discord Ban Bot

Un bot Discord qui bannit automatiquement tous les membres d'un serveur quand il se connecte.

## ⚠️ AVERTISSEMENT

Ce bot est extrêmement destructeur ! Il bannira TOUS les membres des serveurs où il a les permissions. Utilisez-le uniquement sur vos propres serveurs de test.

## Installation

1. Installez Node.js (version 16 ou plus récente)
2. Clonez ce projet
3. Installez les dépendances :
   ```bash
   npm install
   ```

## Configuration

1. Créez un bot Discord sur le [Discord Developer Portal](https://discord.com/developers/applications)
2. Copiez le token de votre bot
3. Remplacez `VOTRE_TOKEN_ICI` dans `index.js` par votre token

## Permissions requises

Le bot a besoin des permissions suivantes :
- `Ban Members` (Bannir des membres)
- `View Channels` (Voir les salons)

## Utilisation

```bash
npm start
```

## Fonctionnalités

- ✅ Bannit tous les membres au démarrage
- ✅ Évite de se bannir lui-même
- ✅ Respecte la hiérarchie des rôles
- ✅ Ne peut pas bannir le propriétaire du serveur
- ✅ Gestion des erreurs et rate limiting
- ✅ Logs détaillés

## Sécurité

- Le bot vérifie ses permissions avant d'agir
- Il respecte la hiérarchie des rôles Discord
- Il inclut une protection contre le rate limiting

## Responsabilité

L'utilisation de ce bot est sous votre entière responsabilité. Assurez-vous d'avoir l'autorisation d'utiliser ce bot sur les serveurs concernés.