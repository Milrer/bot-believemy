import {
    ChannelType,
    OverwriteType,
    PermissionFlagsBits,
} from 'discord.js';
import * as dotenv from 'dotenv';
import { journaliser } from './logChannel.js';

dotenv.config();

/**
 * Un salon privé par apprenant, que seuls lui et Louis-Nicolas voient.
 *
 * POURQUOI UN SALON ET PAS LES MESSAGES PRIVÉS. Un bot ne lit jamais les
 * messages privés entre deux membres, et lire ceux du compte de
 * Louis-Nicolas demanderait un self-bot, interdit par Discord. Un salon du
 * serveur, lui, passe par le suivi comme les autres : chaque message descend
 * dans le dossier de l'apprenant, dans les deux sens.
 *
 * LE SUJET DU SALON PORTE L'IDENTIFIANT DE L'APPRENANT. C'est lui qui dit à
 * qui appartient la conversation, même quand c'est Louis-Nicolas qui écrit,
 * et qui empêche d'ouvrir deux salons pour la même personne. Le nom du salon,
 * lui, n'est qu'une étiquette : on peut le renommer sans rien casser.
 */

const MARQUEUR = 'Suivi individuel';
const NOM_CATEGORIE = 'Suivi individuel';

/** Identifiant Discord de l'apprenant à qui appartient ce salon, ou null. */
export const proprietaireDuSalon = (channel) => {
    const sujet = channel?.topic || '';
    const trouve = sujet.match(new RegExp(`${MARQUEUR} · (\\d+)`));
    return trouve ? trouve[1] : null;
};

/** Le compte de Louis-Nicolas : DISCORD_MENTOR_ID, sinon le premier admin du bot. */
export const identifiantMentor = () =>
    (
        process.env.DISCORD_MENTOR_ID ||
        (process.env.BEBOT_ADMIN_ID || '').split(',')[0] ||
        ''
    ).trim();

const etiquette = (nom) =>
    (nom || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'apprenant';

/**
 * Le mot posté à l'ouverture du salon. Il dit à l'apprenant que ce qu'il
 * écrit ici rejoint son dossier : il doit le savoir avant d'écrire.
 */
export const invitation = (member) =>
    [
        `Hello ${member.toString()} 👋`,
        '',
        "Ce salon, c'est ton espace de suivi avec Louis-Nicolas. Vous êtes les deux seuls à le voir.",
        '',
        "Pour tout ce qui touche à ta formation, écris ici plutôt qu'en message privé : rien ne se perd, et vos échanges rejoignent ton dossier de formation, comme vos e-mails.",
    ].join('\n');

const lecture = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.EmbedLinks,
];

const categorie = async (guild) => {
    const configuree = (process.env.DISCORD_FOLLOW_UP_CATEGORY || '').trim();
    if (configuree) {
        const trouvee = guild.channels.cache.get(configuree);
        if (trouvee) {
            return trouvee;
        }
    }

    const existante = guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildCategory && c.name === NOM_CATEGORIE
    );
    if (existante) {
        return existante;
    }

    return guild.channels.create({
        name: NOM_CATEGORIE,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                type: OverwriteType.Role,
                deny: [PermissionFlagsBits.ViewChannel],
            },
        ],
    });
};

/** Le salon de suivi déjà ouvert pour ce membre, ou null. */
export const salonDe = async (guild, memberId) => {
    await guild.channels.fetch();
    return (
        guild.channels.cache.find((c) => proprietaireDuSalon(c) === memberId) ||
        null
    );
};

/**
 * Ouvre le salon de suivi d'un apprenant, ou rend celui qui existe déjà.
 * Sans effet sur un salon existant : on peut l'appeler autant de fois qu'on
 * veut.
 */
export const ouvrirSalonSuivi = async (
    member,
    { inviter = true, prenom = '', nom = '' } = {}
) => {
    const guild = member.guild;
    const existant = await salonDe(guild, member.id);
    if (existant) {
        return { salon: existant, cree: false };
    }

    const parent = await categorie(guild);
    const mentor = identifiantMentor();

    const autorisations = [
        {
            id: guild.roles.everyone.id,
            type: OverwriteType.Role,
            deny: [PermissionFlagsBits.ViewChannel],
        },
        { id: member.id, type: OverwriteType.Member, allow: lecture },
        {
            id: guild.client.user.id,
            type: OverwriteType.Member,
            allow: [...lecture, PermissionFlagsBits.ManageChannels],
        },
    ];
    if (mentor && mentor !== member.id) {
        autorisations.push({
            id: mentor,
            type: OverwriteType.Member,
            allow: lecture,
        });
    }

    // Le salon porte le prénom Believemy de l'apprenant quand on le connaît :
    // le pseudo Discord (« Ghost », « Azkers ») ne dit pas de qui il s'agit.
    // Deux apprenants peuvent porter le même prénom : si le nom est déjà pris
    // dans la catégorie, on y accole le nom de famille, puis le pseudo
    // Discord, qui lui est unique. Le rattachement au dossier ne dépend jamais
    // du nom du salon, seulement de son sujet.
    const libre = (candidat) =>
        !guild.channels.cache.some(
            (c) => c.parentId === parent?.id && c.name === candidat
        );
    const base = `suivi-${etiquette(prenom || member.displayName)}`;
    const candidats = [
        base,
        nom ? `${base}-${etiquette(nom)}` : null,
        `${base}-${etiquette(member.user.username)}`,
    ].filter(Boolean);
    const nomDuSalon = candidats.find(libre) || candidats[candidats.length - 1];

    const salon = await guild.channels.create({
        name: nomDuSalon,
        type: ChannelType.GuildText,
        parent: parent?.id,
        topic: `${MARQUEUR} · ${member.id}`,
        permissionOverwrites: autorisations,
    });

    if (inviter) {
        await salon.send(invitation(member));
    }

    await journaliser(
        guild.client,
        `🧭 Salon de suivi ouvert pour ${member.user.username} : ${salon.toString()}`
    );

    return { salon, cree: true };
};
