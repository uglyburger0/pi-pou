const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { EmbedColors } = require('../globals.js');
const localization = new Intl.DateTimeFormat('en-US');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Time a user out for a custom duration. Time units will be added together')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to time out')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('weeks')
            .setDescription('Time (in weeks) to time out the user for')
            .setRequired(false)
        )
        .addIntegerOption(option => option
            .setName('days')
            .setDescription('Time (in days) to time out the user for')
            .setRequired(false)
        )
        .addIntegerOption(option => option
            .setName('hours')
            .setDescription('Time (in hours) to time out the user for')
            .setRequired(false)
        )
        .addIntegerOption(option => option
            .setName('minutes')
            .setDescription('Time (in minutes) to time out the user for')
            .setRequired(false)
        )
        .addIntegerOption(option => option
            .setName('seconds')
            .setDescription('Time (in seconds) to time out the user for')
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('An optional for timing out the user')
            .setRequired(false)
        ),
    async execute(interaction) {
        // Get user/reason
        const user = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason', false);
        // Get different units of time
        const weeks = interaction.options.getInteger('weeks', false);
        const days = interaction.options.getInteger('days', false);
        const hours = interaction.options.getInteger('hours', false);
        const minutes = interaction.options.getInteger('minutes', false);
        const seconds = interaction.options.getInteger('seconds', false);

        // Calculate total time
        let total = 0;
        if (weeks) total += weeks * 604800;
        if (days) total += days * 86400;
        if (hours) total += hours * 3600;
        if (minutes) total += minutes * 60;
        if (seconds) total += seconds;

        // Disable communication until
        const time = Date.now() + (Math.min(total, 2419200)*1000)
        const timeInSeconds = Math.floor(time/1000)
        await user.disableCommunicationUntil(time, reason)
        .then(() => {
            if (total > 0) {
                interaction.reply({content: `Timed out user <@${user.id}> until <t:${timeInSeconds}:f> (<t:${timeInSeconds}:R>)`, ephemeral: true});
            } else {
                interaction.reply({content: `Removed time out from user <@${user.id}>`, ephemeral: true});
            }
        })
        .catch(error => {
            console.log(error)
            interaction.reply({content: "Could not time out user.", ephemeral: true});
        });
    }
}