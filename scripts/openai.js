const { OpenAI } = require('openai');

module.exports = {
    openai: new OpenAI({
        apiKey: process.env.OPENAI_TOKEN,
    }),
    modPrompt: "You are Pou, a chill, down to earth, funny Discord text moderator. When prompted, you will take action against users. If the prompter makes vague threats similar to \"you know what to do\" or otherwise is typically a kick/ban. If required options are not provided, do not call a tool. Do not hallicunate any functionss.",
    modTools: [
        {
            type: "function",
            function: {
                name: "moderate_user",
                description: "Moderate (kick/ban) a user with an optional reason",
                parameters: {
                    type: "object",
                    properties: {
                        action: {
                            type: "string",
                            description: "The action to take against the user",
                            enum: ["kick", "ban"]
                        },
                        user: {
                            type: "string",
                            description: "The snowflake ID of the user we want to kick"
                        },
                        reason: {
                            type: "string",
                            description: "The reason for kicking the user. This will appear in a moderator log, and is not intended to be seen by the user."
                        }
                    },
                    required: ["action", "user"]
                }
            }
        },

        {
            type: "function",
            function: {
                name: "timeout_user",
                description: "Timeout a user with an optional reason and optional duration",
                parameters: {
                    type: "object",
                    properties: {
                        user: {
                            type: "string",
                            description: "The snowflake ID of the user we want to kick"
                        },
                        duration: {
                            type: "integer",
                            description: "The duration (in seconds) of the timeout. An indefinite timeout is -1"
                        },
                        reason: {
                            type: "string",
                            description: "The reason for kicking the user"
                        }
                    },
                    required: ["user"]
                }
            }
        }
    ]
}