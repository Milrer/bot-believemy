import { Events } from "discord.js";

export default {
    name: Events.MessageCreate,
    on: true,
    async execute(message) {
        if (message.author.bot) {
            return;
        }
        if (
            message.author.id === "286174545969283094" ||
            message.member.roles.cache.has("1111224353804263425") ||
            message.member.roles.cache.has("1111212236883644567")
        ) {
            return;
        } else if (
            message.content.includes("https://") ||
            message.content.includes("discord.gg") ||
            message.content.includes("http://")
        ) {
            await message.delete();
            return message.channel
                .send({
                    content: `${message.author}, il est interdit de poster des liens : vous devez avoir le rôle <@&1111224353804263425> ou <@&1111212236883644567> pour cela.`,
                })
                .then((msg) => {
                    setTimeout(() => msg.delete(), 5000);
                });
        }
    },
};
