import cron from 'node-cron';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import frLocale from 'dayjs/locale/fr.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(frLocale);

const PARIS_TZ = 'Europe/Paris';

const WORKSHOP_COLOR = 0xe8511d;
const API_TIMEOUT = 30000;
const DEFAULT_CHANNEL_ID = process.env.GENERAL_ROCKET;
const DEFAULT_ROLE_ID = '752104575045206046';

/**
 * Formate une date en français avec le fuseau horaire de Paris (ex: "Samedi 15 février 2025")
 */
function formatDateFr(dateStr) {
    return dayjs(dateStr).tz(PARIS_TZ).format('dddd D MMMM YYYY');
}

/**
 * Formate une heure avec le fuseau horaire de Paris (ex: "16h00")
 */
function formatTime(dateStr) {
    return dayjs(dateStr).tz(PARIS_TZ).format('HH[h]mm');
}

/**
 * Formate la liste des speakers
 */
function formatSpeakers(speakers) {
    return speakers.map((s) => `${s.firstName} ${s.lastName}`).join(', ');
}

/**
 * Retourne le label "Intervenant" ou "Intervenants" selon le nombre
 */
function getSpeakerLabel(speakers) {
    return speakers.length === 1 ? 'Intervenant' : 'Intervenants';
}

/**
 * Tronque une description à un nombre max de caractères
 */
function truncateDescription(description, maxLength = 200) {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength - 3) + '...';
}

/**
 * Récupère le channel ID et le role ID pour un atelier
 */
function getWorkshopChannelAndRole(workshop) {
    const channelId =
        workshop.accelerator?.discordChannelId || DEFAULT_CHANNEL_ID;
    const roleId = workshop.accelerator?.discordRoleId || DEFAULT_ROLE_ID;
    return { channelId, roleId };
}

/**
 * Crée un embed pour une annonce d'atelier
 */
function createAnnouncementEmbed(workshop, client) {
    const embed = {
        color: WORKSHOP_COLOR,
        title: `Nouvel atelier : ${workshop.title}`,
        description: truncateDescription(workshop.description),
        fields: [
            {
                name: 'Date',
                value: formatDateFr(workshop.startDate),
                inline: true,
            },
            {
                name: 'Horaire (heure de Paris)',
                value: `${formatTime(workshop.startDate)} - ${formatTime(
                    workshop.endDate
                )}`,
                inline: true,
            },
            {
                name: 'Plateforme',
                value: workshop.meetingPlatform || 'En ligne',
                inline: true,
            },
            {
                name: `${getSpeakerLabel(workshop.speakers)}`,
                value: formatSpeakers(workshop.speakers),
                inline: false,
            },
        ],
        footer: {
            text: `Believemy${
                workshop.accelerator?.name
                    ? ` • ${workshop.accelerator.name}`
                    : ''
            }`,
            icon_url: client.user.displayAvatarURL(),
        },
        timestamp: new Date().toISOString(),
    };

    const button = new ButtonBuilder()
        .setLabel("Rejoindre l'atelier")
        .setURL(workshop.meetingUrl)
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(button);

    return { embed, row };
}

/**
 * Crée un embed pour un rappel d'atelier
 */
function createReminderEmbed(workshop, client) {
    const embed = {
        color: WORKSHOP_COLOR,
        title: "Rappel : votre atelier commence aujourd'hui !",
        description: `**${workshop.title}** commence à ${formatTime(
            workshop.startDate
        )} (heure de Paris) !`,
        fields: [
            {
                name: 'Horaire (heure de Paris)',
                value: formatTime(workshop.startDate),
                inline: true,
            },
            {
                name: 'Plateforme',
                value: workshop.meetingPlatform || 'En ligne',
                inline: true,
            },
            {
                name: `${getSpeakerLabel(workshop.speakers)}`,
                value: formatSpeakers(workshop.speakers),
                inline: false,
            },
        ],
        footer: {
            text: `Believemy${
                workshop.accelerator?.name
                    ? ` • ${workshop.accelerator.name}`
                    : ''
            }`,
            icon_url: client.user.displayAvatarURL(),
        },
        timestamp: new Date().toISOString(),
    };

    const button = new ButtonBuilder()
        .setLabel('Rejoindre maintenant')
        .setURL(workshop.meetingUrl)
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(button);

    return { embed, row };
}

/**
 * Crée un embed pour un replay disponible
 */
function createReplayEmbed(workshop, client) {
    const embed = {
        color: WORKSHOP_COLOR,
        title: `Replay disponible : ${workshop.title}`,
        description: "Le replay de l'atelier est maintenant disponible !",
        fields: [
            {
                name: `${getSpeakerLabel(workshop.speakers)}`,
                value: formatSpeakers(workshop.speakers),
                inline: false,
            },
        ],
        footer: {
            text: `Believemy${
                workshop.accelerator?.name
                    ? ` • ${workshop.accelerator.name}`
                    : ''
            }`,
            icon_url: client.user.displayAvatarURL(),
        },
        timestamp: new Date().toISOString(),
    };

    const replayUrl = `https://believemy.com/workshops/${workshop.slug}/play`;
    const button = new ButtonBuilder()
        .setLabel('Voir le replay')
        .setURL(replayUrl)
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(button);

    return { embed, row };
}

