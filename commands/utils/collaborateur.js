import axios from "axios";

export default {
    data: {
        name: "collaborateur",
        description: "Découvrez les collaborateurs de BeBot",
        cooldown: 10,
    },

    async execute(interaction) {
        let collabList;
        collabList = axios
            .get(
                "https://api.github.com/repos/Milrer/bot-believemy/contributors",
            )
            .then(async (r) => {
                collabList = r.data;
                collabList.forEach((u) => {});
                collabList.map((u) => `\n${u.login}`);
                const date = new Date();
                const github = {
                    title: "`🔗` Les collaborateurs",
                    color: 0x613bdb,
                    url: "https://github.com/Milrer/bot-believemy",
                    description: `**C'est grâce à eux que BeBot existe aujourd'hui** :\n${collabList
                        .map((u) => `\n> ${u.login}`)
                        .join(
                            "",
                        )}\n\nSi toi aussi tu veux contribuer, viens sur le github en faisait la commande \`/github\` `,
                    footer: {
                        text: `BeBot @${date.getFullYear()} | believemy.com`,
                        icon_url: interaction.user.displayAvatarURL({
                            dynamic: true,
                        }),
                    },
                };
                await interaction.reply({
                    embeds: [github],
                });
            });
    },
};
