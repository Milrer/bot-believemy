const Discord = require('discord.js');

module.exports.run = (client, message, args) => {

    const embed = new Discord.MessageEmbed();
    embed.setAuthor('BeBot', 'https://believemy.com/pictures/brand/favicon_1000.png')
            .setDescription(`
BeBot, pour vous servir.
Je suis encore en **élaboration** par mes créateurs, mes facultés ne sont pas encore toutes au point.
        `)
        .setColor('613bdb')
        .setTitle('Commandes')
        .addField('!youtube', 'Affiche la chaîne YouTube', true)
        .addField('!count', 'Affiche le nombre de membres sur le salon', true);
    
    message.channel.send(embed);

}

module.exports.help = {
    name: 'help', // LE NOM DE LA COMMANDE
    // ex : commande
}