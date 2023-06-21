import {Collection, Events} from "discord.js";

export default {
  name: Events.InteractionCreate,
  on: true,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const commandName = interaction.commandName;
    const command = interaction.client.commands.get(commandName);
    if (!command) return;
    const {cooldowns} = interaction.client;

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection())
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 5;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        interaction.reply({
          content: `Veuillez patienter, vous êtes en période de cooldown pour la commande \`${command.data.name}\`. Vous pouvez réutiliser la commande dans <t:${expiredTimestamp}:R>.`,
          ephemeral: true
        });
        setTimeout(() => {
          interaction.deleteReply().catch(console.error);
        }, cooldownAmount);
        return;
      }
    }
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.log(error);
    }
  },
};
