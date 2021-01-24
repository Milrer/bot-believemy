const Discord = require('discord.js');
const fs = require('fs');
const logger = require("./Configs/logger");
const client = new Discord.Client();
const config = require("./Configs/config.js");
client.prefix = config.prefix;
const token = require('./Configs/token').token;

client.login(token).then(logger.log(`Bot démarré`, 'log'));

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdirSync("./Commands/").forEach(dir => {
    const commands = fs.readdirSync(`./Commands/${dir}/`).filter(file => file.endsWith(".js"));
    for (let file of commands) {
        let pull = require(`./Commands/${dir}/${file}`);
        if (pull.help.name) {
            client.commands.set(pull.help.name, pull);
            logger.log(`La commande ${pull.help.name} a bien été chargée`, 'ready')
        } else {
            logger.log(`La commande ${file} n'est pas chargée, il doit manquer une info dans le module 'help'`, 'error')
        }
        if (pull.help.aliases){
            pull.help.aliases.forEach(alias => {
                client.aliases.set(alias, pull.help.name);
            });
        }
    }

});

fs.readdir('./Events/', (error, f) => {
    if (error) { return console.error(error); }
    let event = f.filter(f => f.split('.').pop() === 'js');
    if (event.length <= 0) { return logger.log('Aucun event trouvé !', 'error'); }else{
        logger.log(`${f.length} events chargés`, 'info');;
    }

        f.forEach((f) => {
            let events = require(`./Events/${f}`);
            let event = f.split('.')[0];
            client.on(event, events.bind(null, client));
            logger.log(`EVENT | ${event} CHARGÉ`, 'ready')
        });
});
