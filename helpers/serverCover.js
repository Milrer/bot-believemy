import axios from 'axios';
import cron from 'node-cron';

export function serverCover(client) {
    // Exécution tous les jours à 3h00 UTC
    cron.schedule('0 3 * * *', async () => {
        console.log('[ServerCover] Mise à jour de la bannière du serveur...');

        try {
            const response = await axios.post(
                'https://believemy.com/api/webhooks/server-cover',
                {
                    token: process.env.TOKEN_BELIEVEMY,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (!response.data || !response.data.imageUrl) {
                console.log('[ServerCover] Aucune URL d\'image reçue de l\'API');
                return;
            }

            const { imageUrl } = response.data;

            // Récupérer le serveur (guild)
            const guild = client.guilds.cache.get(process.env.GUILD_ID);

            if (!guild) {
                console.error('[ServerCover] Serveur introuvable. Vérifiez GUILD_ID dans .env');
                return;
            }

            // Mettre à jour la bannière du serveur
            await guild.setBanner(imageUrl);

            console.log(`[ServerCover] Bannière mise à jour avec succès : ${imageUrl}`);
        } catch (error) {
            console.error(`[ServerCover] Erreur lors de la mise à jour : ${error.message}`);
        }
    });
}
