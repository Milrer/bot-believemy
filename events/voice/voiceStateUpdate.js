import { Events } from 'discord.js';
import { Collection, PermissionsBitField } from 'discord.js';

const voiceLocalStockage = new Collection();

export default {
    name: Events.VoiceStateUpdate,
    on: true,
    async execute(oldState, newState) {
        if (
            oldState.channelId === voiceLocalStockage.get(newState.id) &&
            oldState.channelId !== newState.channelId
        ) {
            const previousPrivateRoom = newState.guild.channels.cache.get(
                oldState.channelId
            );
            if (previousPrivateRoom) {
                await previousPrivateRoom.delete();
                voiceLocalStockage.delete(newState.id);
            }
        }
        if (newState.channelId !== '1134549331832221836') return;
        const channelPrivateRoom = await newState.guild.channels.create({
            name: `Salon de ${newState.member.user.username}`,
            type: 2,
            parent: newState.channel.parent,
            permissionOverwrites: [
                {
                    id: newState.member.id,
                    allow: [
                        PermissionsBitField.Flags.Connect,
                        PermissionsBitField.Flags.ManageRoles,
                        PermissionsBitField.Flags.Speak,
                        PermissionsBitField.Flags.UseVAD,
                        PermissionsBitField.Flags.MuteMembers,
                        PermissionsBitField.Flags.MoveMembers,
                    ],
                },
                {
                    id: newState.guild.id, // ID du serveur
                    allow: [
                        PermissionsBitField.Flags.Connect,
                        PermissionsBitField.Flags.Speak,
                        PermissionsBitField.Flags.UseVAD,
                    ], // Autoriser tout le monde à se connecter
                },
            ],
        });
        await newState.setChannel(channelPrivateRoom);
        voiceLocalStockage.set(newState.id, channelPrivateRoom.id);
    },
};
