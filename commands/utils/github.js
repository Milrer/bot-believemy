export default {
    data: {
        name: "github",
        description: "Github de BeBot",
    },
    async execute(interaction) {
        await interaction.reply({
            content: `\`🔑\` Voici le github du bot : https://github.com/Milrer/bot-believemy`,
        });
    },
};
