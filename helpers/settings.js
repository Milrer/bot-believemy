import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const settingsPath = join(dataDir, 'settings.json');

/**
 * État runtime du bot, persisté dans data/settings.json.
 * Si le fichier n'existe pas encore, on initialise depuis la variable d'env
 * BEBOT_OPEN_TO_ALL (rétrocompatibilité). Ensuite, le fichier fait foi.
 */
function load() {
    try {
        if (existsSync(settingsPath)) {
            return JSON.parse(readFileSync(settingsPath, 'utf-8'));
        }
    } catch (error) {
        console.error(
            '[Settings] Lecture impossible, valeurs par défaut :',
            error.message
        );
    }
    return { openToAll: process.env.BEBOT_OPEN_TO_ALL?.toUpperCase() === 'ON' };
}

let settings = load();

export function isOpenToAll() {
    return settings.openToAll === true;
}

export function setOpenToAll(value) {
    settings.openToAll = Boolean(value);
    try {
        if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        console.log(
            `[Settings] Accès public ${settings.openToAll ? 'activé' : 'désactivé'}.`
        );
    } catch (error) {
        console.error('[Settings] Écriture impossible :', error.message);
    }
    return settings.openToAll;
}
