export default {
    cooldown: 10,
    data: {
        name: 'github',
        description: 'Github de bebot',
    },
    async execute(interaction) {
        await interaction.reply({
            content: `\`🔑\` Voici le github du bot : https://github.com/Milrer/bot-believemy`,
        });
    },
};
