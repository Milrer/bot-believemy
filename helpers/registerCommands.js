import { Collection, REST, Routes } from "discord.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readdirSync } from "node:fs";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

export const registerCommands = async (client) => {
  client.commands = new Collection();
  client.cooldowns = new Collection();
  const commandFolders = readdirSync(join(__dirname, "..", "commands"), {
    withFileTypes: true,
  })
    .filter((folder) => folder.isDirectory())
    .map((dirent) => dirent.name);

  for (const folder of commandFolders) {
    const commandFiles = readdirSync(
      join(__dirname, "..", "commands", folder)
    ).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = join(__dirname, "..", "commands", folder, file);
      try {
        const { default: command } = await import(`file://${filePath}`);
        if (command && "data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
        }
      } catch (error) {
        console.error(`[ERROR] Unable to load command ${filePath}: ${error}`);
      }
    }
  }
  const commands = client.commands.map((cmd) => cmd.data);
  const commandNames = client.commands.map((command) => command.data.name);
  try {
    console.log(
      `Found ${commands.length} command${commands.length === 1 ? "" : "s"}.`
    );
    console.log(`Commands: ${commandNames}`);
    const rest = new REST().setToken(process.env.TOKEN);
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log(
      `Successfully reloaded ${data.length} application (/) command${
        data.length === 1 ? "" : "s"
      }.`
    );
  } catch (error) {
    console.error(error);
  }
};
