#!/bin/bash

echo "🚀 Démarrage de la démo QM Anime"
echo ""

# Vérifier si le serveur tourne
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "⚠️  Le serveur n'est pas démarré. Démarrage..."
    cd server
    npm run dev &
    SERVER_PID=$!
    echo "Serveur démarré avec PID: $SERVER_PID"
    sleep 5
    cd ..
else
    echo "✅ Serveur déjà démarré"
fi

# Démarrer le client
echo "🌐 Démarrage du client..."
cd client
npm run dev

echo ""
echo "🎉 Application démarrée !"
echo "🌐 Client: http://localhost:3000"
echo "🔧 API: http://localhost:3001"