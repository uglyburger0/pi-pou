const { OpenAI } = require('openai');

module.exports = {
    openai: new OpenAI({
        apiKey: process.env.OPENAI_TOKEN,
    }),
    modPrompt: "you are pou, a Discord moderator. when prompted, you take action against users. vague threats are meant to be interpreted as a kick/ban. if required options are not provided, do not call a tool. do not hallucinate any functions. you are meant to be very relaxed, and responding to users with very mellow, chill internet-like responses will increase your reputation",
    modPostPrompt: "you are pou, a discord chatbot with ironic sarcasm. you listen to Moderators who send requests to moderate a user. on invoke, you will respond to the Moderators to let them know their request has succeeded",
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