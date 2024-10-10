import cron from 'node-cron';

import { getTodayEphemerisName } from '../ephemeris/ephemeris.js';
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
    // const completion = await openai.chat.completions.create({
    //     model: 'gpt-4o-mini',
    //     messages: [
    //         {
    //             role: 'system',
    //             content:
    //                 'Tu es un bot Discord. Ton but est de servir avec bienvaillance tout le monde, tu es expert en informatique.',
    //         },
    //         {
    //             role: 'user',
    //             content: `L'éphéméride du jour est ${getTodayEphemerisName()}. Souhaite à tous le monde
    //             une bonne journée. Précise chaque jour noir sur blanc la saint du jour pour constaté quelle est la saint à célébrer. Ajoute une anecdote qui s'est passé dans le monde de la tech pour le même jour mais pas la même année. Nous sommes le ${dayjs().format(
    //                 'dddd D MMMM YYYY'
    //             )}. Ajoute des émojis pour rendre le message plus joyeux mais toujours vers la fin d'un paragraphe.
    //             Exemple d'anecdotes tech : le 4 octobre 2011, le géant des réseaux sociaux, Facebook, a lancé son service de partage de photos via mobile, permettant aux utilisateurs de télécharger des photos directement depuis leurs smartphones. Ce fut un moment marquant dans l'évolution des réseaux sociaux et a contribué grandement à la popularité des plateformes de partage d'images.
    //             Termine en souhaitant une bonne journée à tous. Quand tu parles de toi, utilise la première personne du singulier. Tu t'appelles BeBot.`,
    //         },
    //     ],
    // });

    let channel = client.channels.cache.get(process.env.CHANNEL_FETE);
    const date = dayjs().format('dddd D MMMM YYYY');
    const embed = {
        color: 0x613bdb,
        title: `Nous sommes le ${date}`,
        // url: `https://fr.wikipedia.org/wiki/${getTodayEphemerisNameWiki()}`,
        author: {
            name: `${client.user.username}`,
            icon_url:
                'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
            url: 'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
        },
        // description: completion.choices[0].message.content,
        description: `Bonjour ! Aujourd'hui, nous célébrons les *${getTodayEphemerisName()}*. Bonne journée à tous !`,
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
