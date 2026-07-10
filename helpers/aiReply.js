import Anthropic from '@anthropic-ai/sdk';
import fetch, { Headers, Request, Response } from 'node-fetch';
import * as dotenv from 'dotenv';
import { knowledgeBase } from './knowledge.js';
import {
    isOpenToAll,
    setOpenToAll,
    isBlocked,
    blockUser,
    unblockUser,
} from './settings.js';
import { getMemory, addMemory, clearMemory } from './memory.js';
import {
    recordUsage,
    recordResponse,
    recordWebSearches,
    formatStats,
} from './stats.js';

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
Les messages récents du salon te sont fournis pour le contexte : le format « Prénom (<@identifiant>) : message » indique qui a écrit quoi.
Quand tu t'adresses à une personne ou que tu la mentionnes dans ta réponse, tague-la avec son identifiant au format <@identifiant> (celui entre parenthèses après son prénom) pour qu'elle reçoive une notification. Tu peux taguer plusieurs personnes si besoin.

Une base de connaissances sur Believemy, son créateur et le support t'est fournie plus bas. Appuie-toi dessus en priorité pour répondre.
Si une information ne s'y trouve pas et que tu n'es pas certain, ne l'invente jamais : dis-le honnêtement et invite la personne à contacter le support humain. Les passages notés « [À COMPLÉTER] » ne sont pas encore renseignés : traite-les comme des informations que tu ne connais pas.
Pour les questions d'actualité ou d'informations récentes qui ne figurent pas dans ta base de connaissances, utilise la recherche web avant de répondre, puis indique brièvement ta ou tes sources (le lien). N'annonce pas que tu vas chercher (pas de « je vais te chercher l'info » ni « laisse-moi regarder ») : donne directement la réponse. N'y recours pas pour une simple conversation ou une question dont tu connais déjà la réponse.

Tu peux ouvrir ou fermer l'accès public à toi-même (le mode « ouvert à tout le monde »), mais seulement via l'outil prévu à cet effet et uniquement à la demande d'un administrateur. Si tu ne disposes pas de cet outil, tu n'as pas ce pouvoir : dis-le simplement, sans prétendre l'avoir fait.`;

// Nombre de messages récents récupérés pour donner du contexte au modèle
const HISTORY_LIMIT = 10;

// Anti-spam : seuils et historique en mémoire des sollicitations par membre
const RATE_WINDOW_MS = 60 * 1000; // fenêtre de 1 minute
const RATE_MAX = 10; // 10 réponses / minute maximum
const BAN_WINDOW_MS = 3 * 60 * 1000; // fenêtre de 3 minutes
const BAN_MAX = 30; // > 30 sollicitations / 3 min → exclusion
const mentionTimes = new Map(); // userId → timestamps récents

/**
 * Enregistre une sollicitation et renvoie le statut anti-spam de l'utilisateur.
 * @returns {'ok' | 'rate_limited' | 'ban'}
 */
function checkSpam(userId, now) {
    const times = (mentionTimes.get(userId) || []).filter(
        (t) => now - t < BAN_WINDOW_MS
    );
    times.push(now);
    mentionTimes.set(userId, times);

    if (times.length > BAN_MAX) return 'ban';
    const recent = times.filter((t) => now - t < RATE_WINDOW_MS).length;
    if (recent > RATE_MAX) return 'rate_limited';
    return 'ok';
}

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

// Outil d'administration : réintégrer une personne exclue (anti-spam)
const UNBLOCK_USER_TOOL = {
    name: 'unblock_user',
    description:
        "Retire de la liste d'exclusion (blacklist anti-spam) la ou les personnes mentionnées dans le message. " +
        'Utilise cet outil quand un administrateur demande de débloquer ou réintégrer un membre.',
    input_schema: {
        type: 'object',
        properties: {},
    },
};

// Outils de mémoire : retenir / oublier des informations sur un membre
const REMEMBER_TOOL = {
    name: 'remember',
    description:
        "Mémorise durablement une information qu'un membre te communique sur lui-même (prénom, préférences, projet en cours, etc.) pour t'en souvenir lors de vos prochaines conversations. " +
        "Utilise-le dès qu'un membre te donne une information personnelle à retenir.",
    input_schema: {
        type: 'object',
        properties: {
            fact: {
                type: 'string',
                description:
                    "L'information à retenir, formulée brièvement à la 3e personne (ex. « s'appelle Nico », « apprend le no-code »).",
            },
        },
        required: ['fact'],
    },
};

const FORGET_TOOL = {
    name: 'forget',
    description:
        'Efface tout ce que tu as mémorisé sur le membre qui te parle. ' +
        'Utilise-le quand il demande que tu oublies ce que tu sais sur lui.',
    input_schema: {
        type: 'object',
        properties: {},
    },
};

