import { Events } from 'discord.js';
import { journaliser } from '../../helpers/logChannel.js';

/**
 * Le mot d'accueil, en message privé.
 *
 * POURQUOI EN PRIVÉ ET PAS DANS UN SALON. Un message de bienvenue posté dans
 * le général est lu par tout le monde sauf par celui qu'il vise : il arrive
 * au milieu d'une conversation en cours, et il disparaît. En privé, il attend
 * la personne.
 *
 * CE QU'IL DIT, ET RIEN DE PLUS. Une seule action possible, pour ceux qu'elle
 * concerne, et l'autorisation de ne rien faire pour les autres. Un bot qui
 * envoie des messages privés non sollicités peut être sanctionné par Discord :
 * c'est le message qui vend, ou qui se répète, qui pose problème, pas un mot
 * d'accueil unique.
 *
 * POURQUOI « DANS UN SALON DU SERVEUR » ET NON « ICI ». Les commandes du bot
 * sont enregistrées sur le serveur (`applicationGuildCommands`) et `/verify`
 * lit le rôle du membre : elle ne répond donc pas dans un message privé.
 * Envoyer quelqu'un taper une commande qui reste muette est pire que de ne
 * rien dire.
 *
 * `/verify` NE CONCERNE QUE LES ACCÉLÉRATEURS. Un membre qui suit une
 * formation avec un simple abonnement n'y a pas sa place : la commande lui
 * répondrait « accès refusé », ce qui est une mauvaise première minute pour
 * quelqu'un qui n'a rien fait de mal.
 */
const BIENVENUE = [
    'Hello 👋',
    'Bienvenue chez Believemy.',
    '',
    "Si tu fais partie d'un de nos accélérateurs, fais `/verify` dans n'importe quel salon du serveur : ça t'ouvre ceux qui te sont réservés.",
    '',
    'Sinon tu es au bon endroit, installe-toi.',
].join('\n');

export default {
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (member.user.bot) {
            return;
        }

        try {
            await member.send(BIENVENUE);
            await journaliser(
                member.client,
                `👋 Bienvenue envoyée à ${member.user.username}.`
            );
        } catch (error) {
            // 50007 : la personne refuse les messages privés venant des
            // membres du serveur. C'est son choix, pas une panne : on le note
            // sans bruit et le bot passe à la suite.
            if (error.code === 50007) {
                console.log(
                    `[bienvenue] ${member.user.username} (${member.id}) n'accepte pas les messages privés.`
                );
                return;
            }

            console.error(
                `[bienvenue] message non remis à ${member.user.username} : ${error.message}`
            );
            await journaliser(
                member.client,
                `⚠️ Bienvenue non remise à ${member.user.username} : ${error.message}`
            );
        }
    },
};
