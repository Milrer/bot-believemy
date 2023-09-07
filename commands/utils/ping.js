export default {
  cooldown: 10,
  data: {
    name: "ping",
    description: "Renvoie le ping du bot",
  },

  async execute(interaction) {
    const botPing = await interaction.reply({
      content: "Ping en cours...",
      fetchReply: true,
    });
    const embedPing = {
      color: 0x613bdb,
      author: {
        name: `${interaction.client.user.username}`,
        icon_url: "https://osakalehusky.com/pictures/bebot/bebot-profile.png",
        url: "https://osakalehusky.com/pictures/bebot/bebot-profile.png",
      },
      description: `**Ping du bot**: ${
        botPing.createdTimestamp - interaction.createdTimestamp
      }ms`,
      timestamp: new Date().toISOString(),
    };
    await interaction.editReply({
      content: "",
      embeds: [embedPing],
    });
  },
};
