const { SlashCommandBuilder } = require('discord.js');
const os = require('node:os');
const { exec } = require('node:child_process');
const osType = os.type(); // Windows_NT, Linux, Darwin (macOS)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('health')
        .setDescription('Do a health check on the CPU'),
    async execute(interaction) {
        // Get CPU information
        switch (osType) {
            case "Windows_NT":
                await interaction.reply({content: `Windows is not supported yet!`});
                break;
            case "Linux":
                // Run `vcgencmd measure_temp` and get the temperature
                exec('vcgencmd measure_temp', async (err, stdout, stderr) => {
                    if (err) {
                        // Error
                        await interaction.reply({content: `Could not fetch information...`});
                        return;
                    }
                    // Get temperature
                    const temp = stdout.replace("temp=","").replace("'C\n","");
                    // Reply with information
                    await interaction.reply({content: `Temperature: ${temp}°C`});
                });
                break;
            }
        // Reply with information
        
    }
}