import { ActivityType, Events } from 'discord.js';
import { registerCommands } from '../../helpers/registerCommands.js';
export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity('tout le monde.', {
            type: ActivityType.Watching,
        });
        try {
            registerCommands(client);
        } catch (error) {
            console.log(error);
        }
    },
};