/**
 * Envoie une notification pour un atelier dans le bon channel
 */
async function sendWorkshopNotification(client, workshop, createEmbedFn, type) {
    const { channelId, roleId } = getWorkshopChannelAndRole(workshop);
    const roleMention = `<@&${roleId}>`;

    const channel = await client.channels.fetch(channelId).catch((err) => {
        console.error(
            `[WorkshopNotifications] Erreur récupération du channel ${channelId}: ${err.message}`
        );
        return null;
    });

    if (!channel) {
        console.error(
            `[WorkshopNotifications] Channel ${channelId} introuvable pour l'atelier ${workshop.id}`
        );
        return null;
    }

    const { embed, row } = createEmbedFn(workshop, client);

    // Construire le contenu avec mention + image (si disponible)
    const content = workshop.thumbnail
        ? `${roleMention}\n${workshop.thumbnail}`
        : roleMention;

    await channel.send({
        content,
        embeds: [embed],
        components: [row],
    });

    return { type, workshopId: workshop.id };
}

/**
 * Envoie les notifications d'ateliers
 */
export async function sendWorkshopNotifications(client) {
    console.log(
        '[WorkshopNotifications] Démarrage de la vérification des notifications...'
    );

    // Appel API pour récupérer les notifications
    let notifications;
    try {
        const response = await axios.post(
            'https://believemy.com/api/discord/workshop-notifications',
            { token: process.env.TOKEN_BELIEVEMY },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: API_TIMEOUT,
            }
        );
        notifications = response.data;
    } catch (error) {
        console.error(
            `[WorkshopNotifications] Erreur appel API: ${error.message}`
        );
        return;
    }

    const {
        workshopsToAnnounce = [],
        workshopsToRemind = [],
        workshopsWithNewReplay = [],
    } = notifications;
    const sentNotifications = [];

    // Traitement des annonces
    for (const workshop of workshopsToAnnounce) {
        try {
            const result = await sendWorkshopNotification(
                client,
                workshop,
                createAnnouncementEmbed,
                'announcement'
            );
            if (result) {
                sentNotifications.push(result);
                console.log(
                    `[WorkshopNotifications] Annonce envoyée pour: ${workshop.title}`
                );
            }
        } catch (error) {
            console.error(
                `[WorkshopNotifications] Erreur envoi annonce ${workshop.id}: ${error.message}`
            );
        }
    }

    // Traitement des rappels
    for (const workshop of workshopsToRemind) {
        try {
            const result = await sendWorkshopNotification(
                client,
                workshop,
                createReminderEmbed,
                'reminder'
            );
            if (result) {
                sentNotifications.push(result);
                console.log(
                    `[WorkshopNotifications] Rappel envoyé pour: ${workshop.title}`
                );
            }
        } catch (error) {
            console.error(
                `[WorkshopNotifications] Erreur envoi rappel ${workshop.id}: ${error.message}`
            );
        }
    }

    // Traitement des replays
    for (const workshop of workshopsWithNewReplay) {
        try {
            const result = await sendWorkshopNotification(
                client,
                workshop,
                createReplayEmbed,
                'replay'
            );
            if (result) {
                sentNotifications.push(result);
                console.log(
                    `[WorkshopNotifications] Replay envoyé pour: ${workshop.title}`
                );
            }
        } catch (error) {
            console.error(
                `[WorkshopNotifications] Erreur envoi replay ${workshop.id}: ${error.message}`
            );
        }
    }

    // Marquer les notifications comme envoyées
    if (sentNotifications.length > 0) {
        try {
            await axios.post(
                'https://believemy.com/api/discord/workshop-notifications-sent',
                {
                    token: process.env.TOKEN_BELIEVEMY,
                    notifications: sentNotifications,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: API_TIMEOUT,
                }
            );
            console.log(
                `[WorkshopNotifications] ${sentNotifications.length} notification(s) marquée(s) comme envoyée(s).`
            );
        } catch (error) {
            console.error(
                `[WorkshopNotifications] Erreur marquage notifications: ${error.message}`
            );
        }
    } else {
        console.log('[WorkshopNotifications] Aucune notification à envoyer.');
    }
}

/**
 * Configure le cron pour les notifications d'ateliers (tous les jours à 7h UTC)
 */
export function workshopNotifications(client) {
    cron.schedule('0 7 * * *', () => {
        sendWorkshopNotifications(client);
    });
    console.log('[WorkshopNotifications] Cron programmé à 7h (7h UTC).');
}
