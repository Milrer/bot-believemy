module.exports.run = (client, message, args) => {

	// LE CODE
    // ex : message.channel.send('coucou')
    
    message.channel.send('La chaîne youtube officielle de Believemy : https://www.youtube.com/channel/UC9RqnWGripL5L3lxH-fEZjg');

}

module.exports.help = {
    name: 'youtube', // LE NOM DE LA COMMANDE
    // ex : commande
    aliases: ['yt'],
    description: 'Affiche la chaîne YouTube'
}