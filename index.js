const Discord = require('discord.js');
const fs = require('fs');
const logger = require('./Configs/logger');
const client = new Discord.Client();
const config = require('./Configs/config.js');
client.prefix = config.prefix;
let token;
const cron = require('node-cron');
const quotesArray = require('./src/quotes.js');
const Axios = require('axios');

if (process.env && process.env.token) {
    token = process.env.token;
} else {
    token = require('./Configs/token').token;
}

client.login(token).then(logger.log(`Bot démarré`, 'log'));

// Citation quotidienne du matin
// cron.schedule('45 7 * * *', async () => {
cron.schedule('*/3 * * * *', () => {
    Axios.get(
        'https://fetedujour.fr/api/v2/JVVPdIFBvcdgNyEf/json-saints?api_key=JVVPdIFBvcdgNyEf',
    )
        .then(response => {
            let channel = client.channels.cache.get('770587361058488340');
            let date = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: '2-digit',
            };
            date = date.toLocaleDateString('fr-FR', options);
            const quote = quotesArray[Math.floor(Math.random() * quotesArray.length)];
            const name = JSON.stringify(response);
            const embed = new Discord.MessageEmbed();
            embed
                .setAuthor(
                    'BeBot',
                    'https://believemy.com/pictures/bebot/bebot-profile.png',
                )
                // .setDescription(`${quote.citation}`)
                .setDescription(`Bonne fête à tous les *${name}*.`)
                .setColor('613bdb')
                .setTitle(`Nous sommes le ${date}`)
                .setFooter(`${quote.nom}`, quote.image);
            channel.send(embed);
        })
        .catch(error => console.log(error));
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdirSync('./Commands/').forEach(dir => {
    const commands = fs
        .readdirSync(`./Commands/${dir}/`)
        .filter(file => file.endsWith('.js'));
    for (let file of commands) {
        let pull = require(`./Commands/${dir}/${file}`);
        if (pull.help.name) {
            client.commands.set(pull.help.name, pull);
            logger.log(`La commande ${pull.help.name} a bien été chargée`, 'ready');
        } else {
            logger.log(
                `La commande ${file} n'est pas chargée, il doit manquer une info dans le module 'help'`,
                'error',
            );
        }
        if (pull.help.aliases) {
            pull.help.aliases.forEach(alias => {
                client.aliases.set(alias, pull.help.name);
            });
        }
    }
});

fs.readdir('./Events/', (error, f) => {
    if (error) {
        return console.error(error);
    }
    let event = f.filter(f => f.split('.').pop() === 'js');
    if (event.length <= 0) {
        return logger.log('Aucun event trouvé !', 'error');
    } else {
        logger.log(`${f.length} events chargés`, 'info');
    }

    f.forEach(f => {
        let events = require(`./Events/${f}`);
        let event = f.split('.')[0];
        client.on(event, events.bind(null, client));
        logger.log(`EVENT | ${event} CHARGÉ`, 'ready');
    });
});
