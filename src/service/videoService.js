const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const db = require('./../utils/db');

// Set the paths to ffmpeg and ffprobe
ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:\\ffmpeg\\bin\\ffprobe.exe');

const MIN_DURATION = 5;
const MAX_DURATION = 25;
const MAX_SIZE = 25 * 1024 * 1024;


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

        // If duration is valid, insert video into database
        const videoId = await insertVideo(filename, fileBuffer);

        return {
            success: true,
            message: 'Video uploaded successfully',
            duration, videoId
        };
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
 * Original Author    : Ramesh R S CEN(380)
 * Author		      : Ramesh R S CEN(380)
 * Created On		  : 20-08-2024
 * Modified on        : 20-08-2024	
 * Function           : createAttendance
 *  Method createAttendance is used to create attendence 
 * @param {} data data which is used to create the attendence
 * @return response
 */

const insertVideo = async function (filename, fileBuffer) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO videos (filename, data) VALUES (?, ?)', [filename, fileBuffer], function (err) {
            if (err) return reject(err);
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

const trimVideo = async function (videoId, startTime, endTime, outputFilename) {
    try {
        // Retrieve video file from database
        const { filename, data } = await getVideoById(videoId);
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


const getVideoById = async function (videoId) {

    return new Promise((resolve, reject) => {
        db.get('SELECT filename, data FROM videos WHERE id = ?', [videoId], (err, row) => {
            if (err) return reject(err);
            if (!row) return reject(new Error('Video not found'));
            resolve(row);
        });
    });

}


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
                const { filename, data } = await getVideoById(id);
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

module.exports = { uploadVideo, insertVideo, getVideoById, trimVideo, mergeVideos ,resizeVideo};