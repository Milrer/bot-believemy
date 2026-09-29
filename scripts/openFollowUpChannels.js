import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { ouvrirSalonSuivi, salonDe } from '../helpers/followUpChannels.js';

dotenv.config();

/**
 * Ouvre d'un coup les salons de suivi des apprenants déjà sur le serveur.
 * Les nouveaux, eux, reçoivent le leur au passage de /verify.
 *
 *   node scripts/openFollowUpChannels.js "123=Prénom Nom,456=Prénom Nom"        → simulation
 *   node scripts/openFollowUpChannels.js "123=Prénom Nom,456=Prénom Nom" --go   → ouverture
 *
 * Le nom, facultatif, est celui du compte Believemy : il nomme le salon.
 *
 * Sans --go, rien n'est créé ni envoyé : le script dit seulement ce qu'il
 * ferait. Un salon déjà ouvert n'est jamais recréé.
 */

const entrees = (process.argv[2] || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
    .map((e) => {
        const [id, ...reste] = e.split('=');
        const [prenom = '', ...nom] = reste.join('=').trim().split(/\s+/);
        return { id: id.trim(), prenom, nom: nom.join(' ') };
    });
const ids = entrees.map((e) => e.id);
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

    for (const { id, prenom, nom } of entrees) {
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
            console.log(`  ${prenom || member.displayName} ${nom} (${member.displayName}) : salon à ouvrir`);
            continue;
        }
        try {
            const { salon } = await ouvrirSalonSuivi(member, { prenom, nom });
            console.log(`  ${member.displayName} : ouvert (#${salon.name})`);
        } catch (error) {
            console.log(`  ${member.displayName} : ÉCHEC, ${error.message}`);
        }
    }

    await client.destroy();
    process.exit(0);
});

await client.login(process.env.TOKEN);
