const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

async function play(interaction) {

}

async function end(interaction) {

}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("music")
        .setDescription("Music/sound related commands")
        .setDMPermission(false)
        .setDefaultMemberPermissions('0')

        .addSubcommandGroup(group => group
            .setName('play')
            .setDescription('Play a song')
            .addSubcommand(subcommand => subcommand
                .setName('file')
                .setDescription('Play a song from file')
                .addAttachmentOption(option => option
                    .setName('file')
                    .setDescription('The audio file to play')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('search')
                .setDescription('Play something through search')
                .addStringOption(option => option
                    .setName('query')
                    .setDescription('The search query to search for')
                    .setRequired(true)
                )
            )
        )

        .addSubcommand(subcommand => subcommand
            .setName('pause')
            .setDescription('Pauses the current song')
        )

        .addSubcommand(subcommand => subcommand
            .setName('skip')
            .setDescription('Skip the current song')
        )

        .addSubcommand(subcommand => subcommand
            .setName('end')
            .setDescription('Ends the queue. Used as an absolute stop')
        )
        ,
    async execute(interaction) {
        const subcommandGroup = interaction.options.getSubcommandGroup(false)
        const subcommand = interaction.options.getSubcommand(false)
        let options = []
        if (subcommandGroup) options.push(subcommandGroup)
        if (subcommand) options.push(subcommand)

        // run function
        switch (subcommandGroup) {
            case "play":
                await play(interaction)
                break;
            case "end":
                await end(interaction)
                break;
        }

        interaction.reply({ content: `${options.join(", ")}: executed`, ephemeral: true })
    }
}