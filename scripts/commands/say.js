const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, channelLink } = require('discord.js');
const { EmbedColors } = require('../globals.js');
const localization = new Intl.DateTimeFormat('en-US');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Speak as Pou')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addStringOption(option => option
            .setName('content')
            .setDescription('The contents of the message')
            .setRequired(true)
        )
        .addChannelOption(option => option
            .addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.PrivateThread, ChannelType.PublicThread, ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildStageVoice)
            .setName('channel')
            .setDescription('The channel to speak in')
        )
        .addStringOption(option => option
            .setName('reply')
            .setDescription('The message ID to reply to. Must be within the same channel')
        ),
    async execute(interaction) {
        // Get base channel
        const channel = interaction.options.getChannel('channel', false) || interaction.channel;
        // Get content
        const content = interaction.options.getString('content');
        const reply = interaction.options.getString('reply', false);

        // Get message to reply to
        if (reply) {
            await channel.messages.fetch(reply)
            .then(message => {
                message.reply(content)
                .then(botMessage => {
                    interaction.reply({ content: "Sent message", ephemeral: true });
                })
                .catch(err => {
                    interaction.reply({ content: "Failed to send message", ephemeral: true });
                });
            })
            .catch(err => {
                interaction.reply({ content: "Failed to find message", ephemeral: true });
            });
        } else {
            channel.send(content)
            .then(botMessage => {
                interaction.reply({ content: "Sent message", ephemeral: true });
            })
            .catch(err => {
                interaction.reply({ content: "Failed to send message", ephemeral: true });
            });
        }
    }
}