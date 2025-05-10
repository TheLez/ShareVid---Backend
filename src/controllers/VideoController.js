const videoService = require('../services/VideoService');

const uploadVideo = async (req, res) => {
    try {
        // Giả định rằng middleware đã xác thực và gán thông tin người dùng vào req.user
        const userid = req.user.userid; // Lấy userid từ token đã xác thực

        // Log thông tin người dùng và body của yêu cầu
        console.log('User ID:', userid);
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file); // Log tệp đã được tải lên

        // Kiểm tra xem tệp có được tải lên không
        if (!req.file) {
            return res.status(400).json({ error: 'Video file is required' });
        }

        const videoData = {
            title: req.body.title,
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
        console.error('Error uploading video:', error); // Log lỗi chi tiết
        res.status(500).json({ error: error.message });
    }
};

const getAllVideos = async (req, res) => {
    try {
        const videos = await videoService.getAllVideos();
        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error); // Log lỗi chi tiết
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
        console.error('Error fetching video by ID:', error); // Log lỗi chi tiết
        res.status(500).json({ error: error.message });
    }
};

const updateVideo = async (req, res) => {
    try {
        const videoid = req.params.videoid;
        const video = await videoService.getVideoById(videoid);

        // Kiểm tra quyền truy cập
        if (video.userid !== req.user.userid) {
            return res.status(403).json({ error: 'Bạn không có quyền cập nhật video này' });
        }

        const updatedVideo = await videoService.updateVideo(videoid, req.body);
        res.json(updatedVideo);
    } catch (error) {
        console.error('Error updating video:', error); // Log lỗi chi tiết
        res.status(500).json({ error: error.message });
    }
};

const deleteVideo = async (req, res) => {
    try {
        const videoid = req.params.videoid;
        const video = await videoService.getVideoById(videoid);

        // Kiểm tra quyền truy cập
        if (video.userid !== req.user.userid) {
            return res.status(403).json({ error: 'Bạn không có quyền xóa video này' });
        }

        await videoService.deleteVideo(videoid);
        res.status(204).send(); // Trả về status 204 No Content
    } catch (error) {
        console.error('Error deleting video:', error); // Log lỗi chi tiết
        res.status(500).json({ error: error.message });
    }
};

const searchVideo = async (req, res) => {
    const { title } = req.query; // Lấy tiêu đề từ query string

    try {
        const videos = await searchVideoByTitle(title);
        return res.status(200).json({
            status: 'OK',
            message: 'Tìm kiếm video thành công',
            data: videos,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'ERROR',
            message: error.message,
        });
    }
};

module.exports = {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    searchVideo
};