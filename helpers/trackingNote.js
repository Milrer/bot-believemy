import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * Verse au dossier Believemy un message posté dans un salon suivi.
 *
 * Seuls les salons listés dans DISCORD_TRACKED_CHANNELS sont versés : le
 * dossier d'un apprenant n'a pas à recevoir tout le serveur, et beaucoup de
 * salons n'ont rien de pédagogique.
 *
 * Rien ici ne doit jamais interrompre le bot : un back indisponible, un auteur
 * inconnu ou un message vide se terminent en silence.
 */

const trackedChannels = () =>
    (process.env.DISCORD_TRACKED_CHANNELS || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

export const trackMessage = async (message) => {
    try {
        // Les messages privés n'arrivent jamais ici, et c'est voulu : un bot
        // ne peut pas lire les DM entre deux membres.
        if (!message.guild) {
            return;
        }

        const salons = trackedChannels();
        if (salons.length === 0 || !salons.includes(message.channel.id)) {
            return;
        }

        // Une image seule ou un simple autocollant n'a rien à consigner.
        const contenu = (message.content || '').trim();
        if (contenu === '') {
            return;
        }

        const { data } = await axios.post(
            'https://believemy.com/api/webhooks/discord-note',
            {
                token: process.env.TOKEN_BELIEVEMY,
                discordId: message.author.id,
                username: message.author.username,
                globalName: message.author.globalName || null,
                displayName: message.member?.displayName || null,
                content: contenu,
                channel: message.channel.name,
                sentAt: message.createdAt.toISOString(),
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
        );

        // Un auteur non reconnu est le cas courant sur un serveur ouvert :
        // on ne le signale qu'en debug, jamais dans un salon.
        if (data && data.matched === false && process.env.DEBUG_TRACKING) {
            console.log(
                `[suivi] auteur non reconnu : ${message.author.username} (${message.author.id})`
            );
        }
    } catch (error) {
        console.error('[suivi] message non versé au dossier :', error.message);
    }
};
