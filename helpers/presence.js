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
 * Chaque liste mélange 4 tons — humour, motivation, références dev et pop
 * culture — entrelacés pour que le style change aussi d'un jour à l'autre.
 * Un message par jour est sélectionné dans la liste du créneau courant : le
 * texte change donc selon l'heure ET tourne chaque jour pour éviter la
 * répétition. Pour personnaliser, il suffit d'éditer / ajouter des lignes.
 * (Limite Discord : 128 caractères par statut.)
 */
const MESSAGES = {
    // 00h - 06h
    nuit: [
        '🦉 Il est 3h et je code encore',
        '🌙 Les grands projets naissent la nuit',
        '🌀 while (awake) { code(); }',
        "🌌 Le côté obscur du code t'appelle",
        '☕ Le café ne fait plus effet, on continue',
        '✨ Pendant que le monde dort, toi tu construis',
        '💾 sudo dormir → permission denied',
        '💊 Toujours dans la matrice à cette heure ?',
        '🐛 Ce bug ne dormira pas non plus',
        '💪 Une ligne de plus avant de dormir',
        '⌨️ Ctrl + S avant le dodo',
        '🦇 BeBot veille sur Gotham',
        "😵 git commit -m 'je sais plus ce que je fais'",
        '🌃 Le calme de la nuit, le meilleur des IDE',
        "🔋 Mode économie d'énergie : refusé",
    ],
    // 06h - 12h
    matin: [
        '☕ Pas de café, pas de code',
        '🚀 Nouvelle journée, nouveaux commits',
        '⚙️ Booting developer.exe...',
        "🍄 Let's-a-go !",
        '😴 90% réveillé, 100% prêt à debug',
        "🌅 Aujourd'hui est un bon jour pour apprendre",
        '📦 npm install bonne-journee',
        '⚡ Debout là-dedans, jeune Padawan',
        '🥱 npm start... et moi aussi je démarre',
        '💪 Un petit pas de code chaque matin',
        '☀️ git pull origin motivation',
        '☕ Un café pour les gouverner tous',
        '🍞 Compilé avec amour et tartines',
        '🎯 Ta meilleure version commence maintenant',
        '🦸 Un grand café, une grande productivité',
    ],
    // 12h - 18h
    apresMidi: [
        '🍝 Code en cours de digestion',
        '🔥 En plein dans le flow',
        "🐤 J'explique mon bug au canard en plastique",
        '🟢 La commu code dans la matrice',
        "😅 'Ça marche sur ma machine' — moi, à l'instant",
        '🎯 Un pas de plus vers tes objectifs',
        "🔀 Résolution d'un merge conflict épique",
        '🦖 La vie trouve toujours un moyen... de bugger',
        '🤯 47 onglets Stack Overflow ouverts',
        '📈 Chaque bug résolu te rend plus fort',
        '🚢 git push origin prod (et on prie)',
        '🎮 Press F pour les bugs tombés au combat',
        '🥤 Sieste refusée, café accepté',
        '💻 Vos projets prennent vie',
        "⌛ Compilation... le temps d'un café",
    ],
    // 18h - 00h
    soir: [
        '🍕 Du code et une pizza, le combo parfait',
        '✨ Les meilleures idées arrivent le soir',
        '🌆 localhost:3000, mon endroit préféré',
        '🌌 Que le code soit avec toi ce soir',
        "😎 git commit -m 'on verra demain'",
        '🏗️ Ton side-project mérite 30 minutes',
        '🔧 Refactoring tranquille du soir',
        '🧙 Tu es un développeur, Harry',
        "🌚 'Juste un dernier bug' (mensonge)",
        '🌙 Finis la journée sur une victoire',
        '💾 Sauvegarde de la journée en cours...',
        '🎮 Un dernier niveau... euh, un dernier commit',
        '🛋️ Mode canapé + side-project activé',
        "💡 Le soir, l'inspiration frappe",
        '🍿 Netflix, chill et un peu de Python',
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
