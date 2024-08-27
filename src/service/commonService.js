const crypto = require('crypto');
const db = require('./../utils/db');



/**
 * Generates a unique token.
 * @returns {string} - A unique token string.
 */
function generateUniqueToken() {
    return crypto.randomBytes(16).toString('hex'); // Generates a 32-character hexadecimal string
}

/**
 * Inserts a video into the database with token and expiry information.
 * @param {string} filename - The name of the video file.
 * @param {Buffer} fileBuffer - The buffer of the video file.
 * @param {string} token - The unique token for the video.
 * @param {number} expiryTimestamp - The timestamp when the link expires.
 * @returns {Promise<number>} - The ID of the inserted video.
 */

const insertVideo = async function (filename, fileBuffer, token, token_expiry) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO videos (filename, data, token, token_expiry) VALUES (?, ?, ?, ?)`;
        db.run(sql, [filename, fileBuffer, token, token_expiry], function (err) {
            if (err) {
                console.error('Error inserting video:', err.message);
                return reject(err);
            }
            resolve(this.lastID); // Return the ID of the inserted video
        });
    });
};


/**
 * Original Author    : Ramesh R S CEN(380)
 * Author		      : Ramesh R S CEN(380)
 * Created On		  : 20-08-2024
 * Modified on        : 20-08-2024	
 * Function           : getVideoById
 *  Method getVideoById is used to get thee video by id
 * @param {} videoId data which is used to create the attendence
 * @return response
 */


const getVideoById = async function (videoId) {

    return new Promise((resolve, reject) => {
        db.get('SELECT filename, data FROM videos WHERE id = ?', [videoId], (err, row) => {
            if (err) return reject(err);
            if (!row) return reject(new Error('Video not found'));
            resolve(row);
        });
    });

}
const getVideo = async function (token) {
    try {
        return await new Promise((resolve, reject) => {
            db.get('SELECT * FROM videos WHERE token = ?', [token], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        throw new Error('Error fetching video')
    }
}
module.exports = { insertVideo, generateUniqueToken, getVideoById, getVideo };
