export default {
    cooldown: 10,
    data: {
        name: 'twitch',
        description: 'Reçois les informations de la chaine',
    },

    async execute(interaction) {
        try {
            const response = await fetch(
                `https://api.twitch.tv/helix/users?login=${process.env.PSEUDO_TWITCH}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${process.env.TOKEN_TWITCH}`,
                        'Client-Id': process.env.CLIENT_ID_TWITCH,
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                const embedTwitchUser = {
                    color: 0xa96075,
                    author: {
                        name: `${data.data[0].display_name}`,
                        icon_url: `${data.data[0].profile_image_url}`,
                        url: `https://www.twitch.tv/${data.data[0].display_name}`,
                    },
                    description: data.data[0].description,
                    thumbnail: {
                        url: `${data.data[0].profile_image_url}`,
                    },
                    timestamp: new Date().toISOString(),
                };
                return await interaction.reply({
                    embeds: [embedTwitchUser],
                });
            }

            return null;
        } catch (error) {
            console.log(error);
        }
    },
};
