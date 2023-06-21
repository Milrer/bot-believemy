export default {
  cooldown: 10,
  data: {
    name: "ping",
    description: "Replies with Pong!",
  },

  async execute(interaction) {
    const botPing = Date.now() - interaction.createdTimestamp;
    const apiPing = interaction.client.ws.ping;
    const embedPing = {
      title: "🏓 Pong!",
      fields: [
        {
          name: "Bot Ping",
          value: `${botPing}ms`,
          inline: true,
        },
        {
          name: "API Ping",
          value: `${apiPing}ms`,
          inline: true,
        },
      ],
    };
    await interaction.reply({
      embeds: [embedPing],
    });
  },
};
