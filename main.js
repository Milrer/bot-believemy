import { ActivityType, Client } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import { registerEvents } from './helpers/registerEvent.js';
import { ephemerisRepeat } from './helpers/ephemerisRepeat.js';
import { birthday } from './helpers/birthday.js';
import { serverCover } from './helpers/serverCover.js';
import { workshopNotifications } from './helpers/workshopNotifications.js';

const client = new Client({
    intents: 3276799,
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false,
    },
    presence: {
        activities: [
            {
                name: 'tout le monde',
                type: ActivityType.Watching,
            },
        ],
    },
});

await registerEvents(client);
ephemerisRepeat(client);
birthday(client);
serverCover(client);
workshopNotifications(client);

await client.login(process.env.TOKEN);
