import client from 'nekos.life';

const neko = new client();
export default {
    cooldown: 5,
    data: {
        name: 'kiss',
        description: "Permet d'embrasser un utilisateur",
        options: [
            {
                name: 'membre',
                description: 'A qui voulez-vous faire un bisous ?',
                type: 6,
            },
        ],
    },

    async execute(interaction) {
        const user = interaction.options.getUser('membre');
        const { url } = await neko.kiss();
        try {
            if (!user) {
                await interaction.deferReply();
                const hugMe = {
                    color: 0xa96075,
                    title: `${interaction.client.user.username} embrasse ${interaction.user.username}`,
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
                title: `${interaction.user.username} embrasse ${user.username}`,
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
