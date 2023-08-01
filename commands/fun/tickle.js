import client from 'nekos.life';

const neko = new client();
export default {
    cooldown: 5,
    data: {
        name: 'tickle',
        description: 'Permet de faire des chatouilles à un utilisateur',
        options: [
            {
                name: 'membre',
                description: 'A qui voulez-vous faire des chatouilles ?',
                type: 6,
            },
        ],
    },

    async execute(interaction) {
        const user = interaction.options.getUser('membre');
        const { url } = await neko.tickle();
        try {
            if (!user) {
                await interaction.deferReply();
                const hugMe = {
                    color: 0xa96075,
                    title: `${interaction.client.user.username} fait des chatouilles à ${interaction.user.username}`,
                    image: {
                        url,
                    },
                    timestamp: new Date().toISOString(),
                };

                await interaction.deleteReply();

                return await interaction.channel.send({
                    content: `${interaction.user}`,
                    embeds: [hugMe],
                });
            }
            await interaction.deferReply();
            const hugMembre = {
                color: 0xa96075,
                title: `${interaction.user.username} fait des chatouilles à ${user.username}`,
                image: {
                    url,
                },
                timestamp: new Date().toISOString(),
            };
            await interaction.deleteReply();
            return await interaction.channel.send({
                content: `${user}`,
                embeds: [hugMembre],
            });
        } catch (error) {
            console.log(error);
        }
    },
};
