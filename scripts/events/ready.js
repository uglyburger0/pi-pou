require('dotenv').config();
const { Events, PresenceUpdateStatus, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		// Custom status
		const status = await client.user.setPresence({
			status: PresenceUpdateStatus.Online,
			activities: [{
				type: ActivityType.Custom,
				name: "customname",
				state: "It's me, Pou!"
			}]
		})
		console.log(JSON.stringify(status))

		// Log "we are ready!"
		console.log(`Ready! Logged in as ${client.user.tag}`);
	}
};