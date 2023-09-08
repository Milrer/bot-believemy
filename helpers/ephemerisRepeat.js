import cron from 'node-cron';

import {
    getTodayEphemerisName,
    getTodayEphemerisNameWiki,
} from '../ephemeris/ephemeris.js';
import dayjs from 'dayjs';
import frLocale from 'dayjs/locale/fr.js';
dayjs.locale(frLocale);

export function ephemerisRepeat(client) {
    cron.schedule('59 9 * * *', () => {
        let channel = client.channels.cache.get(process.env.CHANNEL_FETE);
        const date = dayjs().format('dddd D MMMM YYYY');
        const embed = {
            color: 0x613bdb,
            title: `Nous sommes le ${date}`,
            url: `https://fr.wikipedia.org/wiki/${getTodayEphemerisNameWiki()}`,
            author: {
                name: `${client.user.username}`,
                icon_url:
                    'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
                url: 'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
            },
            description: `Nous fêtons les **${getTodayEphemerisName()}** aujourd'hui, bonne journée à tous !`,
            timestamp: new Date().toISOString(),
            footer: {
                text: `${client.user.username} vous souhaite une agréable journée`,
                icon_url: `${client.user.displayAvatarURL()}`,
            },
        };
        channel.send({
            embeds: [embed],
        });
    });
}
