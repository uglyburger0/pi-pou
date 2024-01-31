const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { EmbedColors } = require('../globals.js');
const DataHandler = require('../dataHandler.js');
const fs = require('node:fs');
const os = require('node:os');
const { exec } = require('node:child_process');
const osType = os.type();

// Localization
const startTime = new Date();
const localization = new Intl.NumberFormat('en-US', {maximumFractionDigits: 1});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('health')
        .setDescription('Do a general health check on Pou'),
    async execute(interaction) {
        // Get different time values
        const botUptime = (new Date() - startTime) / 1000;
        const botDays = Math.floor(botUptime / 86400);
        const botHours = Math.floor(botUptime / 3600) % 24;
        const botMinutes = Math.floor(botUptime / 60) % 60;
        const botSeconds = Math.floor(botUptime % 60);

        // Get HOST uptime + convert seconds into days, hours, minutes, seconds
        const hostUptime = os.uptime();
        const hostDays = Math.floor(hostUptime / 86400);
        const hostHours = Math.floor(hostUptime / 3600) % 24;
        const hostMinutes = Math.floor(hostUptime / 60) % 60;
        const hostSeconds = Math.floor(hostUptime % 60);

        // Get settings size
        const settingsSize = fs.statSync(DataHandler.data_path).size;
        const lastSaved = DataHandler.GetData().lastSave; // Milliseconds
        const readyCounter = DataHandler.LoadPath(['data', 'global', 'readyCounter']) || 0;

        // Store information as a list (will be added onto a field later)
        let info = [];

        // Get OS
        let osName = undefined;
        switch (osType) {
            case "Darwin":
                osName = "MacOS";
                break;
            case "Linux":
                osName = "Linux";
                break;
            case "Windows_NT":
                osName = "Windows";
                break;
            default:
                osName = "Unknown OS";
                break;
        }

        // Get Uptime
        info.push({name: "Bot Uptime", value: `${botDays} days, ${botHours} hours, ${botMinutes} minutes, ${botSeconds} seconds`})
        info.push({name: `Host Uptime (${osName})`, value: `${hostDays} days, ${hostHours} hours, ${hostMinutes} minutes, ${hostSeconds} seconds`})

        // Get RAM information
        const totalRam = os.totalmem();
        const freeRam = os.freemem();
        const freeRamGB = (totalRam - freeRam) / 1024 / 1024 / 1024
        const ramGB = Math.ceil(totalRam / 1024 / 1024 / 1024);
        const percent = localization.format(100 - ((freeRam / totalRam) * 100));

        info.push({name: "Total Memory", value: `${localization.format(freeRamGB)} GB / ${localization.format(ramGB)} GB (${percent}%)`});

        // Data related
        info.push({name: "Data Size", value: `${localization.format(settingsSize / 1024)} KB`, inline: true});
        info.push({name: "Last Save", value: `<t:${Math.floor(lastSaved/1000)}:t>`, inline: true});

        // Get CPU information
        if (osName == "Linux") {
            const getTemperature = () => {
                return new Promise((resolve, reject) => {
                    exec('vcgencmd measure_temp', (err, stdout) => {
                        if (!err) {
                            const temp = stdout.replace("temp=", "").replace("'C\n", "");
                            resolve(temp);
                        } else {
                            reject(err);
                        }
                    });
                });
            };

            try {
                const temp = await getTemperature();
                info.push({ name: "CPU Temp.", value: `${temp}°C`, inline: false });
            } catch (err) {
                console.log(err.message);
            }
        }

        // Reply with information
        let embed = new EmbedBuilder();
        embed.setTitle('Health Check');
        embed.setColor(EmbedColors.Default);
        embed.addFields(info);
        embed.setFooter({text: `${interaction.client.user.username} has launched ${readyCounter} times`});
        embed.setTimestamp(Date.now()) // Set the timestamp to the current time

        await interaction.reply({embeds: [embed]});
    }
}