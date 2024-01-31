// node modules
const fs = require('node:fs');
const path = require('node:path');

// Path
const DATA_NAME = "data.pou";
const DATA_PATH = path.join(__dirname, "..", DATA_NAME);

// Consts
const SAVE_INTERVAL = 1000 * 60 * 5; // 5 minutes = autosave
const DEFAULT_DATA = {
    "lastSave": Date.now(), // A timestamp of the previous save
    "data": {
        "servers": {},
        "global": {
            "readyCounter": 0,
            "interactions": 0,
        }
    }
}

// data
let data = DEFAULT_DATA;

module.exports = {
    data_path: DATA_PATH,
    default_data: DEFAULT_DATA,
    // Data access (from file system)
    WriteRawDataToFile: function(writeTo) {
        if (writeTo == undefined) {
            data.lastSave = Date.now();
            writeTo = data;
        }
        fs.writeFile(DATA_PATH, JSON.stringify(writeTo), (err) => {
            if (err) {
                throw err
            } else {
                const size = fs.statSync(DATA_PATH).size
                console.log(`(DATA) Data written to file. Size: ${size} bytes.`)
            }
        });
    },
    GetRawDataFile: function() {
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        return JSON.parse(data);
    },

    // Data access (cached. Use this)
    GetData: function() {
        return data;
    },
    SetData: function(newData) {
        data = newData;
        return data;
    },

    // Path-specific data access (cached)
    LoadPath: function(path) {
        // Load settings from file
        let loadedData = data
        for (let i = 0; i < path.length; i++) {
            loadedData = loadedData[path[i]]
            // If the setting is undefined, return undefined
            if (loadedData == undefined) return undefined
        }
        return loadedData
    },
    SavePath: function(path, value) {
        // Save settings to file
        // Get the path to the setting
        let loadedData = data
        for (let i = 0; i < path.length - 1; i++) {
            const directory = path[i]
            // If it's the last, we want it to be set to `value`
            // Set place to an empty object
            if (i != path.length - 1 && loadedData[directory] == undefined) {
                loadedData[directory] = {}
            }
            loadedData = loadedData[directory]
        }
        // Set the value
        loadedData[path[path.length - 1]] = value
        // Log the change
        //console.log(`(SETTINGS) Changed ROOT/${path.join("/")} to ${value}`)
    },

    // Initialize
    Initialize: function() {
        return new Promise((resolve, reject) => {
            // Load data from file
            try {
                fs.accessSync(DATA_PATH, fs.constants.F_OK)
                data = this.GetRawDataFile()
                const size = fs.statSync(DATA_PATH).size
                console.log(`Loaded data from file. Size: ${size} bytes`)
            } catch (error) {
                this.WriteRawDataToFile(DEFAULT_DATA)
                console.log("Failed to find data. Created new data file")
            }

            // Autosave
            setInterval(() => {
                fs.writeFileSync(DATA_PATH, JSON.stringify(data));
            }, SAVE_INTERVAL);

            resolve(data);
        });
    }
}