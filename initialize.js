require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const commands = [] // These commands are global, and will be available across all servers, and in DMs.

// Chat commands
const commandPath = path.join(__dirname, 'scripts', 'commands');
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

// Add to array of commands
for (const file of commandFiles) {
    const filePath = path.join(commandPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

// Push to Discord
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
console.log('Started deploying application (/) commands.');

rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
)
.then(() => console.log('Successfully registered application (/) commands.'))
.catch(console.error);