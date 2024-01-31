const { SlashCommandBuilder } = require("discord.js");
const fetch = require('node-fetch');

// API dump URL from @MaximumADHD's Roblox Client Tracker
const urlDump = "https://raw.githubusercontent.com/MaximumADHD/Roblox-Client-Tracker/roblox/API-Dump.json";

module.exports = {
    // API Dump stuff
    cacheTime: 1000 * 60 * 60 * 6, // 6 hours
    apiCache: null, // CRITICAL - Cache the API dump to prevent spamming the API
    lastCached: null,

    data: new SlashCommandBuilder()
        .setName("roblox")
        .setDescription("Roblox related commands")

        .addSubcommand(subcommand => subcommand
            .setName('devex')
            .setDescription("Shows how much Robux would be in USD")

            .addIntegerOption(option => option
                .setName('robux')
                .setDescription('The amount of robux to convert')
                .setRequired(true)
            )

            .addBooleanOption(option => option
                .setName('reverse')
                .setDescription('Changes the system from USD to Robux')
            )
        )

        /*
        .addSubcommand(subcommand => subcommand
            .setName('screenshot')
            .setDescription("When the Roblox Renderer is open, it will take a screenshot of the game and send it.")
        )

        .addSubcommandGroup(group => group
            .setName('api')
            .setDescription('Roblox API related commands')
            .addSubcommand(subcommand => subcommand
                .setName('class')
                .setDescription('Gets the members, methods, or callbacks of a Roblox class.')

                .addStringOption(option => option
                    .setName('class')
                    .setDescription('The class to get data from.')
                    .setRequired(true)
                    .setAutocomplete(true)
                )

                .addBooleanOption(option => option
                    .setName('deprecated')
                    .setDescription('Whether to show deprecated members.')
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('enum')
                .setDescription('Gets the values of a Roblox Enum.')
    
                .addStringOption(option => option
                    .setName('enum')
                    .setDescription('The enum to get data from.')
                    .setRequired(true)
                    .setAutocomplete(true)
                )
            )
        )
        */
    ,
    getSecurity(security) {
        switch (security) {
            case 'RobloxScriptSecurity':
                return '`🚫 RobloxScriptSecurity`';
            case 'PluginSecurity':
                return '`🔌 PluginSecurity`';
            default:
                return null;
        }
    },
    getThreadSafety(threadSafety) {
        switch (threadSafety) {
            case 'Safe':
                return '`✅ Thread Safe`';
            case 'ReadSafe':
                return '`📖 Read Parallel`';
            case 'Unsafe':
                return '`❌ Not Thread Safe`';
            default:
                return null;
        }
    },
    getTag(tag) {
       switch (tag) {
            case 'ReadOnly':
                return '📖 Read Only';
            case 'NotReplicated':
                return '💻 Not Replicated';
            case 'Hidden':
                return '🫥 Hidden';
            case 'Deprecated':
                return '🛑 Deprecated';
            case 'NotBrowsable':
                return '📃 Not Browsable';
            case 'CustomLuaState':
                return '🧠 Custom Lua State';
            case 'CanYield':
                return '🧠 Can Yield';
            case 'NotScriptable':
                return '🔒 Not Scriptable';
            case 'Yields':
                return '⚠️ Yields';
            case 'NoYield':
                return '🚫⚠️ No Yield';
            case undefined:
                return '🔗 No Tags';
            default:
                return tag;
        }
    },
    async getAPIDump() {
        console.log("Roblox API dump received");
        await fetch(urlDump)
            .then(res => res.json())
            .then(json => {
                this.apiCache = json;
                this.lastCached = Date.now();
            })
            .catch(err => console.error("Could not get Roblox API dump.\n" + err));
    }
    ,
    async init(client) {
        this.getAPIDump();
    }
}