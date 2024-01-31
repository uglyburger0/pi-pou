const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const fetch = require('node-fetch');
const fs = require('node:fs');
const { UserID } = require('../globals.js');
const dataHandler = require('../dataHandler.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("data")
        .setDescription("Data manipulation commands. Handles .pou data")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommandGroup(subcommandGroup => subcommandGroup
            .setName('read')
            .setDescription("Parent command for reading data.pou")
            .addSubcommand(subcommand => subcommand
                .setName('file')
                .setDescription("Reads data directly from file (truncated). Also returns file size")
            )
            .addSubcommand(subcommand => subcommand
                .setName('memory')
                .setDescription("Reads data from memory (truncated). Also returns memory size")
            )
        )

        .addSubcommand(subcommand => subcommand
            .setName('upload')
            .setDescription("Uploads & replaces data.pou with a new file")
            .addAttachmentOption(option => option
                .setName('file')
                .setDescription('The file to replace data.pou. Must also be named data.pou')
                .setRequired(true)
            )
        )

        .addSubcommand(subcommand => subcommand
            .setName('load')
            .setDescription("Loads data.pou from file into memory")
        )

        .addSubcommand(subcommand => subcommand
            .setName('save')
            .setDescription("Saves the current memory data to file")
        )

        .addSubcommand(subcommand => subcommand
            .setName('wipe')
            .setDescription("Completely wipes data. Requires confirmation")
        )
    ,
    async execute(interaction) {
        const subcommandGroup = interaction.options.getSubcommandGroup(false)
        const subcommand = interaction.options.getSubcommand(false)
        if (!subcommandGroup) {
            switch (subcommand) {
                case "load":
                    const file = dataHandler.GetRawDataFile()
                    dataHandler.SetData(file)
                    await interaction.reply({content: `Data successfully reloaded!`, ephemeral: true})
                    break;
                case "save":
                    if (interaction.member.id != UserID.uglyburger0) {
                        await interaction.reply({content: "You must be the owner of the bot to continue.", ephemeral: true})
                        break;
                    }
                    dataHandler.WriteRawDataToFile()
                    await interaction.reply({content: `Current memory data successfully saved to disk.`, ephemeral: true})
                    break;
                case "upload":
                    if (interaction.member.id != UserID.uglyburger0) {
                        await interaction.reply({content: "You must be the owner of the bot to continue.", ephemeral: true})
                        break;
                    }
                    const attachment = interaction.options.getAttachment("file")
                    // Download the file as "data.pou"
                    const fileStream = fs.createWriteStream(dataHandler.data_path);
                    const response = await fetch(attachment.url);
                    response.body.pipe(fileStream);
                    fileStream.on('finish', () => {
                        fileStream.close();
                        // Load into memory
                        const file = dataHandler.GetRawDataFile()
                        dataHandler.SetData(file)
                        // Reply
                        interaction.reply({content: `Data successfully uploaded and loaded.`, ephemeral: true})
                    })
                    break;
                case "wipe":
                    if (interaction.member.id != UserID.uglyburger0) {
                        await interaction.reply({content: "You must be the owner of the bot to continue.", ephemeral: true})
                        break;
                    }
                    // Create action row
                    const actionRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("data_wipe_confirm")
                                .setLabel("Yes, Continue")
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId("data_wipe_cancel")
                                .setLabel("No, Cancel")
                                .setStyle(ButtonStyle.Danger)
                        )
                    // Send confirmation message
                    await interaction.reply({content: "## Are you sure you want to wipe ALL data?\n* This will delete both file and memory data. There is no way to undo!", components: [actionRow], ephemeral: true})
                    .then(async msg => {
                        try {
                            const confirmation = await msg.awaitMessageComponent({ time: 20_000 });
                            if (confirmation.customId == "data_wipe_confirm") {
                                dataHandler.WipeData()
                                await interaction.editReply({content: "All data has been successfully wiped. Rest in peace.", components: []})
                            } else {
                                await interaction.editReply({content: "Data wipe has been cancelled.", components: []})
                            }
                        } catch {
                            await msg.delete()
                            .catch(error => console.log('Could not delete DM: ', error));
                        }
                    })

                    break;
                default:
                    await interaction.reply({content: "This subcommand is not implemented yet!", ephemeral: true})
                    break;
            }
        } else {
            let loaded = undefined
            let length = undefined;
            let dataString = undefined;
            switch (subcommand) {
                case "file":
                    const file = fs.readFileSync(dataHandler.data_path);
                    const attachment = new AttachmentBuilder()
                        .setFile(file)
                        .setName("data.json")

                    await interaction.reply({files: [attachment], ephemeral: true})
                    break;
                case "memory":
                    loaded = dataHandler.GetData()
                    dataString = JSON.stringify(loaded)
                    length = JSON.stringify(loaded).length
                    await interaction.reply({content: `Memory size: ${length} bytes \`\`\`${dataString.substring(0, 1900)}\`\`\``, ephemeral: true})
                    break;
                default:
                    await interaction.reply({content: "This subcommand is not implemented yet!", ephemeral: true})
                    break;
            }
        }
    }
}