import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const statsPath = join(dataDir, 'stats.json');

// Tarifs Claude Haiku 4.5 (USD par million de tokens, sauf web search)
const PRICE = {
    input: 1.0,
    output: 5.0,
    cacheRead: 0.1,
    cacheWrite: 1.25,
    webSearch: 10.0 / 1000, // 10 $ / 1000 recherches
};

function load() {
    try {
        if (existsSync(statsPath)) {
            return JSON.parse(readFileSync(statsPath, 'utf-8'));
        }
    } catch (error) {
        console.error('[Stats] Lecture impossible :', error.message);
    }
    return {
        responses: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        webSearches: 0,
        since: null,
    };
}

let stats = load();

function save() {
    try {
        if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
        writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error('[Stats] Écriture impossible :', error.message);
    }
}

/** Accumule l'usage tokens d'un appel API. */
export function recordUsage(usage) {
    if (!usage) return;
    if (!stats.since) stats.since = Date.now();
    stats.inputTokens += usage.input_tokens || 0;
    stats.outputTokens += usage.output_tokens || 0;
    stats.cacheReadTokens += usage.cache_read_input_tokens || 0;
    stats.cacheWriteTokens += usage.cache_creation_input_tokens || 0;
    save();
}

/** Incrémente le compteur de réponses envoyées. */
export function recordResponse() {
    stats.responses += 1;
    save();
}

/** Incrémente le compteur de recherches web. */
export function recordWebSearches(n) {
    if (n > 0) {
        stats.webSearches += n;
        save();
    }
}

function estimateCost() {
    return (
        (stats.inputTokens * PRICE.input +
            stats.outputTokens * PRICE.output +
            stats.cacheReadTokens * PRICE.cacheRead +
            stats.cacheWriteTokens * PRICE.cacheWrite) /
            1_000_000 +
        stats.webSearches * PRICE.webSearch
    );
}

/** Renvoie un texte formaté des stats et du coût estimé. */
export function formatStats() {
    const since = stats.since
        ? new Date(stats.since).toLocaleDateString('fr-FR')
        : '—';
    const nf = (n) => n.toLocaleString('fr-FR');
    return [
        `📊 **Statistiques de BeBot** (depuis le ${since})`,
        `• Réponses envoyées : ${nf(stats.responses)}`,
        `• Tokens en entrée : ${nf(stats.inputTokens)} (dont ${nf(stats.cacheReadTokens)} en cache)`,
        `• Tokens en sortie : ${nf(stats.outputTokens)}`,
        `• Recherches web : ${nf(stats.webSearches)}`,
        `• Coût estimé : ~${estimateCost().toFixed(4)} $ (modèle Claude Haiku 4.5)`,
    ].join('\n');
}
