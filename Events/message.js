const Discord = require('discord.js');
const prefix = '/';

module.exports = (client, message) => {
    if (message.author.bot || message.channel.type === 'dm') { return; }
    if (!message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) { return; }
    if (!message.content.startsWith(prefix)) { return; }

    let messageArray = message.content.split(" ");
    let cmd = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    let commandfile = client.commands.get(cmd.slice(prefix.length)) || client.commands.get(client.aliases.get(cmd.slice(prefix.length)));
    if(commandfile) commandfile.run(client,message,args);
};
