const { Events, InteractionType, EmbedBuilder } = require('discord.js');
const { EmbedColors } = require('../globals.js');
const DataHandler = require('../dataHandler.js');
const path = require('node:path');

const subcommandInScript = ["music", "data"]

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		const type = interaction.type
		try {
			switch(type) {
				case InteractionType.ApplicationCommandAutocomplete:
				case InteractionType.ApplicationCommand:
					// File path & subcommand variables
                    let filePath = undefined;
                    const subcommandGroup = interaction.options.getSubcommandGroup(false)
                    const subcommand = interaction.options.getSubcommand(false)
    
                    // Determine file path to require `execute` function
                    if (subcommand && !subcommandInScript.includes(interaction.commandName)) {
                        // Get file path
                        if (subcommandGroup) {
                            filePath = path.join(__dirname, "..", "commands", interaction.commandName, subcommandGroup,`${subcommand}.js`);
                        } else {
                            filePath = path.join(__dirname, "..", "commands", interaction.commandName, `${subcommand}.js`);
                        }
                    }
    
                    // Get command
                    const command = filePath ? require(filePath) : interaction.client.commands.get(interaction.commandName)
                    if (!command) return;
                    
                    switch (type) {
                        case InteractionType.ApplicationCommand:
                            const commandName = [interaction.commandName,subcommandGroup,subcommand].filter(e => e != undefined)
                            if (interaction.inGuild() && command.guilds == undefined) {
                                const act = (interaction.isContextMenuCommand() ? "context menu " : "") + "executed"
                                console.log(`"${commandName.join(" ")}" ${act} by ${interaction.user.tag} in (#${interaction.channel.name})`)
                            }
                            // Execute
                            await command.execute(interaction)
                            break;
                        case InteractionType.ApplicationCommandAutocomplete:
                            // Execute
                            await command.autocomplete(interaction)
                            .catch(() => null)
                            break;
                    }
                    break;
				case InteractionType.MessageComponent:
					// Find file path with the ID of the component
					const button = interaction.client.buttons.get(interaction.customId);
					if (!button) return;

					// Log
					if (interaction.inGuild()) {
						console.log(`"${interaction.customId}" (component) executed by ${interaction.user.tag} in "${interaction.guild.name}" (#${interaction.channel.name})`)
					}

					// Execute
					await button.execute(interaction)
					break;
				case InteractionType.ModalSubmit:
					// Find file path with the ID of the component
					const modal = interaction.client.modals.get(interaction.customId);
					if (!modal) return;

					// Log
					if (interaction.inGuild()) {
						console.log(`"${interaction.customId}" (modal) submitted by ${interaction.user.tag} in "${interaction.guild.name}" (#${interaction.channel.name})`)
					}

					// Execute
					await modal.execute(interaction)
					break;
				default:
					break;
			}
            // Add to interaction count
            const interactions = DataHandler.LoadPath(['data', 'global', 'interactions']) || 0;
            DataHandler.SavePath(['data', 'global', 'interactions'], interactions + 1)
		} catch (error) {
			console.error(error)

            // If the interaction is repliable, reply with an error embed
            if (interaction.isRepliable()) {
                // Get the name of the command
                let commandName = undefined;
                switch (type) {
                    case InteractionType.ApplicationCommand:
                        const subcommandGroup = interaction.options.getSubcommandGroup(false)
                        const subcommand = interaction.options.getSubcommand(false)

                        commandName = [interaction.commandName,subcommandGroup,subcommand].filter(e => e != undefined).join(" ")
                        break;
                    case InteractionType.ModalSubmit:
                    case InteractionType.MessageComponent:
                        commandName = interaction.customId
                        break;
                    default:
                        commandName = "Unknown Command"
                        break;
                }

                // Create error log embed
                const cutError = error.toString().substring(0, 500)
                const embed = new EmbedBuilder()
                    .setColor(EmbedColors.Error)
                    .setTitle("Error Log:")
                    .setDescription("There was a problem with command: `" + commandName + "`\n```console\n" + cutError + "```")
                    .setFooter({
                        text: "If this is persistent, let the bot owner know."
                    })
                // Reply (If deferred, edit)
                if (interaction.deferred) {
                    await interaction.editReply({embeds:[embed]})
                } else {
                    await interaction.reply({embeds:[embed], ephemeral: true})
                }
            }
		}
	},
};