import {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    MessageFlags,
} from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();
import { registerEvents } from "./helpers/registerEvent.js";
import { ephemerisRepeat } from "./helpers/ephemerisRepeat.js";

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
    ],
    allowedMentions: {
        parse: ["users", "roles"],
        repliedUser: false,
    },
});
registerEvents(client);
ephemerisRepeat(client);

client.login(process.env.TOKEN);
