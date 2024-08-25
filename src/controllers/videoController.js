const router = require('express').Router({ mergeParams: true });
const videoService = require('./../service/videoService');
const path = require('path');
const multer = require('multer');
const authenticateToken = require('./../middleware/auth'); // Ensure this path is correct

const upload = multer({
    storage: multer.memoryStorage()
});



const uploadVideo = async function (req, res) {

    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const result = await videoService.uploadVideo(file.originalname, file.buffer);
        res.status(200).json(result);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const trimmVideo = async function (req, res) {
    if (req && req.body) {
        const data = req.body;
        try {
            const result = await videoService.trimVideo(data.videoId, data.startTime, data.endTime, data.outputFilename);
            res.status(200).json(result);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
};

const mergeVideo = async function (req, res) {
    if (req && req.body) {
        const videoIds = req.body?.videoIds;
        const outputFilename = req.body?.outputFilename;
        try {
            const result = await videoService.mergeVideos(videoIds, outputFilename );
            res.status(200).json(result);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
};


const getVideoByToken = async function (req, res) {
    const { uniqueToken } = req?.query;
    if (uniqueToken) {
        try {
            const result = await videoService.getVideoByToken(uniqueToken);
            res.status(200).json(result);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
};

router.post('', authenticateToken ,upload.single('file'), uploadVideo);
router.post('/trim', authenticateToken,trimmVideo);
router.post('/merge', authenticateToken,mergeVideo);
router.get('/verifyToken', getVideoByToken); 

module.exports = { router, uploadVideo, trimmVideo ,getVideoByToken};