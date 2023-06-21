import { setTimeout } from "timers/promises";
import * as dotenv from "dotenv";
dotenv.config();
export default {
    cooldown: 60,
    data: {
        name: "verify",
        description:
            "Permet de vérifier si vous êtes étudiant d'un de nos programmes pour vous octroyer l'accès à des salons supplémentaires.",
    },

    async execute(interaction) {
        try {
            const member = interaction.member;
            const date = new Date();
            const studentRoleId = process.env.STUDENT_ROLE_ID;
            const channelId = interaction.guild.channels.cache.get(
                process.env.CHANNEL_SEND_ID,
            );

            const rocket = await fetch(
                "https://believemy.com/api/webhooks/check-student",
                {
                    method: "post",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        pseudo: interaction.user.username,
                        token: process.env.TOKEN_BELIEVEMY,
                    }),
                },
            );

            if (member.roles.cache.has(studentRoleId)) {
                const studentValited = {
                    title: "🔥 Vous êtes déjà vérifié",
                    color: 0x57f287,
                    description:
                        "Vous êtes déjà vérifié. Vous pouvez déjà profiter des salons réservés à nos étudiants.",
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

            if (rocket.ok) {
                const data = await rocket.json();
                if (!data.IS_A_ROCKET_STUDENT) {
                    const studentRefused = {
                        title: "⛔ Accès refusé",
                        color: 0xed4245,
                        description:
                            "Vous n'êtes pas étudiant de nos programmes.",
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
                        title: "✅ Accès autorisé",
                        color: 0x57f287,
                        description:
                            "Bienvenue ! Vous voici vérifié ! Allez vite voir les salons qui vous sont réservés.",
                        footer: {
                            text: `BeBot @${date.getFullYear()} | believemy.com`,
                            icon_url: interaction.user.displayAvatarURL({
                                dynamic: true,
                            }),
                        },
                    };
                    const welcome = {
                        title: "🔥 Bienvenue dans le Programme Rocket !",
                        description: `Bienvenue ${member.toString()} ! Te voici maintenant sur l'espace réservé aux étudiants, dis-nous en plus sur toi !`,
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
                throw new Error("La requête au webhook a échoué !");
            }
        } catch (error) {
            console.log(error);
        }
    },
};
