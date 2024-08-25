const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const CONFIG = require('./../config/config');
const commonService = require('../service/commonService');
// Set the paths to ffmpeg and ffprobe

const ffmpegPath = process.env.FFMPEG_PATH;
const ffprobePath = process.env.FFPROBE_PATH;

const { MAX_SIZE, MIN_DURATION, MAX_DURATION, LINK_EXPIRY_DURATION } = require('./../config/config');

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
} else {
    console.error('FFMPEG_PATH environment variable not set.');
}

if (ffprobePath) {
    ffmpeg.setFfprobePath(ffprobePath);
} else {
    console.error('FFPROBE_PATH environment variable not set.');
}

require('./../../swagger')
/**
 * Original Author    : Ramesh R S 
 * Author		      : Ramesh R S 
 * Created On		  : 20-08-2024
 * Modified on        : 20-08-2024	
 * Function           : createAttendance
 *  Method createAttendance is used to create attendence 
 * @param {} data data which is used to create the attendence
 * @return response
 */

const uploadVideo = async function (filename, fileBuffer) {
    let tempFilePath = `./${filename}`;
    try {
        const fileSize = fileBuffer.length;

        // Validate file size
        if (fileSize > MAX_SIZE) {
            throw new Error(`File size exceeds the maximum limit of ${MAX_SIZE / (1024 * 1024)} MB.`);
        }

        // Save video to a temporary file for duration check
        fs.writeFileSync(tempFilePath, fileBuffer);

        // Check video duration
        const duration = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
                if (err) {
                    console.error('Error in ffprobe:', err);
                    return reject(new Error('Error processing video file'));
                }

                const videoDuration = metadata.format.duration;
                if (videoDuration < MIN_DURATION || videoDuration > MAX_DURATION) {
                    return reject(new Error(`Video duration must be between ${MIN_DURATION} and ${MAX_DURATION} seconds`));
                }

                resolve(videoDuration);
            });
        });
        const uniqueToken = commonService.generateUniqueToken(); // Implement this function as needed
        const token_expiry = Date.now() + CONFIG.LINK_EXPIRY_DURATION;

        // If duration is valid, insert video into database
        if (filename && fileBuffer && uniqueToken && token_expiry) {
            const videoId = await commonService.insertVideo(filename, fileBuffer, uniqueToken, token_expiry);
            const link = `http://localhost:3000/upload/verifyToken?uniqueToken=${uniqueToken}`;
            return {
                success: true,
                message: 'Video uploaded successfully',
                duration, videoId,
                link
            };
        }
    } catch (error) {
        console.error('Error:', error.message);
        throw new Error(error.message);
    } finally {
        // Clean up temporary file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
};

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
 * Author		      : Ramesh R S CEN(380)
 * Created On		  : 20-08-2024
 * Modified on        : 20-08-2024	
 * Function           : getVideoById
 *  Method getVideoById is used to get thee video by id
 * @param {} videoId data which is used to create the attendence
 * @return response
 */

const trimVideo = async function (videoId, startTime, endTime, outputFilename) {
    try {
        // Retrieve video file from database
        const { filename, data } = await commonService.getVideoById(videoId);
        const inputFilePath = `./${filename}`;
        fs.writeFileSync(inputFilePath, data);

        // Trim video
        const outputFilePath = `./${outputFilename}`;
        await new Promise((resolve, reject) => {
            ffmpeg(inputFilePath)
                .setStartTime(startTime)
                .setDuration(endTime - startTime)
                .output(outputFilePath)
                .on('end', () => resolve())
                .on('error', (err) => {
                    console.error('Error trimming video:', err);
                    reject(new Error('Error trimming video'));
                })
                .run();
        });

        if (fs.existsSync(inputFilePath)) {
            fs.unlinkSync(inputFilePath);
        }

        return outputFilePath;
    } catch (error) {
        console.error('Error:', error.message);
        throw new Error(error.message);
    }
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


const mergeVideos = async function (videoIds, outputFilename) {
    try {
        const targetWidth = 1920;  // Set your desired width
        const targetHeight = 1080; // Set your desired height

        if (videoIds && videoIds.length) {
            const videoFiles = [];
            const resizedFiles = [];

            // Resize each video to the target resolution
            for (const id of videoIds) {
                const { filename, data } = await commonService.getVideoById(id);
                const inputFilePath = `./${filename}`;
                const resizedFilePath = `./resized_${filename}`;

                fs.writeFileSync(inputFilePath, data);

                await resizeVideo(inputFilePath, resizedFilePath, targetWidth, targetHeight);

                videoFiles.push(resizedFilePath);
                fs.unlinkSync(inputFilePath); // Clean up original file
            }

            // Write file list for ffmpeg
            const fileListPath = './fileList.txt';
            fs.writeFileSync(fileListPath, videoFiles.map(file => `file '${file}'`).join('\n'));

            // Merge resized videos
            const outputFilePath = `./${outputFilename}`;
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(fileListPath)
                    .inputOptions(['-f', 'concat', '-safe', '0'])
                    .outputOptions('-c', 'copy')
                    .output(outputFilePath)
                    .on('end', () => {
                        console.log('Merging completed successfully.');
                        // Clean up temporary files
                        videoFiles.forEach(file => {
                            if (fs.existsSync(file)) {
                                fs.unlinkSync(file);
                            }
                        });
                        if (fs.existsSync(fileListPath)) {
                            fs.unlinkSync(fileListPath);
                        }
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error('Error merging videos:', err);
                        reject(new Error('Error merging videos'));
                    })
                    .run();
            });

            return outputFilePath;
        }
    } catch (error) {
        console.error('Error:', error.message);
        throw new Error(error.message);
    }
};



const resizeVideo = (inputPath, outputPath, width, height) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .videoCodec('libx264')
            .size(`${width}x${height}`)
            .on('end', () => {
                console.log(`Resized video saved to ${outputPath}`);
                resolve();
            })
            .on('error', (err) => {
                console.error('Error resizing video:', err);
                reject(err);
            })
            .save(outputPath);
    });
};


const getVideoByToken = async function (token) {
    if (!token) {
        throw new Error('Token is required');
    }

    try {
        const row = await commonService.getVideo(token);
        
        if (!row) {
            return {
                success: false,
                message: 'Video not found'
            };
        }

        // Check if the token is expired
        const currentTime = Date.now();
        if (currentTime > row.token_expiry) {
            return {
                success: false,
                message: 'Link expired'
            };
        }

        // Check if file_name is defined
        if (!row.filename) {
            return {
                success: false,
                message: 'File name is missing in your working directory'
            };
        }

        // Prepare video file path
        const videoPath = path.join(__dirname, 'videos', row.filename);

        // Check if file exists

        return {
            success: true,
            filePath: videoPath,

        };
    } catch (error) {
        console.error('Error fetching video:', error);
        throw new Error('Internal server error');
    }
};

module.exports = { uploadVideo, insertVideo, trimVideo, mergeVideos, resizeVideo , getVideoByToken};