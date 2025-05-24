const path = require('path');
const FfmpegService = require('../services/FfmpegService');

class FfmpegController {
    async processVideo(req, res) {
        try {
            const { video, image0, image1, image2, audio } = req.files;
            const { params } = req.body;

            const parsedParams = JSON.parse(params);
            const videoPath = video ? video[0].path : null;
            const imagePaths = [
                image0 ? image0[0].path : null,
                image1 ? image1[0].path : null,
                image2 ? image2[0].path : null,
            ].filter(path => path !== null);
            const audioPath = audio ? audio[0].path : null;
            const outputPath = path.join(__dirname, '..', '..', 'outputs', `output-${Date.now()}.mp4`);

            if (!videoPath) {
                throw new Error('Không có video được tải lên.');
            }

            await FfmpegService.processVideo({
                videoPath,
                imagePaths,
                audioPath,
                params: parsedParams,
                outputPath,
            });

            res.download(outputPath, 'output.mp4', (err) => {
                if (err) {
                    console.error('Lỗi khi gửi file:', err);
                    res.status(500).send('Lỗi khi tải file đầu ra.');
                }
                FfmpegService.cleanUp([videoPath, ...imagePaths, audioPath, outputPath]);
            });
        } catch (error) {
            console.error('Lỗi xử lý video:', error);
            res.status(500).send('Lỗi xử lý video.');
            FfmpegService.cleanUp([
                req.files.video ? req.files.video[0].path : null,
                req.files.image0 ? req.files.image0[0].path : null,
                req.files.image1 ? req.files.image1[0].path : null,
                req.files.image2 ? req.files.image2[0].path : null,
                req.files.audio ? req.files.audio[0].path : null,
            ]);
        }
    }
}

module.exports = new FfmpegController();