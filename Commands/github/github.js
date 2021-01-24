const Discord = require('discord.js');
const axios = require('axios')
module.exports.run = (client, message, args) => {

    message.channel.send(`\`🔑\` Voici le github du bot : https://github.com/Milrer/bot-believemy`)

}

module.exports.help = {
    name: 'github',
    aliases: ['repo']
}