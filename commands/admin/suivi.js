import * as dotenv from 'dotenv';
import { ouvrirSalonSuivi } from '../../helpers/followUpChannels.js';

dotenv.config();

/**
 * /suivi membre:@x — ouvre à la main le salon de suivi individuel d'un
 * apprenant, ou renvoie vers celui qui existe déjà.
 *
 * Réservée aux administrateurs du bot : ouvrir un salon privé à quelqu'un
 * qui n'est pas apprenant verserait ses messages dans un dossier qui n'est
 * pas le sien.
 */
export default {
    cooldown: 5,
    data: {
        name: 'suivi',
        description: "Ouvre le salon de suivi individuel d'un apprenant.",
        default_member_permissions: '8',
        options: [
            {
                type: 6,
                name: 'membre',
                description: "L'apprenant",
                required: true,
            },
        ],
    },

    async execute(interaction) {
        const admins = (process.env.BEBOT_ADMIN_ID || '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);
        if (!admins.includes(interaction.user.id)) {
            return interaction.reply({
                content: 'Commande réservée.',
                ephemeral: true,
            });
        }

        const member = interaction.options.getMember('membre');
        if (!member || member.user.bot) {
            return interaction.reply({
                content: "Ce membre n'est pas sur le serveur.",
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: true });
        try {
            const { salon, cree } = await ouvrirSalonSuivi(member);
            return interaction.editReply(
                cree
                    ? `Salon ouvert : ${salon.toString()}`
                    : `Il existe déjà : ${salon.toString()}`
            );
        } catch (error) {
            return interaction.editReply(
                `Le salon n'a pas pu être ouvert : ${error.message}`
            );
        }
    },
};
