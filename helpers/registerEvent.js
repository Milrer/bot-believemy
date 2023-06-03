import { readdir } from "fs/promises";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const eventsPath = join(__dirname, "..", "events");

export const registerEvents = async (client) => {
  const eventFolders = await readdir(eventsPath, { withFileTypes: true });
  for (const folder of eventFolders) {
    if (!folder.isDirectory()) continue;
    const eventFiles = await readdir(join(eventsPath, folder.name));

    for (const file of eventFiles) {
      if (!file.endsWith(".js")) continue;

      const eventPath = join(eventsPath, folder.name, file);
      const eventModule = await import(`file://${eventPath}`);
      const event = eventModule.default;
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    }
  }
};
