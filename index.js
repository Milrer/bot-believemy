const Discord = require("discord.js");
const fs = require("fs");
const logger = require("./Configs/logger");
const client = new Discord.Client();
const config = require("./Configs/config.js");
client.prefix = config.prefix;
let token;
const cron = require("node-cron");

if (process.env && process.env.token) {
  token = process.env.token;
} else {
  token = require("./Configs/token").token;
}

client.login(token).then(logger.log(`Bot démarré`, "log"));

// let scheduledMessage = new cron.CronJob("* * * * *", () => {
//   // This runs every day at 10:30:00, you can do anything you want
//   const guild = client.guilds.cache.get(process.env.guild_id);
//   let channel = guild.channels.get("770587361058488340");
//   let quoteArray = ["Quote 1", "Quote 2", "Quote 3"];
//   channel.send(quoteArray[0]);
// });
cron.schedule("*/5 * * * *", function () {
  let channel = client.channels.cache.get("770587361058488340");
  let quoteArray = ["Quote 1", "Quote 2", "Quote 3"];
  let date = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  };
  date = date.toLocaleDateString("fr-FR", options);
  channel.send(`Nous sommes le ${date} - ${quoteArray[0]}`);
});

// When you want to start it, use:
// scheduledMessage.start();
// You could also make a command to pause and resume the job

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdirSync("./Commands/").forEach((dir) => {
  const commands = fs
    .readdirSync(`./Commands/${dir}/`)
    .filter((file) => file.endsWith(".js"));
  for (let file of commands) {
    let pull = require(`./Commands/${dir}/${file}`);
    if (pull.help.name) {
      client.commands.set(pull.help.name, pull);
      logger.log(`La commande ${pull.help.name} a bien été chargée`, "ready");
    } else {
      logger.log(
        `La commande ${file} n'est pas chargée, il doit manquer une info dans le module 'help'`,
        "error",
      );
    }
    if (pull.help.aliases) {
      pull.help.aliases.forEach((alias) => {
        client.aliases.set(alias, pull.help.name);
      });
    }
  }
});

fs.readdir("./Events/", (error, f) => {
  if (error) {
    return console.error(error);
  }
  let event = f.filter((f) => f.split(".").pop() === "js");
  if (event.length <= 0) {
    return logger.log("Aucun event trouvé !", "error");
  } else {
    logger.log(`${f.length} events chargés`, "info");
  }

  f.forEach((f) => {
    let events = require(`./Events/${f}`);
    let event = f.split(".")[0];
    client.on(event, events.bind(null, client));
    logger.log(`EVENT | ${event} CHARGÉ`, "ready");
  });
});
