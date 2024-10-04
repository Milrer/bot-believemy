import { setTimeout } from 'timers/promises';
import dotenv from 'dotenv';
import axios from 'axios';
import { embedError } from '../../helpers/errorEmbed.js';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default {
    cooldown: 60,
    data: {
        name: 'verify',
        description:
            'Permet de vérifier si vous êtes un accéléré sur un de nos accélérateurs.',
    },

    async execute(interaction) {
        try {
            const member = interaction.member;
            const date = new Date();
            const studentRoleId = process.env.STUDENT_ROLE_ID;
            const openCampusRoleId = process.env.OPEN_CAMPUS_ROLE_ID;
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
                        'Vous avez déjà accès aux salons qui vous sont réservés.',
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
                            "Vous n'êtes pas sur notre accélérateur. Vérifiez votre pseudo.",
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
                    await member.roles.add(openCampusRoleId);
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
                    const completion = await openai.chat.completions.create({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content:
                                    'Tu es un bot Discord. Ton but est de servir avec bienvaillance tout le monde, tu es expert en informatique.',
                            },
                            {
                                role: 'user',
                                content: `Accueille ${member.toString()} qui vient de rejoindre l'accélérateur Rocket. Il a désormais accès aux salons qui lui sont réservés. Soit chaleureux bienveillant. Tu es un bot qui a pour mission de servir et d'aider les membres de la communauté. Tu es expert en informatique et tu es là pour les aider. Tu es BeBot.`,
                            },
                        ],
                    });
                    const welcome = {
                        title: "🔥 Bienvenue dans l'Accélérateur Rocket !",
                        description: completion.choices[0].message.content,
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
