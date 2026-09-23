import * as dotenv from 'dotenv';
import axios from 'axios';
import { journaliser } from './logChannel.js';

dotenv.config();

/**
 * Verse au dossier Believemy un message posté dans un salon suivi.
 *
 * DISCORD_TRACKED_CHANNELS accepte deux formes :
 *   - une liste d'identifiants de salons séparés par des virgules ;
 *   - `*` pour suivre tout le serveur, sans avoir à tenir la liste à jour
 *     quand un salon est créé.
 *
 * DISCORD_IGNORED_CHANNELS retire ensuite les salons qu'on ne veut pas voir
 * arriver dans un dossier d'apprenant. C'est la bonne façon de trier quand on
 * suit tout : on nomme les exceptions, pas la règle.
 *
 * Vide, la variable ne suit rien : aucun message ne descend dans un dossier
 * sans un choix explicite.
 *
 * Rien ici ne doit jamais interrompre le bot : un back indisponible, un auteur
 * inconnu ou un message vide se terminent en silence.
 */

const listeSalons = (variable) =>
    (process.env[variable] || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

const salonSuivi = (channelId) => {
    const suivis = listeSalons('DISCORD_TRACKED_CHANNELS');
    if (suivis.length === 0) {
        return false;
    }
    if (listeSalons('DISCORD_IGNORED_CHANNELS').includes(channelId)) {
        return false;
    }
    // Le salon de journal se raconterait lui-même : on l'écarte toujours,
    // sans avoir à penser à l'ajouter aux exceptions.
    if (channelId === (process.env.DISCORD_LOG_CHANNEL || '').trim()) {
        return false;
    }
    return suivis.includes('*') || suivis.includes(channelId);
};

/**
 * Annonce au démarrage l'état du suivi dans le salon de journal.
 *
 * Sans elle, rien ne distingue un bot qui écoute d'un bot qui n'a pas accès au
 * salon : les messages versés sont rares, et on pourrait attendre des heures
 * une ligne qui ne viendrait jamais.
 */
export const annoncerDemarrage = async (client) => {
    const suivis = listeSalons('DISCORD_TRACKED_CHANNELS');
    const portee = suivis.includes('*')
        ? 'tous les salons'
        : `${suivis.length} salon(s)`;
    const ignores = listeSalons('DISCORD_IGNORED_CHANNELS').length;

    await journaliser(
        client,
        `🟢 Suivi pédagogique actif : ${portee}${ignores ? `, ${ignores} exclu(s)` : ''}. ` +
            `Les messages des apprenants reconnus partent dans leur dossier Believemy.`
    );
};

export const trackMessage = async (message) => {
    try {
        // Les messages privés n'arrivent jamais ici, et c'est voulu : un bot
        // ne peut pas lire les DM entre deux membres.
        if (!message.guild) {
            return;
        }

        if (!salonSuivi(message.channel.id)) {
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

        if (!data) {
            return;
        }

        if (data.matched) {
            const trace = `#${message.channel.name} : message de ${message.author.username} versé au dossier ${data.studentId} (note ${data.noteId}, reconnu par ${data.matchedBy})`;
            if (process.env.DEBUG_TRACKING) {
                console.log(`[suivi] ${trace}`);
            }
            await journaliser(message.client, `📥 ${trace}`);
            return;
        }

        // Un auteur non reconnu est le cas courant sur un serveur ouvert : il
        // reste en console, jamais dans le salon de journal.
        if (process.env.DEBUG_TRACKING) {
            console.log(
                `[suivi] #${message.channel.name} : ${message.author.username} (${message.author.id}) n'est pas un apprenant connu`
            );
        }
    } catch (error) {
        console.error('[suivi] message non versé au dossier :', error.message);
        await journaliser(
            message.client,
            `⚠️ Message de ${message.author?.username ?? 'inconnu'} dans #${message.channel?.name ?? '?'} non versé au dossier : ${error.message}`
        );
    }
};
