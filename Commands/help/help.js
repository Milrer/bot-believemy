const Discord = require('discord.js');

module.exports.run = (client, message, args) => {
    const embed = new Discord.MessageEmbed();
    embed
        .setAuthor('BeBot', 'https://believemy.com/pictures/bebot/bebot-profile.png')
        .setDescription(
            `
BeBot, pour vous servir.
Je suis encore en **élaboration** par mes créateurs, mes facultés ne sont pas encore toutes au point.
        `,
        )
        .setColor('613bdb')
        .setTitle('Liste des commandes disponibles ');
    client.commands.forEach(cmd => {
        let aliases;
        if (cmd.help.aliases) {
            aliases = cmd.help.aliases;
        } else {
            aliases = ['Aucun'];
        }
        embed.addField(
            `${client.prefix}${cmd.help.name}`,
            `${cmd.help.description}\n\n__Alias__ : ${aliases
                .map(u => `\`${u}\``)
                .join(' ')}`,
            true,
        );
    });
    const date = new Date();
    embed.setFooter(
        `BeBot @ ${date.getFullYear()} | believemy.com`,
        client.user.avatarURL(),
    );

    message.channel.send(embed);
};

module.exports.help = {
    name: 'help', // LE NOM DE LA COMMANDE
    // ex : commande,
    aliases: ['aide'],
    description: 'Liste toutes les commandes disponibles',
};
