require('dotenv').config();
const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		// Log "we are ready!"
		console.log(`Ready! Logged in as ${client.user.tag}`);
	}
};