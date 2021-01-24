module.exports.run = (client, message, args) => {

    const guild         = client.guilds.cache.get(process.env.guildId);
    const memberCount   = guild.memberCount;

    message.channel.send('Nous sommes en ce moment **' + memberCount + '** sur le serveur !');

}

module.exports.help = {
    name: 'count', // LE NOM DE LA COMMANDE
    // ex : commande
}