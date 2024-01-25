const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { EmbedColors } = require('../../globals.js')

// Something that turns "100000" into "$100,000.00"
const numberFormat = Intl.NumberFormat('en-US');
const currencyFormat = Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD'
});

module.exports = {
	async execute(interaction) {
		const reverse = interaction.options.getBoolean('reverse');
		let input = interaction.options.getInteger('robux');

		if (reverse) {
			// Turn usd into a static number
			usd = parseInt(input);
			
			// 100,000 robux is $350 usd. 1 robux is $0.0035 usd
			const robux = usd / 0.0035;

			// Create our embed
			const embed = new EmbedBuilder()
				.setColor(EmbedColors.Default)
				.addFields(
					{ name: "USD", value: currencyFormat.format(usd), inline: true},
					{ name: "Robux", value: numberFormat.format(robux), inline: true}
				)
				.setFooter({text:"This conversion uses Developer Exchange rates."})

			await interaction.reply({embeds:[embed]});

		} else {

			// Turn robux into a static number
			robux = parseInt(input);

			// 100,000 robux is $350 usd. 1 robux is $0.0035 usd
			const usd = robux * 0.0035;

			// Create our embed
			const embed = new EmbedBuilder()
                .setColor(EmbedColors.Default)
				.addFields(
					{ name: "Robux", value: numberFormat.format(robux), inline: true},
					{ name: "USD", value: currencyFormat.format(usd), inline: true}
				)
				.setFooter({text:"This conversion uses Developer Exchange rates."})

			await interaction.reply({embeds:[embed]});
		}
	}
};