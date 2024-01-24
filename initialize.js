require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const commands = [] // These commands are global, and will be available across all servers, and in DMs.

// Chat commands
const commandPath = path.join(__dirname, 'scripts', 'commands');
const contextPath = path.join(__dirname, 'scripts', 'context');
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
const contextFiles = fs.readdirSync(contextPath).filter(file => file.endsWith('.js'));

// Add to array of commands
for (const file of commandFiles) {
    const filePath = path.join(commandPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}
// Add context menu actions to array of commands
for (const file of contextFiles) {
    const filePath = path.join(contextPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

// Determine if development or main
const args = process.argv.slice(2);
const token = args.includes('--dev') ? process.env.DEV_DISCORD_TOKEN : process.env.DISCORD_TOKEN;
const client = args.includes('--dev') ? process.env.DEV_CLIENT_ID : process.env.CLIENT_ID;

// Push to Discord
const rest = new REST({ version: '10' }).setToken(token);
console.log('Started deploying application (/) commands.');

rest.put(
    Routes.applicationCommands(client),
    { body: commands }
)
.then(() => console.log('Successfully registered application (/) commands.'))
.catch(console.error);