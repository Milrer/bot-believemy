import axios from 'axios';
import cron from 'node-cron';
import dayjs from 'dayjs';
import frLocale from 'dayjs/locale/fr.js';
dayjs.locale(frLocale);

function sendBirthday(channel, embed) {
    if (!channel) {
        return;
    }
    try {
        channel.send({ embeds: [embed] });
    } catch (error) {
        console.log(`Erreur lors de l'envoi du message: ${error.message}`);
    }
}

export function birthday(client) {
    cron.schedule('*/30 * * * * *', async () => {
        const fondation = client.channels.cache.get(process.env.FONDATION);
        const steveJobs = client.channels.cache.get(process.env.STEVE_JOBS);
        const margaretHalmiton = client.channels.cache.get(
            process.env.MARGARET_HALMITON
        );
        const toruIwatani = client.channels.cache.get(process.env.TORU_IWATANI);
        const date = dayjs().format('dddd D MMMM YYYY');

        try {
            const birthday = await axios.post(
                'https://believemy.com/api/webhooks/birthdays',
                {
                    token: process.env.TOKEN_BELIEVEMY,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            if (!birthday.data) {
                return;
            }
            const {
                fondation: fondationData,
                steve_jobs: steveJobsData,
                margaret_hamilton: margaretHamiltonData,
                toru_iwatani: toruIwataniData,
            } = birthday.data;

            if (fondationData && fondationData.length > 0) {
                for (const fondationEntry of fondationData) {
                    console.log(fondationEntry);
                }
            }

            if (steveJobsData && steveJobsData.length > 0) {
                let fieldsSteveJobs = [];
                const randomPhrases = [
                    'Bonne anniversaire à vous les Steves Jobs',
                    'Contruisez une tesla',
                ];
                const random =
                    randomPhrases[
                        Math.floor(Math.random() * randomPhrases.length)
                    ];
                for (const dataSteveJobs of steveJobsData) {
                    const fieldFirstname = {
                        name: 'Prénom',
                        value: dataSteveJobs.firstName,
                    };
                    const fieldAge = {
                        name: 'Age',
                        value: dataSteveJobs.age,
                    };
                    const fielPseudoDiscord = {
                        name: 'Pseudo discord',
                        value: dataSteveJobs.discordPseudo,
                    };
                    fieldsSteveJobs.push(
                        fieldFirstname,
                        fieldAge,
                        fielPseudoDiscord
                    );
                }
                const embedSteveJobs = {
                    title: 'Fondation steve_jobs',
                    color: 0x613bdb,
                    description: random,
                    author: {
                        name: `${client.user.username}`,
                        icon_url:
                            'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
                        url: 'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
                    },
                    fields: fieldsSteveJobs,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `BeBot vous souhaite un joyeux anniversaire`,
                        icon_url: client.user.displayAvatarURL(),
                    },
                };
                sendBirthday(steveJobs, embedSteveJobs);
            }
            if (margaretHamiltonData && margaretHamiltonData.length > 0) {
                let fieldsmargaretHamilton = [];
                const randomPhrasesMargaret = [
                    'Bonne anniversaire à vous les Steves Jobs',
                    'Contruisez une tesla',
                ];
                const randomMargaret =
                    randomPhrasesMargaret[
                        Math.floor(Math.random() * randomPhrases.length)
                    ];
                for (const dataMargaretHamilton of steveJobsData) {
                    const fieldFirstname = {
                        name: 'Prénom',
                        value: dataMargaretHamilton.firstName,
                    };
                    const fieldAge = {
                        name: 'Age',
                        value: dataMargaretHamilton.age,
                    };
                    const fielPseudoDiscord = {
                        name: 'Pseudo discord',
                        value: dataMargaretHamilton.discordPseudo,
                    };
                    fieldsmargaretHamilton.push(
                        fieldFirstname,
                        fieldAge,
                        fielPseudoDiscord
                    );
                }
                const embedMargaretHamilton = {
                    title: 'Fondation margaret_hamilton',
                    color: 0x613bdb,
                    description: randomMargaret,
                    author: {
                        name: `${client.user.username}`,
                        icon_url:
                            'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
                        url: 'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
                    },
                    fields: fieldsmargaretHamilton,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `BeBot vous souhaite un joyeux anniversaire`,
                        icon_url: client.user.displayAvatarURL(),
                    },
                };
                sendBirthday(margaretHalmiton, embedMargaretHamilton);
            }
            if (toruIwataniData && toruIwataniData.length > 0) {
                let fieldsToruIwatani = [];
                const randomPhrasesToru = [
                    'Bonne anniversaire à vous les Steves Jobs',
                    'Contruisez une tesla',
                ];
                const randomToru =
                    randomPhrasesToru[
                        Math.floor(Math.random() * randomPhrases.length)
                    ];
                for (const dataToruIwatani of steveJobsData) {
                    const fieldFirstname = {
                        name: 'Prénom',
                        value: dataToruIwatani.firstName,
                    };
                    const fieldAge = {
                        name: 'Age',
                        value: dataToruIwatani.age,
                    };
                    const fielPseudoDiscord = {
                        name: 'Pseudo discord',
                        value: dataToruIwatani.discordPseudo,
                    };
                    fieldsToruIwatani.push(
                        fieldFirstname,
                        fieldAge,
                        fielPseudoDiscord
                    );
                }
                const embedToruIwatani = {
                    title: 'Fondation toru_iwatani',
                    color: 0x613bdb,
                    description: randomToru,
                    author: {
                        name: `${client.user.username}`,
                        icon_url:
                            'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
                        url: 'https://osakalehusky.com/pictures/bebot/bebot-profile.png',
                    },
                    fields: fieldsToruIwatani,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `BeBot vous souhaite un joyeux anniversaire`,
                        icon_url: client.user.displayAvatarURL(),
                    },
                };
                sendBirthday(toruIwatani, embedToruIwatani);
            }
        } catch (error) {
            console.error(
                `Erreur lors de la récupération des données : ${error.message}`
            );
        }
    });
}
