import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const knowledgePath = join(__dirname, '..', 'knowledge');

/**
 * Charge et concatène tous les fichiers .md du dossier knowledge/.
 * Lecture faite une seule fois au démarrage : après avoir édité un fichier,
 * redémarre le bot (pm2 restart main) pour que les changements soient pris en compte.
 */
function loadKnowledge() {
    try {
        const files = readdirSync(knowledgePath)
            .filter((f) => f.endsWith('.md'))
            .sort(); // ordre déterministe (utile pour le cache de prompt)

        const base = files
            .map((f) => readFileSync(join(knowledgePath, f), 'utf-8').trim())
            .filter(Boolean)
            .join('\n\n---\n\n');

        console.log(
            `[Knowledge] ${files.length} fichier(s) de connaissance chargé(s) (${base.length} caractères).`
        );
        return base;
    } catch (error) {
        console.error('[Knowledge] Erreur de chargement :', error.message);
        return '';
    }
}

export const knowledgeBase = loadKnowledge();
