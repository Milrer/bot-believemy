import Anthropic from '@anthropic-ai/sdk';
import fetch, { Headers, Request, Response } from 'node-fetch';
import * as dotenv from 'dotenv';
import { knowledgeBase } from './knowledge.js';
import { isOpenToAll, setOpenToAll } from './settings.js';

dotenv.config();

// Node < 18 n'expose pas les APIs Web (fetch, Headers…) dont le SDK Anthropic
// a besoin. On les polyfille globalement. Sur Node 18+, elles sont déjà natives
// et ce bloc est ignoré.
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
    globalThis.Headers = Headers;
    globalThis.Request = Request;
    globalThis.Response = Response;
}

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Modèle Anthropic utilisé pour les réponses (Claude Haiku 4.5)
const MODEL = 'claude-haiku-4-5';

const SYSTEM_PROMPT = `Tu es BeBot, l'assistant IA de la communauté Discord de Believemy, la plateforme française qui apprend à ses membres le code, le no-code et l'IA, et plus largement à devenir solopreneur.
Tu es chaleureux, bienveillant et serviable, et tu tutoies les membres.
Tu es à l'aise avec le développement, le no-code, l'IA et l'entrepreneuriat, mais tu réponds volontiers à toutes les questions.
Réponds toujours en français, de façon concise et naturelle (évite les pavés).
Ta réponse ne doit jamais dépasser 2000 caractères (limite Discord).
Les messages récents du salon te sont fournis pour le contexte : le format « Prénom : message » indique qui a écrit quoi.

Une base de connaissances sur Believemy, son créateur et le support t'est fournie plus bas. Appuie-toi dessus en priorité pour répondre.
Si une information ne s'y trouve pas et que tu n'es pas certain, ne l'invente jamais : dis-le honnêtement et invite la personne à contacter le support humain. Les passages notés « [À COMPLÉTER] » ne sont pas encore renseignés : traite-les comme des informations que tu ne connais pas.

Tu peux ouvrir ou fermer l'accès public à toi-même (le mode « ouvert à tout le monde »), mais seulement via l'outil prévu à cet effet et uniquement à la demande d'un administrateur. Si tu ne disposes pas de cet outil, tu n'as pas ce pouvoir : dis-le simplement, sans prétendre l'avoir fait.`;

// Nombre de messages récents récupérés pour donner du contexte au modèle
const HISTORY_LIMIT = 10;

// Outil d'administration : permet à Claude de piloter l'accès public sur demande
const PUBLIC_ACCESS_TOOL = {
    name: 'set_public_access',
    description:
        "Active ou désactive l'accès public à BeBot (mode « ouvert à tout le monde »). " +
        "Utilise cet outil uniquement quand un administrateur te demande explicitement d'ouvrir ou de fermer l'accès à tous. " +
        "Ne l'utilise pas pour une simple question sur l'état de l'accès.",
    input_schema: {
        type: 'object',
        properties: {
            enabled: {
                type: 'boolean',
                description:
                    "true pour ouvrir l'accès à tout le monde, false pour le réserver aux membres autorisés.",
            },
        },
        required: ['enabled'],
    },
};

// Outil de contexte : Claude peut demander plus de messages du salon (jusqu'à 100)
const FETCH_MESSAGES_TOOL = {
    name: 'fetch_more_messages',
    description:
        'Récupère davantage de messages récents du salon pour avoir plus de contexte. ' +
        'Utilise-le quand tu as besoin de remonter plus loin dans la conversation pour bien répondre — ' +
        'par exemple pour répondre à plusieurs questions posées plus haut ou donner un avis sur une discussion. ' +
        'Maximum 100 messages.',
    input_schema: {
        type: 'object',
        properties: {
            limit: {
                type: 'integer',
                description:
                    'Nombre de messages récents à récupérer (entre 1 et 100).',
                minimum: 1,
                maximum: 100,
            },
        },
        required: ['limit'],
    },
};

/**
 * Récupère jusqu'à 100 messages récents du salon, formatés pour le modèle.
 */
async function fetchMoreMessages(message, requestedLimit) {
    const limit = Math.min(Math.max(parseInt(requestedLimit, 10) || 50, 1), 100);
    try {
        const fetched = await message.channel.messages.fetch({ limit });
        const text = [...fetched.values()]
            .reverse() // du plus ancien au plus récent
            .map((m) => {
                const content = m.cleanContent?.trim();
                if (!content) return null;
                const name =
                    m.author.id === message.client.user.id
                        ? 'BeBot'
                        : m.member?.displayName || m.author.username;
                return `${name} : ${content}`;
            })
            .filter(Boolean)
            .join('\n');
        return text || 'Aucun message supplémentaire trouvé.';
    } catch (error) {
        console.error('Erreur fetch_more_messages :', error.message);
        return 'Impossible de récupérer plus de messages pour le moment.';
    }
}

/**
 * Découpe un texte en morceaux de 2000 caractères max (limite Discord),
 * en coupant de préférence sur les sauts de ligne.
 */
