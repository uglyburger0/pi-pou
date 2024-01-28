const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName('Pin This as Pou')
        .setType(ApplicationCommandType.Message)
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
		// Get attached media
		const message = interaction.options.getMessage('message');
		// pin
		await message.pin()
		.then(() => {
			interaction.reply({content: "Pinned!", ephemeral: true});
		})
		.catch(() => {
			interaction.reply({content: "Could not pin message.", ephemeral: true});
		});
	}
};