import { setTimeout } from 'timers/promises';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { embedError } from '../../helpers/errorEmbed.js';
dotenv.config();

export default {
    cooldown: 60,
    data: {
        name: 'visa',
        description:
            'Permet de vérifier si vous possédez un Visa pour Believemy.',
    },

    async execute(interaction) {
        try {
            const member = interaction.member;
            const date = new Date();
            const visaRoleId = process.env.VISA_ROLE_ID;
            const channelId = interaction.guild.channels.cache.get(
                process.env.CHANNEL_SEND_ID
            );

            const rocket = await axios.post(
                'https://believemy.com/api/webhooks/check-visa',
                {
                    pseudo: interaction.user.username,
                    token: process.env.TOKEN_BELIEVEMY,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (member.roles.cache.has(visaRoleId)) {
                const studentValited = {
                    title: '📌 Votre Visa a déjà été vérifié.',
                    color: 0x57f287,
                    description:
                        'Vous pouvez déjà profiter des salons réservés à notre communauté privée.',
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

            if (rocket.status === 200) {
                const data = rocket.data;
                if (data.SHOULD_ADD_DISCORD_PSEUDO) {
                    const addPseudo = {
                        title: '🔎 Ajoutez votre pseudo Discord sur Believemy',
                        color: 0x808080,
                        description:
                            'Nous avons besoin de votre pseudo Discord pour vous vérifier. Renseignez votre pseudo sur Believemy dans vos paramètres et rééssayez. \n\n [Cliquez ici pour accéder à votre profil](https://believemy.com/account)',
                        footer: {
                            text: `BeBot @${date.getFullYear()} | believemy.com`,
                            icon_url: interaction.user.displayAvatarURL({
                                dynamic: true,
                            }),
                        },
                    };
                    await interaction.reply({
                        embeds: [addPseudo],
                        ephemeral: true,
                    });
                    await setTimeout(15000);
                    return await interaction.deleteReply();
                } else {
                    if (!data.HAS_A_VISA) {
                        const studentRefused = {
                            title: '⛔ Accès refusé',
                            color: 0xed4245,
                            description:
                                "Vous n'avez pas de Visa. Vous pouvez en demander un sur Believemy. \n\n [En savoir plus](https://believemy.com/pricing)",
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
                        await member.roles.add(visaRoleId);
                        const userAuthorized = {
                            title: '✅ Accès autorisé',
                            color: 0x57f287,
                            description:
                                'Bienvenue ! Votre Visa a été vérifié ! Allez vite voir les salons qui vous sont réservés.',
                            footer: {
                                text: `BeBot @${date.getFullYear()} | believemy.com`,
                                icon_url: interaction.user.displayAvatarURL({
                                    dynamic: true,
                                }),
                            },
                        };
                        // NE PAS RETIRER CE CODE
                        // const welcome = {
                        //     title: "🔥 Bienvenue dans le Programme Rocket !",
                        //     description: `Bienvenue ${member.toString()} ! Te voici maintenant sur l'espace réservé aux étudiants, dis-nous en plus sur toi !`,
                        //     footer: {
                        //         text: `BeBot @${date.getFullYear()} | believemy.com`,
                        //         icon_url: interaction.user.displayAvatarURL({
                        //             dynamic: true,
                        //         }),
                        //     },
                        // };
                        // await channelId.send({
                        //     embeds: [welcome],
                        // });
                        await interaction.reply({
                            embeds: [userAuthorized],
                            ephemeral: true,
                        });
                        await setTimeout(15000);
                        return await interaction.deleteReply();
                    }
                }
            } else {
                throw new Error('La requête au webhook a échoué !');
            }
        } catch (error) {
            embedError(interaction, 'Une erreur est survenue', error.message);
        }
    },
};
