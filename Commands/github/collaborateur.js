const Discord = require("discord.js");
const axios = require("axios");
module.exports.run = (client, message, args) => {
  let collabList;

  collabList = axios
    .get("https://api.github.com/repos/Milrer/bot-believemy/contributors")
    .then((r) => {
      collabList = r.data;

      collabList.forEach((u) => {});

      collabList.map((u) => `\n${u.login}`);

      console.log();

      const date = new Date();

      const embed = new Discord.MessageEmbed()
        .setTitle("`🔗` Les collaborateurs")
        .setColor(`613bdb`)
        .setURL("https://github.com/Milrer/bot-believemy")
        .setDescription(
          `**C'est grâce à eux que BeBot existe aujourd'hui** :\n${collabList
            .map((u) => `\n> ${u.login}`)
            .join(
              "",
            )}\n\nSi toi aussi tu veux contribuer, viens sur le github (${
            client.prefix
          }github)`,
        )
        .setFooter(
          `BeBot @${date.getFullYear()} | believemy.com`,
          client.user.avatarURL(),
        );

      message.channel.send(embed);
    });
};

module.exports.help = {
  name: "collaborateur",
  aliases: ["collab", "collaborator"],
  description: "Affiche la liste des collaborateurs qui ont élaboré BeBot",
};
