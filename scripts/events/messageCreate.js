const { Events, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Channels, EmbedColors, development } = require('../globals.js');
const { openai, modPrompt, modPostPrompt, modTools } = require('../openai.js');

async function DeleteNonLink(message) {
    try {
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
    } catch {
        console.log(`Could not delete 3008-server message ${message.id}`)
    }
}

async function GetPouResponse(message) {
    if (development || message.channel.isDMBased()) return; // testing
    const guild = global.client.guilds.cache.get(message.guildId); if (!guild) return;
    const authorMember = guild.members.cache.get(message.author.id); if (!authorMember) return;
    if (!authorMember.permissions.has(PermissionFlagsBits.Administrator)) return;
    // content
    let content = message.content; content = content.toLowerCase();
    // reg ex ( ([a-z]+ )?pou, (.+) )
    // match 1 is the prefix
    // match 2 is the text the user asked for
    let introduction = content.matchAll(/(?:[a-z]+)?pou, (.+)/gs)
    introduction = Array.from(introduction)
    if (introduction.length == 0) return;
    let request = introduction[0][1]

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
    let conversation = [
        {role: "system", content: modPrompt},
        {role: "user", content: request}
    ]

    await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: conversation,
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
                let demoEmbed = new EmbedBuilder()
                .setTitle("Pou Moderation") // the function name
                .setDescription("Unfortunately your message could not invoke a moderation function.")
                .setFields(
                    {name: "Original Message", value: `"${message.content}"`}
                )
                .setColor(EmbedColors.Error)
                .setFooter({text: "This message will be deleted in 15 seconds."})

                // DM prompter a verification message, and wait for a response
                await message.author.createDM()
                .then(async dm => {
                    await dm.send({ embeds: [demoEmbed] })
                    .then(async sentMessage => {
                        // Delete the message after 5 seconds
                        setTimeout(async () => {
                            await sentMessage.delete()
                            .catch();
                        }, 15_000);
                    })
                })

                
                break;
            case "tool_calls": // A function has been invoked
                let func = pouMessage.tool_calls[0].function;
                let actionName = func.name
                let args = JSON.parse(func.arguments)
                // Reply with an ephemeral message showing the function and arguments
                let fields = []
                for (const [key, value] of Object.entries(args)) {
                    if (key == "user") {
                        fields.push({name: key, value: `<@${value}>`})
                    } else {
                        fields.push({name: key, value: `${value}`})
                    }
                }

                let embed = new EmbedBuilder()
                .setTitle(actionName) // the function name
                .setDescription(`"${message.content}"`) // what the user originally said
                .setFields(fields)
                .setColor(EmbedColors.Default)
                .setFooter({text: "Actions performed will have actual consequences. This is not a demo!"})

                // Create buttons
                let responseTarget = args.user
                let action = actionName == "moderate_user" ? args.action : actionName
                let oppositeAction = args.action == "kick" ? "ban" : "kick"
                let buttons = [
                    new ButtonBuilder()
                    .setCustomId("mod_deny")
                    .setLabel("No")
                    .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                    .setCustomId("mod_accept")
                    .setLabel(`Yes, ${action.toUpperCase()}`)
                    .setStyle(ButtonStyle.Success)
                ]
                if (actionName == "moderate_user") {
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
                async function actOnUser(actionId, buttonAction) {
                    // find GuildMember object
                    const targetMember = await guild.members.fetch(responseTarget)
                    .catch();
                    if (!targetMember) return;
                    let acted = false;

                    switch (buttonAction) {
                        case "kick":
                            await targetMember.kick(args.reason)
                            .then(() => acted = true)
                            .catch(error => console.log('Could not kick user: ', error));
                            console.log(`Actually kicking ${targetMember.user.username}`)
                            break;
                        case "ban":
                            await targetMember.ban({reason: args.reason})
                            .then(() => acted = true)
                            .catch(error => console.log('Could not ban user: ', error));
                            console.log(`Actually banning ${targetMember.user.username}`)
                            break;
                        case "timeout_user":
                            let timeoutDuration = args.duration * 1000
                            if (timeoutDuration < 0) {
                                timeoutDuration = 2419200000 // 28 days
                            }
                            await targetMember.disableCommunicationUntil(Date.now() + timeoutDuration, `${args.reason}`)
                            .then(() => acted = true)
                            .catch(error => console.log('Could not timeout user: ', error));
                            console.log(`Actually timing out ${targetMember.user.username}`)
                            break;
                        default:
                            break;
                    }

                    if (acted) {
                        // Add response to conversation
                        conversation.push(pouMessage)
                        conversation.push(
                            {
                                tool_call_id: pouMessage.tool_calls[0].id,
                                role: "tool",
                                name: actionId,
                                content: JSON.stringify(
                                    {
                                        user: targetMember.nickname ? targetMember.nickname : targetMember.user.username,
                                        action: buttonAction,
                                        reason: args.reason
                                    }
                                )
                            }
                        )
                        conversation[0].content = modPostPrompt;
                        // Generate one last GPT response with verification
                        await openai.chat.completions.create({
                            model: "gpt-3.5-turbo-1106",
                            messages: conversation
                        })
                        .then(response => {
                            let finalReply = response.choices[0].message
                            message.reply({ content: finalReply.content.toLowerCase() })
                        })
                    }
                }


                // DM prompter a verification message, and wait for a response
                await message.author.createDM()
                .then(async dm => {
                    const collectorFilter = i => i.user.id === message.author.id;
                    let sentDm = await dm.send({ embeds: [embed], components: [row] })
                    try {
                        const confirmation = await sentDm.awaitMessageComponent({ filter: collectorFilter, time: 35_000 });
                        
                        // If they accept, do the action
                        if (confirmation.customId == "mod_accept") {
                            message.react('<:pou:1200297209460178994>');
                            actOnUser(confirmation.customId, action)
                            await confirmation.update({ content: `Successfully acted \`${action}\` against <@${responseTarget}>`, components: [], embeds: [] })
                        
                        } else if (confirmation.customId == "mod_accept_secondary") {
                            message.react('<:pou:1200297209460178994>');
                            actOnUser(confirmation.customId, oppositeAction)
                            await confirmation.update({ content: `Successfully acted \`${oppositeAction}\` against <@${responseTarget}>`, components: [], embeds: [] })
                        
                        } else if (confirmation.customId == "mod_deny") {
                            await confirmation.update({ content: `Cancelled act \`${action}\` against <@${responseTarget}>`, components: [], embeds: [] })
                            // Delete the DM after 5 seconds
                            setTimeout(async () => {
                                await sentDm.delete()
                                .catch();
                            }, 5_000);

                        }
                    } catch (error) {
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

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
        DeleteNonLink(message);
        GetPouResponse(message);
	},
};