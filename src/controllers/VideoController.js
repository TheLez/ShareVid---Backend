const videoService = require('./videoService');

const uploadVideo = async (req, res) => {
    try {
        // Giả định rằng middleware đã xác thực và gán thông tin người dùng vào req.user
        const userid = req.user.userid; // Lấy userid từ token đã xác thực

        const videoData = {
            title: req.body.title,
            videotype: req.body.videotype,
            videoview: req.body.videoview,
            videolike: req.body.videolike,
            videodislike: req.body.videodislike,
            videodescribe: req.body.videodescribe,
            status: req.body.status,
            userid: userid, // Sử dụng userid từ token
        };

        const video = await videoService.uploadVideo(req.file, req.body.thumbnail ? req.body.thumbnail : null, videoData);
        res.status(201).json(video);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllVideos = async (req, res) => {
    try {
        const videos = await videoService.getAllVideos();
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getVideoById = async (req, res) => {
    try {
        const video = await videoService.getVideoById(req.params.videoid);
        if (video) {
            res.json(video);
        } else {
            res.status(404).json({ error: 'Video not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateVideo = async (req, res) => {
    try {
        const videoid = req.params.videoid;
        const video = await videoService.getVideoById(videoid);

        // Kiểm tra xem userid của video có khớp với userid từ token không
        if (video.userid !== req.user.userid) {
            return res.status(403).json({ error: 'Bạn không có quyền cập nhật video này' });
        }

        const updatedVideo = await videoService.updateVideo(videoid, req.body);
        res.json(updatedVideo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteVideo = async (req, res) => {
    try {
        const videoid = req.params.videoid;
        const video = await videoService.getVideoById(videoid);

        // Kiểm tra xem userid của video có khớp với userid từ token không
        if (video.userid !== req.user.userid) {
            return res.status(403).json({ error: 'Bạn không có quyền xóa video này' });
        }

        await videoService.deleteVideo(videoid);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo
};