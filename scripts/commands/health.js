const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('node:os');
const { exec } = require('node:child_process');
const osType = os.type();

// Localization
const startTime = new Date();
const localization = new Intl.NumberFormat('en-US');

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
        const ramGB = Math.ceil(totalRam / 1024 / 1024 / 1024);
        
        info.push({name: "Total Memory", value: `${localization.format(ramGB)} GB`});
        // Get CPU information
        if (osType == "Linux") {
            exec('vcgencmd measure_temp', async (err, stdout, stderr) => {
                if (!err) {
                    const temp = stdout.replace("temp=","").replace("'C\n","");
                    info.push({name: "CPU Temp.", value: `${temp}°C`});
                }
            });   
        }
        
        // Reply with information
        let embed = new EmbedBuilder()
        embed.setTitle('Health Check')
        embed.setColor("#c6995b")
        embed.addFields(info)
        embed.setTimestamp(Date.now()) // Set the timestamp to the current time

        await interaction.reply({embeds: [embed]});
    }
}