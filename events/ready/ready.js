import { ActivityType, Events } from 'discord.js';
import { registerCommands } from '../../helpers/registerCommands.js';
import { annoncerDemarrage } from '../../helpers/trackingNote.js';
export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        await registerCommands(client);
        await annoncerDemarrage(client);
    },
};
