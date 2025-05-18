const videoService = require('../services/VideoService');

const uploadVideo = async (req, res) => {
    try {
        const userid = req.user.userid; // Lấy userid từ token đã xác thực

        if (!req.file) {
            return res.status(400).json({ error: 'Video file is required' });
        }

        const videoData = {
            title: req.body.title,
            created_at: req.body.created_at,
            videotype: req.body.videotype || 0,
            videoview: req.body.videoview || 0,
            videolike: req.body.videolike || 0,
            videodislike: req.body.videodislike || 0,
            videodescribe: req.body.videodescribe || '',
            status: req.body.status || 1,
            userid: userid,
        };

        const thumbnail = req.body.thumbnail || null;

        const video = await videoService.uploadVideo(req.file, thumbnail, videoData);
        res.status(201).json(video);
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: error.message });
    }
};

const getAllVideos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const videotype = req.query.type ? parseInt(req.query.type) : null; // Lấy loại video từ query
        const excludeId = req.query.exclude ? parseInt(req.query.exclude) : null;
        const orderByView = req.query.orderByView === 'true';

        // Kiểm tra loại video
        if (videotype !== null && isNaN(videotype)) {
            return res.status(400).json({ error: 'Invalid video type' });
        }

        const videos = await videoService.getAllVideos(videotype, page, limit, excludeId, orderByView);
        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: error.message });
    }
};

const getVideoById = async (req, res) => {
    try {
        const videoid = req.params.videoid;
        const userid = req.user.userid;

        const video = await videoService.getVideoById(videoid, userid);

        if (video) {
            res.json(video);
        } else {
            res.status(404).json({ error: 'Video not found' });
        }
    } catch (error) {
        console.error('Error fetching video by ID:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateVideo = async (req, res) => {
    try {
        const videoid = req.params.videoid;
        const video = await videoService.getVideoById(videoid);

        if (video.userid !== req.user.userid) {
            return res.status(403).json({ error: 'Bạn không có quyền cập nhật video này' });
        }

        const updatedVideo = await videoService.updateVideo(videoid, req.body);
        res.json(updatedVideo);
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteVideo = async (req, res) => {
    try {
        const videoid = req.params.videoid;
        const video = await videoService.getVideoById(videoid);

        if (video.userid !== req.user.userid) {
            return res.status(403).json({ error: 'Bạn không có quyền xóa video này' });
        }

        await videoService.deleteVideo(videoid);
        res.status(204).send(); // Trả về status 204 No Content
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: error.message });
    }
};

const searchVideo = async (req, res) => {
    const { title } = req.query; // Lấy tiêu đề từ query string
    const page = parseInt(req.query.page) || 1; // Mặc định là trang 1
    const limit = parseInt(req.query.limit) || 50; // Mặc định là 50 video

    try {
        const videos = await videoService.searchVideoByTitle(title, page, limit);
        return res.status(200).json(videos);
    } catch (error) {
        return res.status(500).json({
            status: 'ERROR',
            message: error.message,
        });
    }
};

const incrementView = async (req, res) => {
    const { videoid } = req.params;

    try {
        await videoService.incrementView(videoid);
        return res.status(200).json({ message: "Lượt xem đã được cập nhật." });
    } catch (error) {
        console.error("Lỗi khi cập nhật lượt xem:", error);
        return res.status(500).json({ message: "Không thể cập nhật lượt xem." });
    }
};

// Thêm phương thức lấy video theo type
const getVideosByType = async (req, res) => {
    const { videotype } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const excludeId = req.query.exclude ? parseInt(req.query.exclude) : null; // 🔥 Thêm dòng này

    try {
        const videos = await videoService.getVideosByType(videotype, page, limit, excludeId); // ✅ Truyền excludeId
        return res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching videos by type:', error);
        return res.status(500).json({ message: 'Có lỗi xảy ra' });
    }
};

const getVideosByUserId = async (req, res) => {
    try {
        const userid = req.params.userid; // Lấy từ URL: /account/get-videos/:userid
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const videos = await videoService.getVideosByUserId(userid, page, limit);

        res.json({
            status: 'OK',
            message: 'Lấy video thành công',
            data: videos,
        });
    } catch (error) {
        console.error('Error fetching videos by user ID:', error);
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    searchVideo,
    incrementView,
    getVideosByType, // Xuất phương thức mới
    getVideosByUserId
};