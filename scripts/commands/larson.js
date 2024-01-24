const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { EmbedColors } = require('../globals.js');
const localization = new Intl.NumberFormat('en-US');

const fs = require('node:fs')
const path = require('node:path')
const fetch = require('node-fetch');
const larsonDomain = 'https://daniellarson.wiki';
const larsonWiki = larsonDomain + '/index.php/Main_Page';

function convertHtmlToMarkdown(html) {
    return html.replace(/<a href="([^"]+)".*?>(.*?)<\/a>/g, function(match, p1, p2) {
        return `[${p2}](${larsonDomain}${p1})`;
    });
}

let bodyCache = undefined;
let lastUpdated = Date.UTC(1970, 1, 1);

async function getBody() {
    let timeSinceLastUpdate = Date.now() - lastUpdated;
    // if been 2 hours
    if (timeSinceLastUpdate > 7200000) {
        // update
        await fetch(larsonWiki).then(res => res.text()).then(body => {
            bodyCache = body;
            lastUpdated = Date.now();
        });
        return bodyCache;
    } else {
        return bodyCache;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('larson')
        .setDescription('Evaluate the recent events of Daniel Larson'),
    async execute(interaction) {
        // Await response
        await interaction.deferReply();
        // Get body
        let body = await getBody();

        // keep table
        let eventField = [];

        // look for "wikitable" class
        const tableStart = body.indexOf('<table class="wikitable" width="100%">');
        const tableEnd = body.indexOf('</table>');
        const table = body.substring(tableStart, tableEnd);

        // parse table into fields
        // remove all <tr> tags
        let rows = table.split('<tr>');
        rows.shift(); // remove first element (states wikitable)

        // for all rows;
        for (const row of rows) {
            if (row.includes('colspan')) {
                continue;
            }
            // get date
            const dateStart = row.indexOf('<th>');
            const dateEnd = row.indexOf('</th>');
            const date = row.substring(dateStart, dateEnd).replace('<th>', '');

            // get event
            const eventStart = row.indexOf('<td>');
            const eventEnd = row.indexOf('</td>');
            let event = row.substring(eventStart, eventEnd).replace('<td>', '');
            if (!event.includes('id="cite')) {
                event = convertHtmlToMarkdown(event);
            } else {
                // remove citation (<sup at the end)
                event = event.substring(0, event.indexOf('<sup'));
            }

            // add to field
            eventField.push({name: date, value: event});
        }

        // build larson embed
        let embed = new EmbedBuilder()
        embed.setTitle('Recent Daniel Larson Events')
        embed.setColor(EmbedColors.Default)
        embed.addFields(eventField)
        embed.setTimestamp(Date.now()) // Set the timestamp to the current time

        await interaction.editReply({embeds: [embed]})
    }
}