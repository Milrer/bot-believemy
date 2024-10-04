import { ActivityType, Client } from 'discord.js';
import * as dotenv from 'dotenv';
import { registerEvents } from './helpers/registerEvent.js';
import { ephemerisRepeat } from './helpers/ephemerisRepeat.js';
import { birthday } from './helpers/birthday.js';

dotenv.config();

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

await client.login(process.env.TOKEN);
