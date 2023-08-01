import client from 'nekos.life';

const neko = new client();
export default {
    cooldown: 5,
    data: {
        name: 'slap',
        description: 'Permet de mettre une claque à un utilisateur',
        options: [
            {
                name: 'membre',
                description: 'A qui voulez-vous donner une claque ?',
                type: 6,
            },
        ],
    },

    async execute(interaction) {
        const user = interaction.options.getUser('membre');
        const { url } = await neko.slap();
        try {
            if (!user) {
                await interaction.deferReply();
                const slapMe = {
                    color: 0xa96075,
                    title: `${interaction.client.user.username} te met une claque ${interaction.user.username}`,
                    image: {
                        url,
                    },
                    timestamp: new Date().toISOString(),
                };

                await interaction.deleteReply();

                return await interaction.channel.send({
                    content: `${interaction.user}`,
                    embeds: [slapMe],
                });
            }
            await interaction.deferReply();
            const slapMembre = {
                color: 0xa96075,
                title: `${interaction.user.username} te met une claque ${user.username}`,
                image: {
                    url,
                },
                timestamp: new Date().toISOString(),
            };
            await interaction.deleteReply();
            return await interaction.channel.send({
                content: `${user}`,
                embeds: [slapMembre],
            });
        } catch (error) {
            console.log(error);
        }
    },
};
