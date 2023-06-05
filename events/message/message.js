import { Events } from "discord.js";

export default {
    name: Events.MessageCreate,
    on: true,
    async execute(message) {
        const regex = /\[[\w\s]+\]/;
        const whiteList = [
            "https://tenor.com/",
            "https://www.tenor.com",
            "https://believemy.com",
            "https://www.believemy.com",
            "mozilla.org",
        ];
        const isWhitelisted = whiteList.some((whiteLink) =>
            message.content.includes(whiteLink),
        );
        const isBlacklisted = ["https://", "http://", "discord.gg"].some(
            (blackLink) =>
                message.content.includes(blackLink) && !isWhitelisted,
        );

        if (message.author.bot) {
            return;
        }
        if (isWhitelisted) {
            return;
        }
        if (regex.test(message.content)) {
            return;
        }
        if (isBlacklisted) {
            await message.delete();
            return message.channel
                .send({
                    content: `${message.author}, merci de bien formater le lien, [nom de la ressource] votre lien`,
                })
                .then((msg) => {
                    setTimeout(() => msg.delete(), 5000);
                });
        }
    },
};
