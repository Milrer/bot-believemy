import { Collection, Events } from "discord.js";

export default {
  name: Events.InteractionCreate,
  on: true,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const commandName = interaction.commandName;
    const command = interaction.client.commands.get(commandName);
    if (!command) return;
    const cooldownTime = command.data?.cooldown || 0;
    if (cooldownTime) {
      const timestamps =
        interaction.client.cooldowns.get(commandName) || new Collection();
      if (timestamps.has(interaction.user.id)) {
        const expirationTime =
          timestamps.get(interaction.user.id) + cooldownTime * 1000;

        if (Date.now() < expirationTime) {
          const timeLeft = (expirationTime - Date.now()) / 1000;
          return interaction.reply(
            `Veuillez attendre ${timeLeft.toFixed(
              1
            )} seconde(s) avant de réutiliser la commande \`${commandName}\`.`
          );
        }
      }
      timestamps.set(interaction.user.id, Date.now());
      interaction.client.cooldowns.set(commandName, timestamps);
      setTimeout(
        () => timestamps.delete(interaction.user.id),
        cooldownTime * 1000
      );
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.log(error);
    }
  },
};
