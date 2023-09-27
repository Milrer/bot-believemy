export async function embedError({ interaction, title, description }) {
    const errorEmbed = {
        title,
        color: 0xed4245,
        description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `${interaction.client.user.username} à rencontré une erreur`,
            icon_url: `${interaction.client.user.displayAvatarURL()}`,
        },
    };

    await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
    });
}

export async function embedErrorChannel({ interaction, title, description }) {
    const errorEmbed = {
        title,
        color: 0xed4245,
        description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `${interaction.client.user.username} à rencontré une erreur`,
            icon_url: `${interaction.client.user.displayAvatarURL()}`,
        },
    };

    await interaction.channel.send({
        embeds: [errorEmbed],
    });
}
