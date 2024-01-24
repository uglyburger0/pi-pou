// Import "dotenv" for token stuff
require('dotenv').config();

// Determine if development or main
const args = process.argv.slice(2);
const token = args.includes('--dev') ? process.env.DEV_DISCORD_TOKEN : process.env.DISCORD_TOKEN;

// Import "fs" content
const fs = require('node:fs')
const path = require('node:path')

// Load folders
const commandPath = path.join(__dirname, 'scripts', 'commands');
const contextPath = path.join(__dirname, 'scripts', 'context');
const eventPath = path.join(__dirname, 'scripts', 'events');
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
const contextFiles = fs.readdirSync(contextPath).filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));

// Import "discord.js" for Discord.js API
const {Client, Collection, GatewayIntentBits} = require('discord.js');

// Create new client (we will log in later)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// For all of our commands
client.commands = new Collection(); // We will store all commands under here
for (const file of commandFiles) {
    const filePath = path.join(commandPath, file);
    const command = require(filePath);
    // Set into collection
    client.commands.set(command.data.name, command);
}

// For all of our context menu actions
// It is conjoined with normal commands, however is used in a different way
for (const file of contextFiles) {
    const filePath = path.join(contextPath, file);
    const command = require(filePath);
    // Set into collection
    client.commands.set(command.data.name, command);
}

// For all of our events
for (const file of eventFiles) {
	const filePath = path.join(eventPath, file);
	const event = require(filePath);
    // Create events for such
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Log in to Discord using token
client.login(token)