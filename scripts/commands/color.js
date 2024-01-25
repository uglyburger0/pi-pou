const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { EmbedColors } = require('../globals.js');
const fetch = require('node-fetch');
const Color = require('color');
const colorString = require('color-string');

const colorApi = "https://www.thecolorapi.com/id?hex=";
const imageApi = color => `https://singlecolorimage.com/get/${color}/400x400`;
const localization = new Intl.NumberFormat('en-US', {'maximumFractionDigits': 0});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Info on color')
        .addStringOption(option => option
            .setName('color')
            .setDescription('The color to get info on. Supports hex, rgb, and hsl.')
        )
        ,
    async execute(interaction) {
        // Get color information
        let userColor = interaction.options.getString('color');
        let colorObject = undefined;
        try {
            // if a hex code and doesn't have # add to beginning
            if (userColor.length == 6) {
                userColor = '#' + userColor;
            }
            colorObject = Color(userColor);
        } catch (error) {
            // I dont want it to do anything but i have no option
        }

        // If no valid color, generate random color
        if (!colorObject || !userColor) {
            // Generate random color
            colorObject = Color.rgb(
                Math.floor(Math.random() * 255),
                Math.floor(Math.random() * 255),
                Math.floor(Math.random() * 255)
            )
        }

        // Call THE COLOR API.
        const hex = colorObject.hex().substring(1);
        const rgb = colorObject.rgb().array();
        const hsl = colorObject.hsl().array();
        const cmyk = colorObject.cmyk().array();

        let colorApiResult = await fetch(colorApi + hex).then(res => res.json());

        // Reply with information
        let embed = new EmbedBuilder()
        embed.setTitle(colorApiResult.name.value)
        embed.setThumbnail(imageApi(hex))
        embed.setColor(hex)
        embed.setFields(
            {name: "Hex", value: `#${hex}`},
            {name: "RGB", value: `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`},
            {name: "HSV", value: `${localization.format(hsl[0])}, ${localization.format(hsl[1])}%, ${localization.format(hsl[2])}%`},
            {name: "CMYK", value: `${localization.format(cmyk[0])}%, ${localization.format(cmyk[1])}%, ${localization.format(cmyk[2])}%, ${localization.format(cmyk[3])}%`},

        )
        embed.setTimestamp(Date.now()) // Set the timestamp to the current time

        await interaction.reply({embeds: [embed]});
    }
}