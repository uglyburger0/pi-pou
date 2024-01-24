const { EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('node:fs');
const path = require('node:path');
const { openai } = require("../openai.js");
const { EmbedColors } = require("../globals.js");

module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName('Transcribe Media')
        .setType(ApplicationCommandType.Message),
	async execute(interaction) {
		// Get attached media
		const media = interaction.options.getMessage('message').attachments.first();
		if (!media) return interaction.reply({content: "No media attached.", ephemeral: true});

		// Get file extension
		const ext = media.name.split('.').pop();

		// Is it a supported file type? (flac, mp3, mp4, mpeg, mpga, mp4a, ogg, wav, webm)
		if (!['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'mp4a', 'ogg', 'wav', 'webm'].includes(ext)) return interaction.reply({content: "Unsupported file type.", ephemeral: true});
		// Download file
		const file = await fetch(media.url).then(response => response.buffer());

		// Write file (transcription_unixtime.mp3) to disk
		const fileName = `./transcription_${Date.now()}.${ext}`;
		fs.writeFile(fileName, file, (err) => {
			if (err) throw err;	
		});

		// Start typing
		await interaction.deferReply();

		// Call Open AI. The file should be a valid PATH. The documentations use read streams.
		let transcription = undefined;
		try {
			transcription = await openai.audio.transcriptions.create({
				file: fs.createReadStream(fileName),
				prompt: "Pauses in lyrics should result in line breaks (\\n\\n).",
				model: "whisper-1"
			})
		} catch {
            // Return saying that the API call failed
            return interaction.editReply({content: "Content could not be transcribed.", ephemeral: true});
        }

		// Delete file
		fs.unlink(fileName, (err) => {
			if (err) throw err;
		});

		// Create an embed
		const limitedDescription = transcription.text.length > 4096 ? transcription.text.substring(0, 4092) + "..." : transcription.text;
		const embed = new EmbedBuilder()
			.setDescription(limitedDescription)
			.setColor(EmbedColors.Default)
			.setFields(
				{name: "Original Message", value: `[${media.name}](${interaction.options.getMessage('message').url})`}
            )

		// Reply with file extension
		console.log(transcription)
		await interaction.editReply({embeds: [embed]});
	}
};