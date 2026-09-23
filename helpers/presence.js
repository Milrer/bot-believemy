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
 * Trois règles tiennent cette liste, et il faut les relire avant d'ajouter une
 * ligne :
 *
 * 1. On parle à un solopreneur, pas à un développeur. Ce qui le concerne :
 *    ses clients, son temps, son argent, son projet, ses décisions. Une blague
 *    sur git ou npm exclut d'emblée tous ceux qui font du no-code.
 * 2. BeBot ne s'invente jamais de vécu. Pas de « je code encore », pas de
 *    « mon bug », pas de « mon café » : il conseille, il encourage, il
 *    constate, mais il ne raconte pas une vie qu'il n'a pas.
 * 3. Il tutoie, parce que c'est lui qui parle et que son avatar est à l'écran.
 *
 * Un message par jour est choisi dans la liste du créneau courant : le texte
 * change selon l'heure ET tourne chaque jour.
 * (Limite Discord : 128 caractères par statut.)
 */
const MESSAGES = {
    // 00h - 06h
    nuit: [
        '🌙 Les projets qui comptent se construisent souvent la nuit',
        '✨ Pendant que le monde dort, toi tu avances',
        '🦉 Encore debout ? Ton projet a de la chance',
        '💡 Une idée à 3h du matin, ça se note, ça ne se retient pas',
        '🌌 Le silence de la nuit vaut tous les outils de concentration',
        '🔋 Encore un peu, puis va dormir pour de vrai',
        '🌃 Personne ne voit le travail de cette heure. Tes clients, si',
        '⏰ Demain tu seras content de ce que tu fais maintenant',
        '🛏️ Une dernière vraie tâche, et au lit',
        '🌠 Les grandes choses commencent toujours petit',
        '💾 Sauvegarde avant de fermer les yeux',
        '🕯️ Construire son activité, ça se fait aussi à ces heures-là',
        '🚀 Ce que tu bâtis cette nuit existera encore demain',
        '😴 Le repos fait partie du travail, sincèrement',
        '🌜 Tu avances. Doucement, mais tu avances',
    ],
    // 06h - 12h
    matin: [
        '☕ Un café, puis la tâche qui compte vraiment',
        '🌅 La première heure de la journée décide du reste',
        '🎯 Une seule priorité aujourd\'hui, mais la bonne',
        '🚀 Ce que tu commences ce matin, tu le finiras',
        '📋 Note tes trois tâches avant d\'ouvrir quoi que ce soit',
        '💪 Trente minutes le matin valent deux heures le soir',
        '☀️ Ton projet t\'attend, il n\'a pas bougé',
        '🧩 Une petite avancée par jour construit une activité',
        '📈 Aujourd\'hui est un bon jour pour apprendre',
        '🔔 Commence par ce qui te fait peur, le reste ira tout seul',
        '🌤️ Pas besoin d\'être prêt, juste de commencer',
        '🛠️ Code, no-code, low-code : ce qui compte, c\'est que ça avance',
        '📬 Un message à un client vaut mieux qu\'une heure de perfection',
        '🎬 L\'action d\'abord, la motivation vient après',
        '🥐 Le meilleur moment pour s\'y remettre, c\'est maintenant',
    ],
    // 12h - 18h
    apresMidi: [
        '🔥 En plein dans le flow, on ne dérange pas',
        '🎯 Un pas de plus vers tes objectifs',
        '🧠 Le creux de 15h est normal, ça repart toujours',
        '📈 Chaque difficulté franchie te rend plus solide',
        '🤝 Tu as relancé ce client, aujourd\'hui ?',
        '⏳ Deux heures concentrées battent huit heures dispersées',
        '🚧 Bloqué ? Explique ton problème à voix haute, souvent ça suffit',
        '💬 Une question posée maintenant fait gagner une journée',
        '🧹 Fais la tâche que tu repousses depuis lundi',
        '🎒 Apprendre, c\'est accepter d\'être mauvais un moment',
        '💼 Ton futur toi vit de ce que tu construis aujourd\'hui',
        '🪜 Une marche à la fois, mais tous les jours',
        '🌱 Ce qui pousse lentement tient plus longtemps',
        '📚 Comprendre vaut mieux que copier',
        '✅ Termine une chose avant d\'en commencer trois',
    ],
    // 18h - 00h
    soir: [
        '🌆 Trente minutes ce soir, c\'est déjà une victoire',
        '✨ Les meilleures idées arrivent quand on ralentit',
        '🏗️ Ton projet mérite un bout de ta soirée',
        '🌙 Finis la journée sur quelque chose de terminé',
        '📝 Note ce que tu feras demain, tu dormiras mieux',
        '🍕 Une pizza et une tâche de plus, marché conclu',
        '🎯 Ce que tu fais le soir, personne ne te l\'a demandé',
        '🛋️ Se reposer aussi fait avancer ton projet',
        '💡 Le soir on réfléchit mieux qu\'on exécute',
        '🌇 Regarde ce que tu as fait aujourd\'hui, c\'est plus que tu ne crois',
        '🔒 Ferme ton ordinateur quand c\'est fini. Vraiment fini',
        '🧭 Décide ce soir par quoi tu commences demain',
        '🚀 Les projets du soir deviennent parfois des entreprises',
        '🌟 Personne ne construit son activité en une journée',
        '😌 Tu as le droit d\'être fier d\'une petite avancée',
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
