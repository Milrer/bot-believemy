import { ActivityType, Events } from 'discord.js';
import { registerCommands } from '../../helpers/registerCommands.js';
import {
    getFollowersCount,
    getUserId,
} from '../../helpers/twitch/followersCount.js';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        try {
            await registerCommands(client);
            const twitchUserId = await getUserId(
                process.env.PSEUDO_TWITCH,
                process.env.TOKEN_TWITCH
            );

            if (twitchUserId) {
                const followersCount = await getFollowersCount(
                    twitchUserId,
                    process.env.TOKEN_TWITCH
                );
                client.user.setActivity(`avec ${followersCount} followers`, {
                    type: ActivityType.Playing,
                });
            }
        } catch (error) {
            console.log(error);
        }
    },
};
