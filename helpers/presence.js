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
 * L'effet recherché tient en une phrase : celui qui lit doit se dire « ah
 * ouais, il a même pensé à ça ». Donc des micro-rappels concrets de la vie
 * d'un solopreneur, le genre qu'on oublie tous, jamais des phrases de
 * développement personnel. « Quelqu'un te doit de l'argent ? » vaut mille
 * fois « une marche à la fois ».
 *
 * Les règles, à relire avant d'ajouter une ligne :
 *   - 40 caractères maximum, sans emoji : un statut se lit d'un coup d'oeil ;
 *   - BeBot ne s'invente jamais de vécu, il rappelle, il ne raconte pas ;
 *   - on parle à quelqu'un qui construit son activité, pas à un développeur ;
 *   - il tutoie, parce que c'est lui qui parle et que son avatar est visible.
 *
 * Un message par jour est choisi dans la liste du créneau courant.
 */
const MESSAGES = {
    // 00h - 06h
    nuit: [
        'Sauvegarde avant de fermer',
        'Il est tard. Vraiment tard',
        'Note ton idée, tu vas l\'oublier',
        'Un dernier truc, puis au lit',
        'Demain sera plus simple reposé',
        'Mets un réveil, au cas où',
    ],
    // 06h - 12h
    matin: [
        'Commence par le plus embêtant',
        'Trois tâches. Pas dix',
        'Le mail que tu évites depuis mardi',
        'Quelqu\'un te doit de l\'argent ?',
        'Bois de l\'eau avant le café',
        'Ferme les onglets d\'hier',
    ],
    // 12h - 18h
    apresMidi: [
        'Lève-toi cinq minutes',
        'Relance ton devis en attente',
        'Finis avant de commencer autre chose',
        'Explique ton problème à voix haute',
        'Demande de l\'aide. C\'est gratuit',
        'Ton écran est trop près',
    ],
    // 18h - 00h
    soir: [
        'Trente minutes. Pas plus',
        'Ton nom de domaine expire quand ?',
        'Note demain, puis coupe',
        'Une chose finie, c\'est déjà ça',
        'Coupe vraiment. Pas juste l\'écran',
        'Sauvegarde ton travail du jour',
    ],
};/**
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
