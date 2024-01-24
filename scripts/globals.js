require('dotenv').config();
const development = process.argv.includes('--dev');

module.exports = {
    EmbedColors: {
        Default: development ? "#5b88c6" : "#c6995b",
        Error: "#ce4c4c",
        Success: "#4cce5e"
    }
}