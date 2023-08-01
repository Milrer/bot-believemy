import { Client } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import { registerEvents } from './helpers/registerEvent.js';

const client = new Client({
    intents: 3276799,
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false,
    },
});

await registerEvents(client);

await client.login(process.env.TOKEN);
