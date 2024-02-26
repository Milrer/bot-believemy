import { setTimeout } from 'timers/promises';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { embedError } from '../../helpers/errorEmbed.js';
dotenv.config();
export default {
    cooldown: 60,
    data: {
        name: 'verify',
        description: 'Permet de vérifier si vous êtes un accéléré',
    },

    async execute(interaction) {
        try {
            const member = interaction.member;
            const date = new Date();
            const studentRoleId = process.env.STUDENT_ROLE_ID;
            const channelId = interaction.guild.channels.cache.get(
                process.env.CHANNEL_SEND_ID
            );

            console.log(interaction.user.username);

            // axios
            const rocket = await axios.post(
                'https://believemy.com/api/webhooks/check-student',
                {
                    pseudo: interaction.user.username,
                    token: process.env.TOKEN_BELIEVEMY,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (member.roles.cache.has(studentRoleId)) {
                const studentValited = {
                    title: '🔥 Vous êtes déja chez nous',
                    color: 0x57f287,
                    description:
                        'Vous êtes déjà inscrit. Vous ne pouvez pas vous inscrire de nouveau.',
                    footer: {
                        text: `BeBot @${date.getFullYear()} | believemy.com`,
                        icon_url: interaction.user.displayAvatarURL({
                            dynamic: true,
                        }),
                    },
                };
                await interaction.reply({
                    embeds: [studentValited],
                    ephemeral: true,
                });
                await setTimeout(15000);
                return await interaction.deleteReply();
            }

            if (rocket.status == 200) {
                const data = rocket.data;
                if (!data.IS_A_ROCKET_STUDENT) {
                    const studentRefused = {
                        title: '⛔ Accès refusé',
                        color: 0xed4245,
                        description:
                            "Vous n'êtes pas sur notre Accélérateur Rocket",
                        footer: {
                            text: `BeBot @${date.getFullYear()} | believemy.com`,
                            icon_url: interaction.user.displayAvatarURL({
                                dynamic: true,
                            }),
                        },
                    };
                    await interaction.reply({
                        embeds: [studentRefused],
                        ephemeral: true,
                    });
                    await setTimeout(15000);
                    return await interaction.deleteReply();
                } else {
                    await member.roles.add(studentRoleId);
                    const studentAuthorized = {
                        title: '✅ Accès autorisé',
                        color: 0x57f287,
                        description: "Bienvenue dans l'Accélérateur Rocket !",
                        footer: {
                            text: `BeBot @${date.getFullYear()} | believemy.com`,
                            icon_url: interaction.user.displayAvatarURL({
                                dynamic: true,
                            }),
                        },
                    };
                    const welcome = {
                        title: "🔥 Bienvenue dans l'Accélérateur Rocket !",
                        description: `Félicitations à ${member.toString()} qui vient de nous rejoindre !`,
                        footer: {
                            text: `BeBot @${date.getFullYear()} | believemy.com`,
                            icon_url: interaction.user.displayAvatarURL({
                                dynamic: true,
                            }),
                        },
                    };
                    await channelId.send({
                        embeds: [welcome],
                    });
                    await interaction.reply({
                        embeds: [studentAuthorized],
                        ephemeral: true,
                    });
                    await setTimeout(15000);
                    return await interaction.deleteReply();
                }
            } else {
                throw new Error('La requête au webhook à échoué !');
            }
        } catch (error) {
            embedError(interaction, 'Une erreur est survenue', error.message);
        }
    },
};
