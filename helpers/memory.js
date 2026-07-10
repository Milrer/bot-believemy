import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const memoryPath = join(dataDir, 'memory.json');

const MAX_FACTS = 20; // nombre max de faits mémorisés par membre

/**
 * Mémoire long terme par membre, persistée dans data/memory.json
 * sous la forme { userId: ["fait 1", "fait 2", ...] }.
 */
function load() {
    try {
        if (existsSync(memoryPath)) {
            return JSON.parse(readFileSync(memoryPath, 'utf-8'));
        }
    } catch (error) {
        console.error('[Memory] Lecture impossible :', error.message);
    }
    return {};
}

let memory = load();

function save() {
    try {
        if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
        writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
    } catch (error) {
        console.error('[Memory] Écriture impossible :', error.message);
    }
}

/** Renvoie la liste des faits mémorisés pour un membre. */
export function getMemory(userId) {
    return memory[userId] || [];
}

/** Ajoute un fait à la mémoire d'un membre (dédupliqué, borné à MAX_FACTS). */
export function addMemory(userId, fact) {
    const clean = String(fact || '').trim();
    if (!clean) return;
    const facts = memory[userId] || [];
    if (facts.includes(clean)) return; // déjà connu
    facts.push(clean);
    while (facts.length > MAX_FACTS) facts.shift(); // on retire le plus ancien
    memory[userId] = facts;
    save();
    console.log(`[Memory] Fait mémorisé pour ${userId} : ${clean}`);
}

/** Efface toute la mémoire d'un membre. */
export function clearMemory(userId) {
    if (memory[userId]) {
        delete memory[userId];
        save();
        console.log(`[Memory] Mémoire effacée pour ${userId}.`);
        return true;
    }
    return false;
}
