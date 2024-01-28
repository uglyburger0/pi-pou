const { EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('node:fs');
const path = require('node:path');
const { openai } = require("../openai.js");
const { EmbedColors } = require("../globals.js");

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