// models/videoSchema.js
const db = require('./../utils/db'); // Import the database connection

// Create the videos table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            data BLOB NOT NULL,
            token TEXT UNIQUE NOT NULL,
            token_expiry INTEGER NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table', err.message);
        } else {
            console.log('Videos table is ready.');
        }
    });
});
module.exports = db;