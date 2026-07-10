import Anthropic from '@anthropic-ai/sdk';
import fetch, { Headers, Request, Response } from 'node-fetch';
import * as dotenv from 'dotenv';

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
Les messages récents du salon te sont fournis pour le contexte : le format « Prénom : message » indique qui a écrit quoi.`;

// Nombre de messages récents récupérés pour donner du contexte au modèle
const HISTORY_LIMIT = 10;

/**
 * Répond via l'IA lorsqu'un membre autorisé mentionne le bot.
 * Ne fait rien si aucun rôle n'est configuré ou si l'auteur n'a pas ce rôle.
 */
export const aiReply = async (message) => {
    const roleId = process.env.BEBOT_AI_ROLE_ID;

    // Rôle non configuré ou message hors serveur (DM) → on ignore
    if (!roleId || !message.member) {
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

        const response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages,
        });

        const reply = response.content
            .filter((block) => block.type === 'text')
            .map((block) => block.text)
            .join('')
            .trim()
            .slice(0, 2000);

        if (reply) {
            await message.reply({ content: reply });
        }
    } catch (error) {
        console.error('Erreur BeBot IA :', error);
    }
};
