#!/bin/bash

echo "🚀 Configuration du projet QM Anime"

# Installation des dépendances du serveur
echo "📦 Installation des dépendances du serveur..."
cd server
npm install

# Build du serveur
echo "🔨 Build du serveur..."
npm run build

# Installation des dépendances du client
echo "📦 Installation des dépendances du client..."
cd ../client
npm install

echo "✅ Configuration terminée!"
echo ""
echo "Pour démarrer le projet:"
echo "1. Terminal 1 - Serveur: cd server && npm run dev"
echo "2. Terminal 2 - Client: cd client && npm run dev"
echo ""
echo "🌐 Client: http://localhost:3000"
echo "🔧 API: http://localhost:3001"