// Outil d'administration : statistiques d'usage et coût de BeBot
const USAGE_STATS_TOOL = {
    name: 'usage_stats',
    description:
        "Affiche les statistiques d'usage de BeBot (réponses, tokens, coût estimé). " +
        "Utilise cet outil quand un administrateur demande les stats, l'usage ou le coût de BeBot.",
    input_schema: {
        type: 'object',
        properties: {},
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
                if (m.author.id === message.client.user.id) {
                    return `BeBot : ${content}`;
                }
                const name = m.member?.displayName || m.author.username;
                return `${name} (<@${m.author.id}>) : ${content}`;
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

    // Membre exclu (anti-spam) → ignoré totalement, sauf s'il est admin
    if (!isAdmin && isBlocked(message.author.id)) {
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

    // Anti-spam : rate limit et exclusion automatique (les admins sont exemptés)
    if (!isAdmin) {
        const status = checkSpam(message.author.id, Date.now());
        if (status === 'ban') {
            blockUser(message.author.id);
            message
                .reply({
                    content:
                        'Tu envoies trop de messages 😅 Tu es temporairement exclu de BeBot. Un administrateur pourra te réintégrer.',
                })
                .catch(() => {});
            return;
        }
        if (status === 'rate_limited') {
            try {
                await message.react('⏳');
            } catch (error) {
                console.error('Erreur réaction rate limit :', error);
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
                return {
                    role: 'user',
                    content: `${name} (<@${m.author.id}>) : ${content}`,
                };
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

        // Mémoire du membre qui parle (ajoutée après le cache → sans l'invalider)
        const userFacts = getMemory(message.author.id);
        if (userFacts.length) {
            const who = message.member?.displayName || message.author.username;
            system.push({
                type: 'text',
                text: `# Ce que tu sais déjà sur ${who} (la personne qui te parle)\n${userFacts
                    .map((f) => `- ${f}`)
                    .join('\n')}`,
            });
        }

        // Outils : contexte étendu + recherche web pour tous, administration pour les admins
        const tools = [
            FETCH_MESSAGES_TOOL,
            { type: 'web_search_20250305', name: 'web_search', max_uses: 3 },
            REMEMBER_TOOL,
            FORGET_TOOL,
        ];
        if (isAdmin)
            tools.push(PUBLIC_ACCESS_TOOL, UNBLOCK_USER_TOOL, USAGE_STATS_TOOL);

        // Appel centralisé : suit l'usage (tokens + recherches web) à chaque requête
        const callClaude = async () => {
            const r = await anthropic.messages.create({
                model: MODEL,
                max_tokens: 1024,
                system,
                messages,
                ...(tools && { tools }),
            });
            recordUsage(r.usage);
            recordWebSearches(
                r.content.filter(
                    (b) =>
                        b.type === 'server_tool_use' && b.name === 'web_search'
                ).length
            );
            return r;
        };

        let response = await callClaude();

        // Claude peut demander à exécuter un outil : on boucle (limite de sécurité).
        // actionConfirmation garantit un retour même si le modèle ne conclut pas par du texte.
        let actionConfirmation = null;
        let turns = 0;
        while (
            (response.stop_reason === 'tool_use' ||
                response.stop_reason === 'pause_turn') &&
            turns < 5
        ) {
            turns++;
            messages.push({ role: 'assistant', content: response.content });

            // Recherche web (server tool) : Anthropic reprend, rien à exécuter côté client
            if (response.stop_reason === 'pause_turn') {
                response = await callClaude();
                continue;
            }

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
                } else if (block.name === 'unblock_user' && isAdmin) {
                    const targets = [...message.mentions.users.keys()].filter(
                        (id) => id !== message.client.user.id
                    );
                    if (targets.length === 0) {
                        result =
                            'Aucune personne mentionnée. Mentionne la personne à débloquer (ex. @Nico).';
                    } else {
                        const done = targets.filter((id) => unblockUser(id));
                        result = done.length
                            ? `Débloqué : ${done.map((id) => `<@${id}>`).join(', ')}.`
                            : "Ces personnes n'étaient pas dans la liste d'exclusion.";
                    }
                    actionConfirmation = result;
                } else if (block.name === 'remember') {
                    addMemory(message.author.id, block.input?.fact);
                    result = "C'est noté, je m'en souviendrai.";
                } else if (block.name === 'forget') {
                    clearMemory(message.author.id);
                    result = "J'ai tout oublié à ton sujet.";
                    actionConfirmation = result;
                } else if (block.name === 'usage_stats' && isAdmin) {
                    result = formatStats();
                    actionConfirmation = result;
                }
                toolResults.push({
                    type: 'tool_result',
                    tool_use_id: block.id,
                    content: result,
                });
            }
            messages.push({ role: 'user', content: toolResults });

            response = await callClaude();
        }

        // Regroupe le texte : les fragments consécutifs sont collés, mais deux
        // segments séparés par une recherche web passent à la ligne au lieu
        // d'être collés l'un à l'autre.
        const segments = [];
        let buffer = '';
        for (const block of response.content) {
            if (block.type === 'text') {
                buffer += block.text;
            } else if (buffer.trim()) {
                segments.push(buffer.trim());
                buffer = '';
            }
        }
        if (buffer.trim()) segments.push(buffer.trim());
        const reply = segments.join('\n\n');

        // Si le modèle n'a rien dit mais qu'une action a eu lieu, on confirme quand même.
        const finalText = reply || actionConfirmation;

        if (finalText) {
            recordResponse();
            // parse: ['users'] → BeBot peut taguer des membres, jamais @everyone ni un rôle
            const allowedMentions = { parse: ['users'], repliedUser: false };
            const chunks = splitMessage(finalText);
            for (let i = 0; i < chunks.length; i++) {
                if (i === 0)
                    await message.reply({
                        content: chunks[i],
                        allowedMentions,
                    });
                else
                    await message.channel.send({
                        content: chunks[i],
                        allowedMentions,
                    });
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
