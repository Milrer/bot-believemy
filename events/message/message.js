import { Events } from "discord.js";

export default {
  name: Events.MessageCreate,
  on: true,
  async execute(message) {
    const link = ["https://discord.gg/", "discord.gg"];
    const regex = /\[[\w\s]+\]/;
    if (message.content.includes(link)) {
      await message.delete();
      return message.channel
        .send({
          content: `${message.author}, merci de bien formater le lien, [nom de la ressource] votre lien`,
        })
        .then((msg) => {
          setTimeout(() => msg.delete(), 5000);
        });
    } else if (message.author.bot) {
      return;
    }
    if (
      message.author.id === "286174545969283094" ||
      message.member.roles.cache.has("1111224353804263425") ||
      message.member.roles.cache.has("1111212236883644567")
    ) {
      return;
    } else if (regex.test(message.content)) {
      return;
    } else if (
      message.content.includes("https://") ||
      message.content.includes("discord.gg") ||
      message.content.includes("http://")
    ) {
      await message.delete();
      return message.channel
        .send({
          content: `${message.author}, il est interdit de poster des liens : vous devez avoir le rôle Développeur ou Entrepreneur pour cela.`,
        })
        .then((msg) => {
          setTimeout(() => msg.delete(), 5000);
        });
    }
  },
};
