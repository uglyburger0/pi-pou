require('dotenv').config();
const { Events, PresenceUpdateStatus, ActivityType } = require('discord.js');
const DataHandler = require('../dataHandler.js');

const counterPath = ['data', 'global', 'readyCounter'];

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
		
		// Initialize data handler
		await DataHandler.Initialize();
		// Increase the client's ready counter by 1
		const counter = DataHandler.LoadPath(counterPath) || 0;
		DataHandler.SavePath(counterPath, counter + 1)
		DataHandler.WriteRawDataToFile();

		// Log "we are ready!"
		console.log(`Ready! Logged in as ${client.user.tag}`);
	}
};