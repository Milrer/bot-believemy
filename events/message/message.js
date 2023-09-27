import { Events } from 'discord.js';
import { blacklist } from '../../blacklist/blacklist.js';

export default {
    name: Events.MessageCreate,
    on: true,
    async execute(message) {
        if (message.author.bot) {
            return;
        }
        const isBlacklisted = blacklist.some((blackLink) =>
            message.content.includes(blackLink)
        );
        if (message.content.startsWith('http://localhost')) {
            return;
        }
        if (isBlacklisted) {
            await message.delete();
            return message.channel
                .send({
                    content: `${message.author}, Liens interdit`,
                })
                .then((msg) => {
                    setTimeout(() => msg.delete(), 5000);
                });
        }
    },
};
