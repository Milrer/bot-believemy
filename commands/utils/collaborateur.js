import axios from "axios";

export default {
  cooldown: 10,
  data: {
    name: "collaborateur",
    description: "Découvrez les collaborateurs de Bebot",
  },

  async execute(interaction) {
    let collabList;
    collabList = axios
      .get("https://api.github.com/repos/Milrer/bot-believemy/contributors")
      .then(async (r) => {
        collabList = r.data;
        collabList.forEach((u) => {});
        collabList.map((u) => `\n${u.login}`);
        const date = new Date();
        const github = {
          color: 0x613bdb,
          title: "`🔗` Les collaborateurs",
          url: "https://github.com/Milrer/bot-believemy",
          author: {
            name: `${interaction.client.user.username}`,
            icon_url:
              "https://osakalehusky.com/pictures/bebot/bebot-profile.png",
            url: "https://osakalehusky.com/pictures/bebot/bebot-profile.png",
          },
          description: `**C'est grâce à eux que BeBot existe aujourd'hui** :\n${collabList
            .map((u) => `\n> ${u.login}`)
            .join(
              ""
            )}\n\nSi toi aussi tu veux contribuer, viens sur le github en faisait la commande \`/github\` `,
          timestamp: new Date().toISOString(),
          footer: {
            text: `${
              interaction.client.user.username
            } @${date.getFullYear()} | believemy.com`,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
          },
        };
        await interaction.reply({
          embeds: [github],
        });
      });
  },
};
