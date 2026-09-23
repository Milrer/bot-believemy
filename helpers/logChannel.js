import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Le salon où BeBot rend compte de ce qu'il fait.
 *
 * On n'y envoie que ce qui mérite un coup d'œil : un message versé au dossier
 * d'un apprenant, une diffusion refusée, une panne. Le tout-venant reste en
 * console, sinon le salon devient illisible et plus personne ne le regarde.
 *
 * Un journal injoignable ne doit JAMAIS faire échouer ce qu'il raconte : mal
 * configuré, sans droits d'écriture ou supprimé, il se contente de rester
 * muet.
 */
export const journaliser = async (client, ligne) => {
    const salonId = (process.env.DISCORD_LOG_CHANNEL || '').trim();
    if (!salonId || !client) {
        return;
    }
    try {
        const salon =
            client.channels.cache.get(salonId) ||
            (await client.channels.fetch(salonId));
        if (salon && salon.isTextBased()) {
            await salon.send(ligne);
        }
    } catch (error) {
        console.error('[journal] salon Discord indisponible :', error.message);
    }
};
