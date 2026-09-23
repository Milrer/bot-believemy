import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { ActivityType, Events } from 'discord.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const PARIS_TZ = 'Europe/Paris';

/**
 * Messages affichés en statut, regroupés par créneau horaire (heure de Paris).
 *
 * Un seul registre : la micro-action immédiate, gratuite, qui sort de l'écran.
 * « Lève-toi 5 minutes », « Contacte un de tes utilisateurs », « Explique ton
 * problème à voix haute ». Quelque chose qu'on peut faire dans les trente
 * secondes et qu'on ne fait jamais.
 *
 * Ce qui n'a rien à faire ici : les conseils de productivité (« trois tâches,
 * pas dix »), les rappels administratifs (« relance ton devis ») et tout ce qui
 * ressemble à du développement personnel. C'est bateau, personne ne le lit.
 *
 * Les règles, à relire avant d'ajouter une ligne :
 *   - 40 caractères maximum, sans emoji : un statut se lit d'un coup d'oeil ;
 *   - une action, pas une pensée ;
 *   - BeBot ne s'invente pas de vécu et ne prétend pas voir ce qui se passe ;
 *   - il tutoie, parce que c'est lui qui parle et que son avatar est visible.
 *
 * Un message par jour est choisi dans la liste du créneau courant.
 */
const MESSAGES = {
    // 00h - 06h
    nuit: [
        'Va dormir. Ça attendra demain',
        'Note ton idée, puis dors',
        "Bois un verre d'eau",
        "Éteins l'écran cinq minutes",
        'Étire tes épaules',
        'Regarde au loin vingt secondes',
    ],
    // 06h - 12h
    matin: [
        "Bois un verre d'eau",
        'Contacte un de tes utilisateurs',
        "Sors prendre l'air cinq minutes",
        "Appelle plutôt que d'écrire",
        'Demande un avis avant de finir',
        'Écris ce qui te bloque en une phrase',
    ],
    // 12h - 18h
    apresMidi: [
        'Lève-toi 5 minutes',
        'Explique ton problème à voix haute',
        "Demande de l'aide, c'est gratuit",
        'Change de pièce cinq minutes',
        "Montre ton travail à quelqu'un",
        'Regarde au loin vingt secondes',
    ],
    // 18h - 00h
    soir: [
        'Sors marcher dix minutes',
        'Mange un vrai truc',
        "Dis merci à quelqu'un",
        "Relis à voix haute avant d'envoyer",
        'Ferme tout sauf un onglet',
        'Respire un coup',
    ],
};

/**
 * Retourne la clé du créneau correspondant à une heure (0-23).
 */
function creneauActuel(heure) {
    if (heure < 6) return 'nuit';
    if (heure < 12) return 'matin';
    if (heure < 18) return 'apresMidi';
    return 'soir';
}

/**
 * Calcule le statut à afficher : créneau selon l'heure de Paris, puis rotation
 * quotidienne (l'index avance d'un cran chaque jour) à l'intérieur du créneau.
 */
function messageDuMoment() {
    const now = dayjs().tz(PARIS_TZ);
    const liste = MESSAGES[creneauActuel(now.hour())];
    const jourDeLAnnee = now.diff(now.startOf('year'), 'day');
    return liste[jourDeLAnnee % liste.length];
}

/**
 * Applique le statut du moment sur le bot.
 */
function mettreAJour(client) {
    const texte = messageDuMoment();
    client.user.setActivity({
        name: texte,
        state: texte,
        type: ActivityType.Custom,
    });
    console.log(`[Presence] Statut mis à jour : ${texte}`);
}

/**
 * Active la rotation du statut : une première fois au démarrage du bot, puis à
 * chaque heure pile pour suivre les créneaux de la journée.
 */
export function presence(client) {
    client.once(Events.ClientReady, () => mettreAJour(client));
    cron.schedule('0 * * * *', () => mettreAJour(client));
    console.log(
        '[Presence] Rotation du statut activée (créneau horaire + rotation quotidienne).'
    );
}
