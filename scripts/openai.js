const { OpenAI } = require('openai');

module.exports = {
    openai: new OpenAI({
        apiKey: process.env.OPENAI_TOKEN,
    })
}