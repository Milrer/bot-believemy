import axios from 'axios';
import cron from 'node-cron';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAST_COVER_PATH = path.join(__dirname, '..', 'data', 'lastCover.json');

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

            // Sauvegarder l'URL pour comparaison dans le message du jour
            try {
                const lastCover = JSON.parse(fs.readFileSync(LAST_COVER_PATH, 'utf-8'));
                lastCover.previousUrl = lastCover.currentUrl;
                lastCover.currentUrl = imageUrl;
                fs.writeFileSync(LAST_COVER_PATH, JSON.stringify(lastCover, null, 2));
            } catch (err) {
                fs.writeFileSync(LAST_COVER_PATH, JSON.stringify({ previousUrl: null, currentUrl: imageUrl }, null, 2));
            }

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
