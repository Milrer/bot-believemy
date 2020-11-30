returnDateHour = () => {
    let today = new Date();
    let day = String(today.getDate()).padStart(2, '0'), month = String(today.getMonth() + 1).padStart(2, '0'), year = today.getFullYear();
    let fullDate = day + '/' + month + '/' + year
    let hour = String(today.getHours()).padStart(2, '0'), minute = String(today.getMinutes()).padStart(2, '0');
    let fullHour = hour + ':' + minute
    let fullDateHour = fullDate + ' | ' + fullHour;
    return fullDateHour
}

module.exports = (client,message) => {
    if (message.content.split(" ")[0] == client.prefix + "poll") {
        console.log("client poll channel : " + client.poll.channel)
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            message.channel.send("❌ La permissions Administrateur est requise pour cette commande. Peut être vouliez-vous utiliser ``!suggest`` <@" + message.author.id + ">")
            return;
        }
        if (!client.poll.channel) {
            message.channel.send("❌ ``Channel Sondage`` n'est pas défini. Veuillez définir le channel par défaut des sondages via ``!configPoll`` <@" + message.author.id + ">")
            return;
        }


        let messageWords = message.content.split(" ")

        messageWords.splice(0, 1);

        let messageContent = messageWords.join(" ")
        

        let embed = new Discord.MessageEmbed()
            .setTitle("Sondage")
            .setDescription("*Réagissez via les réactions ci-dessous pour donner votre avis* \n")
            .addField(messageContent, "\n-")
            .setColor([250, 230, 30])
            .setThumbnail(message.author.avatarURL)
            .setFooter("Proposé par :" + message.author.username + " | " + returnDateHour() + " | Provided by BelieveMy ")
        message.channel.send(":white_check_mark: ``"+messageContent+ "`` correctement envoyé comme sondage dans <#" + client.poll.channel + ">")
        client.channels.cache.get(client.poll.channel).send(embed).then(function (message) {
            message.react("👍"); message.react("😐"); message.react("👎");
        })



    }
}
