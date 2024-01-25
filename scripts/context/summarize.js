const { ComponentType, ButtonStyle, EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { openai } = require('../openai.js');
const { EmbedColors } = require("../globals.js");

const nm = new Intl.NumberFormat('en-US');

// GPT function call that describes a respnse
const functions = [
	{
		name: "get_conversation",
		parameters: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "format_conversation",
		description: "Return the topic, emoji, and description that represents the conversation",
		parameters: {
			type: "object",
			properties: {
				topic: {
					type: "string",
					description: "A title that represents the conversation. Respond for an embed title."
				},
				emoji: {
					type: "string",
					description: "A single emoji that represents the conversation."
				},
				description: {
					type: "string",
					description: "A full synopsis/description of the conversation. Mentioning specific users would also work. If multiple conversations between different users are happening, try to review them separately. Results will not be guaranteed, and that is okay."
				},
				attitude: {
					type: "string",
					description: "A 3 sentence summary on the overall attitude of the conversation."
				},
			},
			required: ["topic", "emoji", "description", "attitude"]
		}
	}
]

module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName('Summarize Conversation')
        .setType(ApplicationCommandType.Message),
	async execute(interaction) {
		// Await reply
		await interaction.deferReply({ephemeral: true});

		// Get recent conversation
		const messages = await interaction.channel.messages.fetch({limit: 80, before: interaction.targetId});

		// Get the last
		const earliestMessage = messages.last();

		// Sort messages by date (earliest at index 0, latest at index length - 1)
		const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

		// Turn messages into a readable JSON object conversation
		const conversation = sortedMessages.map(message => {
			let data = {
				user: message.author.nickname || message.author.username,
				content: message.content,
			};
			if (message.attachments.size > 0) {
				data.attachments = true;
			}
			if (message.embeds.length > 0) {
				data.embeds = true;
			}
			if (message.author.bot) {
				data.bot = true;
			}
			return data
		});

		// Conjoin continuous messages from the same user into one message
		for (let i = 0; i < conversation.length; i++) {
			if (conversation[i].user == conversation[i + 1]?.user) {
				conversation[i].content += "\n" + conversation[i + 1].content;
				conversation.splice(i + 1, 1);
				i--;
			}
		}

		// Compile full JSON object
		const object = {
			server: interaction.guild.name,
			channel: interaction.channel.name,
			conversation: conversation,
		}
		
		// Get a response from OpenAI
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo-0613",
			messages: [
				{role: "system", content: "You are fully reviewing a conversation. \"Random\" or \"off-topic\" should not be the topic of the conversation."},
				{role: "function", name: "get_conversation", content: JSON.stringify(object)},
			],
			functions: functions,
			function_call: {name: "format_conversation"}
		})

		// Get response
		const result = response.choices[0].message;
		const arguments = JSON.parse(result.function_call.arguments);

		// Create Discord embed
		const embed = new EmbedBuilder()
			.setTitle(`${arguments.topic} ${arguments.emoji || ""}`)
			.setColor(EmbedColors.Default)
			.setDescription(arguments.description || "(User Generated Response)\nNo description was provided.")
			.addFields({
				name: "Attitude",
				value: arguments.attitude || "(User Generated Response)\nNo attitude was provided."
			})
			.setFooter({
				text: `${nm.format(conversation.length)} messages`
			})

		// Create button that links to the first message
		const component = {
            type: 1,
            components: [
                {
					type: ComponentType.Button,
					label: `Started from...`,
					style: ButtonStyle.Link,
					url: earliestMessage.url
				},
            ]
        }

		console.log


		// Reply with file extension
		await interaction.editReply({embeds: [embed], components: [component], ephemeral: true});
	}
};