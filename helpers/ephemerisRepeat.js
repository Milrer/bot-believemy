import cron from 'node-cron';
import axios from 'axios';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import {
    getConditionnal,
    getTodayEphemerisName,
    getTodayEphemerisNameWiki,
} from '../ephemeris/ephemeris.js';
import dayjs from 'dayjs';
import OpenAI from 'openai';
import frLocale from 'dayjs/locale/fr.js';
import * as dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAST_COVER_PATH = path.join(__dirname, '..', 'data', 'lastCover.json');
const COVER_FILE_NAME = 'cover.jpg';

dotenv.config();
dayjs.locale(frLocale);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function createEphermerisMessage(client) {
    let channel = client.channels.cache.get(process.env.CHANNEL_FETE);
    const date = dayjs().format('dddd D MMMM YYYY');

    // Récupération du message optionnel du jour
    let dailyMessage = null;
    try {
        const response = await axios.post(
            'https://believemy.com/api/webhooks/daily-message',
            { token: process.env.TOKEN_BELIEVEMY },
            { headers: { 'Content-Type': 'application/json' } }
        );
        dailyMessage = response.data?.message;
    } catch (error) {
        console.error(`[Ephemeris] Erreur récupération daily-message: ${error.message}`);
    }

    // Construction de la description
    let description;
    if (dailyMessage) {
        description = `Bonjour ! Aujourd'hui, nous célébrons ${
            getConditionnal() != '' ? 'les' : ': '
        } **${getTodayEphemerisName()}** !\n\n${dailyMessage}\n\nBonne journée à tous !`;
    } else {
        description = `Bonjour ! Aujourd'hui, nous célébrons ${
            getConditionnal() != '' ? 'les' : ': '
        } **${getTodayEphemerisName()}** ! Bonne journée à tous !`;
    }

    // Vérifier si la couverture a changé
    let coverUrl = null;
    try {
        const lastCover = JSON.parse(fs.readFileSync(LAST_COVER_PATH, 'utf-8'));
        if (lastCover.currentUrl && lastCover.currentUrl !== lastCover.previousUrl) {
            coverUrl = lastCover.currentUrl;
        }
    } catch (err) {
        console.error(`[Ephemeris] Erreur lecture lastCover.json: ${err.message}`);
    }

    const embeds = [];
    const files = [];

    // Si la couverture a changé, l'afficher en premier (pleine largeur).
    // L'image est jointe au message : Discord n'a pas à aller la chercher
    // lui-même, ce qui laissait un encart vide quand il n'y arrivait pas.
    if (coverUrl) {
        try {
            const response = await axios.get(coverUrl, {
                responseType: 'arraybuffer',
                timeout: 30000,
            });
            files.push({
                attachment: Buffer.from(response.data),
                name: COVER_FILE_NAME,
            });
            embeds.push({
                color: 0x613bdb,
                image: { url: `attachment://${COVER_FILE_NAME}` },
            });
        } catch (error) {
            console.error(`[Ephemeris] Erreur téléchargement couverture: ${error.message}`);
        }
    }

    // Embed principal avec la saint du jour
    embeds.push({
        color: 0x613bdb,
        title: `Nous sommes le ${date}`,
        url: getTodayEphemerisNameWiki(),
        author: {
            name: `${client.user.username}`,
            icon_url:
                'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
            url: 'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
        },
        description: description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `${client.user.username} vous souhaite une agréable journée`,
            icon_url: `${client.user.displayAvatarURL()}`,
        },
    });

    channel.send({ embeds, files });
}

export function ephemerisRepeat(client) {
    cron.schedule('30 3 * * *', () => {
        createEphermerisMessage(client);
    });
}
