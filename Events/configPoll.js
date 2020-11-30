module.exports = (client, message) => {

    if (message.content.split(" ")[0] == client.prefix + "configPoll") {
        if (! message.member.hasPermission("ADMINISTRATOR")) {
            message.channel.send("❌ La permissions Administrateur est requise pour cette commande. Peut être vouliez-vous utiliser ``!suggest`` <@" + message.author.id + ">")
            return;
        }
        let messageWords = message.content.split(" ")


        messageWords.splice(0, 1);

        let messageContent = messageWords.join(" ")
     
        if (messageContent == client.poll.channel) {
            message.channel.send(":negative_squared_cross_mark: Le salon par défaut des sondages est déja <#" + messageContent + ">")
            return;
        }
        if (message.guild.channels.cache.find(c => c.id.toLowerCase() === messageContent)) {
            client.poll.channel = messageContent
            message.channel.send(":white_check_mark:  Le salon par défaut des sondages a bien été configuré comme : <#" + messageContent + ">")
            return;
        } else {
            message.channel.send("❌ Veuillez entrer un ID valide <@" + message.author.id + ">")
            return;
        }


    }
}
