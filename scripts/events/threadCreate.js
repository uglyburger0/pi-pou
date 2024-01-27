const { Events } = require('discord.js');
const { Channels, development } = require('../globals.js');

const emojis = {
    upvote: "<:upvote:975627835467247636>",
    downvote: "<:downvote:975627684707184671>"
}

async function ReactToSuggestion(thread) {
    if (thread.parentId != Channels['3008-suggestions']) return;
    // get starting message
    await thread.fetchStarterMessage().then(msg => {
        // react with 2 emojis
        msg.react(emojis.upvote)
        .then(() => msg.react(emojis.downvote))
        .catch(error => console.log('Could not fully react to suggestion: ', error));
    })
    .catch(error => console.log('Could not fetch starter message: ', error));
}

module.exports = {
	name: Events.ThreadCreate,
	async execute(thread, newlyCreated) {
        if (!newlyCreated || development) return;
        ReactToSuggestion(thread);
	},
};