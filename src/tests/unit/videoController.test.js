const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const commonService = require('./../../service/commonService');
const { uploadVideo, trimVideo, mergeVideos, resizeVideo, getVideoByToken } = require('./../../service/videoService'); // Adjust the path as needed

jest.mock('fs');
jest.mock('fluent-ffmpeg');
jest.mock('./../../service/commonService');
jest.mock('sqlite3');
jest.setTimeout(200000);

describe('Video Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadVideo', () => {
        it('should successfully upload video if valid', async () => {
            const filename = 'test.mp4';
            const fileBuffer = Buffer.from('test data');
            const uniqueToken = 'abc123';
            const tokenExpiry = Date.now() + 3600000; // 1 hour later

            commonService.generateUniqueToken.mockReturnValue(uniqueToken);
            commonService.insertVideo.mockResolvedValue(1);
            ffmpeg.ffprobe.mockImplementation((path, callback) => callback(null, { format: { duration: 60 } }));
            fs.writeFileSync.mockImplementation(() => {});
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockImplementation(() => {});

            const result = await uploadVideo(filename, fileBuffer);

            expect(result).toHaveProperty('success', true);
            expect(result).toHaveProperty('link');
            expect(result.link).toContain(uniqueToken);
        });

        it('should throw error if file size exceeds maximum limit', async () => {
            const filename = 'test.mp4';
            const fileBuffer = Buffer.alloc(1024 * 1024 * 1024 + 1); // 1 GB file
            const MAX_SIZE = 1024 * 1024 * 1024; // 1 GB

            process.env.MAX_SIZE = MAX_SIZE;

            fs.writeFileSync.mockImplementation(() => {});

            await expect(uploadVideo(filename, fileBuffer))
                .rejects
                .toThrow(`File size exceeds the maximum limit of ${MAX_SIZE / (1024 * 1024)} MB.`);
        });

        // Add more tests for other cases...
    });

    describe('trimVideo', () => {
        it('should successfully trim video', async () => {
            const videoId = 1;
            const startTime = '00:00:10';
            const endTime = '00:00:20';
            const outputFilename = 'trimmed_video.mp4';
            const filename = 'test.mp4';
            const fileBuffer = Buffer.from('test data');

            commonService.getVideoById.mockResolvedValue({ filename, data: fileBuffer });
            fs.writeFileSync.mockImplementation(() => {});
            fs.unlinkSync.mockImplementation(() => {});
            ffmpeg.mockReturnValue({
                setStartTime: jest.fn().mockReturnThis(),
                setDuration: jest.fn().mockReturnThis(),
                output: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                run: jest.fn()
            });

            const result = await trimVideo(videoId, startTime, endTime, outputFilename);

            expect(result).toBe(`./${outputFilename}`);
        });

        // Add more tests for different cases...
    });

    describe('mergeVideos', () => {
        it('should successfully merge videos', async () => {
            const videoIds = [1, 2];
            const outputFilename = 'merged_video.mp4';
            const filename1 = 'video1.mp4';
            const filename2 = 'video2.mp4';
            const fileBuffer1 = Buffer.from('data1');
            const fileBuffer2 = Buffer.from('data2');

            commonService.getVideoById.mockImplementation(id => {
                if (id === 1) return Promise.resolve({ filename: filename1, data: fileBuffer1 });
                if (id === 2) return Promise.resolve({ filename: filename2, data: fileBuffer2 });
            });
            fs.writeFileSync.mockImplementation(() => {});
            fs.unlinkSync.mockImplementation(() => {});
            ffmpeg.mockReturnValue({
                input: jest.fn().mockReturnThis(),
                inputOptions: jest.fn().mockReturnThis(),
                outputOptions: jest.fn().mockReturnThis(),
                output: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                run: jest.fn()
            });

            const result = await mergeVideos(videoIds, outputFilename);

            expect(result).toBe(`./${outputFilename}`);
        });

        // Add more tests for different cases...
    });

    describe('resizeVideo', () => {
        it('should successfully resize video', async () => {
            const inputPath = './input.mp4';
            const outputPath = './output.mp4';
            const width = 1920;
            const height = 1080;

            ffmpeg.mockReturnValue({
                videoCodec: jest.fn().mockReturnThis(),
                size: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                save: jest.fn()
            });

            await resizeVideo(inputPath, outputPath, width, height);

            expect(ffmpeg).toHaveBeenCalledWith(inputPath);
            expect(ffmpeg().size).toHaveBeenCalledWith(`${width}x${height}`);
        });

        // Add more tests for different cases...
    });

    describe('getVideoByToken', () => {
        it('should return video path if token is valid', async () => {
            const token = 'abc123';
            const filename = 'test.mp4';
            const tokenExpiry = Date.now() + 3600000; // 1 hour later

            commonService.getVideo.mockResolvedValue({ filename, token_expiry: tokenExpiry });
            fs.existsSync.mockReturnValue(true);

            const result = await getVideoByToken(token);

            expect(result).toHaveProperty('success', true);
            expect(result).toHaveProperty('filePath', path.join(__dirname, 'videos', filename));
        });

        it('should return error if token is expired', async () => {
            const token = 'abc123';
            const filename = 'test.mp4';
            const tokenExpiry = Date.now() - 3600000; // 1 hour ago

            commonService.getVideo.mockResolvedValue({ filename, token_expiry: tokenExpiry });

            const result = await getVideoByToken(token);

            expect(result).toHaveProperty('success', false);
            expect(result).toHaveProperty('message', 'Link expired');
        });

        // Add more tests for different cases...
    });
});
