require('dotenv').config();
const development = process.argv.includes('--dev');

module.exports = {
    development: development, // True if in development
    EmbedColors: {
        Default: development ? "#5b88c6" : "#c6995b",
        Error: "#ce4c4c",
        Success: "#4cce5e"
    },
    Channels: {
        '3008-servers': "737443294153408526",
        '3008-suggestions': '1019647344595185764'
    }
}