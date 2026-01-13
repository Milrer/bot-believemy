import cron from 'node-cron';
import axios from 'axios';

import {
    getConditionnal,
    getTodayEphemerisName,
    getTodayEphemerisNameWiki,
} from '../ephemeris/ephemeris.js';
import dayjs from 'dayjs';
import OpenAI from 'openai';
import frLocale from 'dayjs/locale/fr.js';
import * as dotenv from 'dotenv';

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

    const embed = {
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
    };
    channel.send({
        embeds: [embed],
    });
}

export function ephemerisRepeat(client) {
    cron.schedule('30 3 * * *', () => {
        createEphermerisMessage(client);
    });
}
