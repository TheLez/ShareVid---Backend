const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const FfmpegController = require('../controllers/FfmpegController');

const upload = multer({ dest: path.join(__dirname, '..', '..', 'uploads') });

router.post('/process', upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'image0', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
]), FfmpegController.processVideo);

module.exports = router;