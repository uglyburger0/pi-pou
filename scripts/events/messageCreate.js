const { Events, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Channels, EmbedColors, development } = require('../globals.js');
const { openai, modPrompt, modTools } = require('../openai.js');

async function DeleteNonLink(message) {
    if (message.channelId != Channels['3008-servers'] || development) return;
    // if there is not a link in the message
    if (!message.content.match(/https:\/\/www\.roblox\.com\/share\?code=[a-zA-Z0-9]+&type=Server/g)) {
        // delete the message
        try {
            message.delete();
        } catch {
            console.log(`Could not delete 3008-server message ${message.id}`)
        }
    }
}

async function GetPouResponse(message) {
    if (!development) return; // testing
    const guild = global.client.guilds.cache.get(message.guildId); if (!guild) return;
    const member = guild.members.cache.get(message.author.id); if (!member) return;
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) return;
    // content
    let content = message.content; content = content.toLowerCase();
    if (content.startsWith("pou,")) {
        // Get a string of the users request
        let request = content.substring(4).trim();

        // If replying to a message, fetch it
        let inReplyTo = null;
        try {
            inReplyTo = await message.fetchReference()
        } catch {
            inReplyTo = null;
        }
        if (inReplyTo) {
            const target = inReplyTo.author.id;
            request = request + ` (replying to ${target})`
        }

        // Let openai know
        await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [
                {role: "system", content: modPrompt},
                {role: "user", content: request}
            ],
            tools: modTools,
            tool_choice: "auto"
        })
        .then(async response => {
            // get finish reason
            let choice = response.choices[0]
            let reason = choice.finish_reason;
            let pouMessage = choice.message
            
            // consider response
            switch (reason) {
                case "stop": // There was no function called, this is a normal reply
                    break;
                case "tool_calls": // A function has been invoked
                    let func = pouMessage.tool_calls[0].function;
                    let actionName = func.name
                    let arguments = JSON.parse(func.arguments)
                    // Reply with an ephemeral message showing the function and arguments
                    let fields = []
                    for (const [key, value] of Object.entries(arguments)) {
                        if (key == "user") {
                            fields.push({name: key, value: `<@${value}>`})
                        } else {
                            fields.push({name: key, value: `${value}`})
                        }
                    }

                    let embed = new EmbedBuilder()
                    .setTitle(actionName)
                    .setFields(fields)
                    .setColor(EmbedColors.Default)

                    // Create buttons
                    let action = actionName == "moderate_user" ? arguments.action : actionName
                    let oppositeAction = arguments.action == "kick" ? "ban" : "kick"
                    let buttons = [
                        new ButtonBuilder()
                        .setCustomId("mod_deny")
                        .setLabel("No")
                        .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                        .setCustomId("mod_accept")
                        .setLabel("Yes")
                        .setStyle(ButtonStyle.Success)
                    ]
                    if (action == "moderate_user") {
                        buttons.push(
                            new ButtonBuilder()
                            .setCustomId("mod_accept_secondary")
                            .setLabel(`Yes, ${oppositeAction.toUpperCase()} Instead`)
                            .setStyle(ButtonStyle.Secondary)
                        )
                    }
                    
                    // Create a row
                    let row = new ActionRowBuilder()
                    .addComponents(buttons)

                    // Local function for acting upon
                    async function actOnUser(message, targetMember, action, reason) {
                        switch (action) {
                            case "kick":
                                console.log(`Actually kicking ${targetMember.user.username}`)
                                break;
                            case "ban":
                                console.log(`Actually banning ${targetMember.user.username}`)
                                break;
                            case "timeout":
                                console.log(`Actually timing out ${targetMember.user.username}`)
                                break;
                            default:
                                break;
                        }
                    }


                    // DM prompter a verification message, and wait for a response
                    await message.author.createDM()
                    .then(async dm => {
                        const collectorFilter = i => i.user.id === message.author.id;
                        let sentDm = await dm.send({ embeds: [embed], components: [row] })
                        try {
                            const confirmation = await sentDm.awaitMessageComponent({ filter: collectorFilter, time: 20_000 });
                            // If they accept, do the action
                            if (confirmation.customId == "mod_accept") {
                                message.react('<:pou:1200297209460178994>');
                                actOnUser(message, member, action, arguments.reason)
                                await confirmation.update({ content: "The Deed Has Been Done", components: [], embeds: [] })
                            } else if (confirmation.customId == "mod_accept_secondary") {
                                message.react('<:pou:1200297209460178994>');
                                await confirmation.update({ content: "The Deed Has Been Done  Kind of Differently", components: [], embeds: [] })
                            } else if (confirmation.customId == "mod_deny") {
                                await confirmation.update({ content: "Pussy", components: [], embeds: [] }) 
                            }
                        } catch (error) {
                            console.log(error)
                            await sentDm.delete()
                            .catch(error => console.log('Could not delete DM: ', error));
                        }
                    })

                    break;

                default: // This should not happen
                    console.log("Could not get finish reason")
                    break;
            }
        })
        .catch(error => console.log('Could not get OpenAI response: ', error));
    }
}

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
        DeleteNonLink(message);
        GetPouResponse(message);
	},
};