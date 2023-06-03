import cron from "node-cron";
import moment from "moment";
import { getTodayEphemerisName } from "../src/ephemeris.js";

export function ephemerisRepeat(client) {
    cron.schedule("45 5 * * *", () => {
        let channel = client.channels.cache.get("749242783058886719");
        moment.locale("fr");
        const date = moment().format("dddd Do MMMM YYYY");
        const embed = {
            title: `Nous sommes le ${date}`,
            author: {
                name: "bebot",
                icon_url:
                    "https://osakalehusky.com/pictures/bebot/bebot-profile.png",
                url: "https://osakalehusky.com/pictures/bebot/bebot-profile.png",
            },
            description: `Nous fêtons les **${getTodayEphemerisName()}** aujourd'hui, bonne journée à tous !`,
            color: 0x613bdb,
        };
        channel.send({
            embeds: [embed],
        });
    });
}
