const { SlashCommandBuilder } = require('discord.js');
const os = require('node:os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pings the bot'),
    async execute(interaction) {
        // Get OS information
        const osType = os.type();
        // Reply with information
        await interaction.reply({content: `Pong from ${osType}!`});
    }
}