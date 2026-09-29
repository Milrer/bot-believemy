import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { ouvrirSalonSuivi, salonDe } from '../helpers/followUpChannels.js';

dotenv.config();

/**
 * Ouvre d'un coup les salons de suivi des apprenants déjà sur le serveur.
 * Les nouveaux, eux, reçoivent le leur au passage de /verify.
 *
 *   node scripts/openFollowUpChannels.js 123,456,789        → simulation
 *   node scripts/openFollowUpChannels.js 123,456,789 --go   → ouverture
 *
 * Sans --go, rien n'est créé ni envoyé : le script dit seulement ce qu'il
 * ferait. Un salon déjà ouvert n'est jamais recréé.
 */

const ids = (process.argv[2] || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
const pourDeVrai = process.argv.includes('--go');

if (ids.length === 0) {
    console.log('Usage : node scripts/openFollowUpChannels.js id1,id2,... [--go]');
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once('ready', async () => {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    console.log(pourDeVrai ? 'Ouverture des salons :' : 'Simulation (ajouter --go pour ouvrir) :');

    for (const id of ids) {
        const member = await guild.members.fetch(id).catch(() => null);
        if (!member) {
            console.log(`  ${id} : absent du serveur, ignoré`);
            continue;
        }
        const existant = await salonDe(guild, id);
        if (existant) {
            console.log(`  ${member.displayName} : salon déjà ouvert (#${existant.name})`);
            continue;
        }
        if (!pourDeVrai) {
            console.log(`  ${member.displayName} : salon à ouvrir`);
            continue;
        }
        try {
            const { salon } = await ouvrirSalonSuivi(member);
            console.log(`  ${member.displayName} : ouvert (#${salon.name})`);
        } catch (error) {
            console.log(`  ${member.displayName} : ÉCHEC, ${error.message}`);
        }
    }

    await client.destroy();
    process.exit(0);
});

await client.login(process.env.TOKEN);
