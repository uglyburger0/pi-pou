const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { EmbedColors } = require('../globals.js');
const localization = new Intl.NumberFormat('en-US');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pings the bot'),
    async execute(interaction) {
        // Reply with information
        let embed = new EmbedBuilder()
        embed.setTitle('Pong!')
        embed.setColor(EmbedColors.Default)
        embed.addFields(
            {name: "API Latency", value: `${localization.format(Math.abs(interaction.client.ws.ping))}ms`},
        )
        embed.setTimestamp(Date.now()) // Set the timestamp to the current time

        await interaction.reply({embeds: [embed]});
    }
}