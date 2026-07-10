import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const settingsPath = join(dataDir, 'settings.json');

/**
 * État runtime du bot, persisté dans data/settings.json :
 *  - openToAll : accès ouvert à tout le monde (sinon réservé au rôle)
 *  - blocked   : IDs des membres exclus de BeBot (anti-spam)
 * Au premier lancement, openToAll est initialisé depuis BEBOT_OPEN_TO_ALL.
 */
function load() {
    let data = {};
    try {
        if (existsSync(settingsPath)) {
            data = JSON.parse(readFileSync(settingsPath, 'utf-8'));
        }
    } catch (error) {
        console.error(
            '[Settings] Lecture impossible, valeurs par défaut :',
            error.message
        );
    }
    return {
        openToAll:
            data.openToAll ??
            process.env.BEBOT_OPEN_TO_ALL?.toUpperCase() === 'ON',
        blocked: Array.isArray(data.blocked) ? data.blocked : [],
    };
}

let settings = load();

function save() {
    try {
        if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('[Settings] Écriture impossible :', error.message);
    }
}

export function isOpenToAll() {
    return settings.openToAll === true;
}

export function setOpenToAll(value) {
    settings.openToAll = Boolean(value);
    save();
    console.log(
        `[Settings] Accès public ${settings.openToAll ? 'activé' : 'désactivé'}.`
    );
    return settings.openToAll;
}

export function isBlocked(userId) {
    return settings.blocked.includes(userId);
}

export function blockUser(userId) {
    if (!settings.blocked.includes(userId)) {
        settings.blocked.push(userId);
        save();
        console.log(`[Settings] Membre ${userId} exclu (anti-spam).`);
    }
}

export function unblockUser(userId) {
    const i = settings.blocked.indexOf(userId);
    if (i === -1) return false;
    settings.blocked.splice(i, 1);
    save();
    console.log(`[Settings] Membre ${userId} réintégré.`);
    return true;
}