function splitMessage(text, max = 2000) {
    if (text.length <= max) return [text];
    const chunks = [];
    let current = '';
    for (const line of text.split('\n')) {
        if (current.length + line.length + 1 > max) {
            if (current) chunks.push(current);
            if (line.length > max) {
                // ligne unique trop longue : découpage brut
                for (let i = 0; i < line.length; i += max) {
                    chunks.push(line.slice(i, i + max));
                }
                current = '';
            } else {
                current = line;
            }
        } else {
            current = current ? current + '\n' + line : line;
        }
    }
    if (current) chunks.push(current);
    return chunks;
}

/**
 * Répond via l'IA lorsqu'un membre autorisé mentionne le bot.
 * Ne fait rien si aucun rôle n'est configuré ou si l'auteur n'a pas ce rôle.
 */
export const aiReply = async (message) => {
    // Mode « ouvert à tous » : si activé, tout le monde peut parler à BeBot.
    // Sinon, accès réservé au rôle configuré — mais les administrateurs passent
    // toujours, pour pouvoir piloter le bot.
    const openToAll = isOpenToAll();
    const roleId = process.env.BEBOT_AI_ROLE_ID;
    const adminIds = (process.env.BEBOT_ADMIN_ID || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    const isAdmin = adminIds.includes(message.author.id);

    // Message hors serveur (DM) → on ignore
    if (!message.member) {
        return;
    }

    // Mode restreint : on applique le contrôle du rôle
    if (!openToAll && !isAdmin) {
        // Rôle non configuré → on ignore
        if (!roleId) {
            return;
        }
        // Membre sans le rôle requis → réaction discrète, pas de réponse IA
        if (!message.member.roles.cache.has(roleId)) {
            try {
                await message.react('🔒');
            } catch (error) {
                console.error('Erreur réaction BeBot :', error);
            }
            return;
        }
    }

    try {
        // Affiche l'indicateur « BeBot est en train d'écrire… »
        await message.channel.sendTyping();

        // Récupère les derniers messages du salon pour comprendre le fil
        const history = await message.channel.messages.fetch({
            limit: HISTORY_LIMIT,
        });

        const messages = [...history.values()]
            .reverse() // du plus ancien au plus récent
            .map((m) => {
                const content = m.cleanContent?.trim();
                if (!content) return null;
                if (m.author.id === message.client.user.id) {
                    return { role: 'assistant', content };
                }
                const name = m.member?.displayName || m.author.username;
                return { role: 'user', content: `${name} : ${content}` };
            })
            .filter(Boolean);

        // L'API Anthropic exige que la conversation commence par un message « user »
        while (messages.length && messages[0].role === 'assistant') {
            messages.shift();
        }
        if (!messages.length) return;

        // Bloc système : persona + base de connaissances (mise en cache pour l'économie)
        const system = [{ type: 'text', text: SYSTEM_PROMPT }];
        if (knowledgeBase) {
            system.push({
                type: 'text',
                text: `# Base de connaissances\n\n${knowledgeBase}`,
                cache_control: { type: 'ephemeral' },
            });
        }

        // Outils : le contexte étendu pour tous, l'administration pour les admins
        const tools = [FETCH_MESSAGES_TOOL];
        if (isAdmin) tools.push(PUBLIC_ACCESS_TOOL);

        let response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 1024,
            system,
            messages,
            ...(tools && { tools }),
        });

        // Claude peut demander à exécuter un outil : on boucle (limite de sécurité).
        // actionConfirmation garantit un retour même si le modèle ne conclut pas par du texte.
        let actionConfirmation = null;
        let turns = 0;
        while (response.stop_reason === 'tool_use' && turns < 5) {
            turns++;
            messages.push({ role: 'assistant', content: response.content });
            const toolResults = [];
            for (const block of response.content) {
                if (block.type !== 'tool_use') continue;
                let result = 'Action non reconnue.';
                if (block.name === 'fetch_more_messages') {
                    result = await fetchMoreMessages(message, block.input?.limit);
                } else if (block.name === 'set_public_access' && isAdmin) {
                    const enabled = Boolean(block.input?.enabled);
                    setOpenToAll(enabled);
                    result = enabled
                        ? "Fait : l'accès est maintenant ouvert à tout le monde."
                        : "Fait : l'accès est de nouveau réservé aux membres autorisés.";
                    actionConfirmation = result;
                }
                toolResults.push({
                    type: 'tool_result',
                    tool_use_id: block.id,
                    content: result,
                });
            }
            messages.push({ role: 'user', content: toolResults });

            response = await anthropic.messages.create({
                model: MODEL,
                max_tokens: 1024,
                system,
                messages,
                ...(tools && { tools }),
            });
        }

        const reply = response.content
            .filter((block) => block.type === 'text')
            .map((block) => block.text)
            .join('')
            .trim();

        // Si le modèle n'a rien dit mais qu'une action a eu lieu, on confirme quand même.
        const finalText = reply || actionConfirmation;

        if (finalText) {
            const chunks = splitMessage(finalText);
            for (let i = 0; i < chunks.length; i++) {
                if (i === 0) await message.reply({ content: chunks[i] });
                else await message.channel.send({ content: chunks[i] });
            }
        }
    } catch (error) {
        console.error('Erreur BeBot IA :', error);
        // Erreur visible : on prévient l'utilisateur au lieu d'échouer en silence
        message
            .reply({
                content:
                    "Désolé, je rencontre un souci technique de mon côté 😵 Réessaie dans un instant.",
            })
            .catch(() => {});
    }
};
