const VideoService = require('../services/VideoService');

const uploadVideo = async (req, res) => {
    try {
        const userid = req.user?.userid; // Lấy userid từ token đã xác thực
        if (!userid) {
            return res.status(401).json({ error: 'Yêu cầu xác thực.' });
        }

        const videoFile = req.files?.video?.[0];
        const thumbnailFile = req.files?.thumbnail?.[0];

        if (!videoFile) {
            return res.status(400).json({ error: 'Tệp video là bắt buộc.' });
        }

        const videoData = {
            title: req.body.title,
            created_at: req.body.created_at ? new Date(req.body.created_at) : new Date(),
            videotype: parseInt(req.body.videotype) || 0,
            videoview: parseInt(req.body.videoview) || 0,
            videolike: parseInt(req.body.videolike) || 0,
            videodislike: parseInt(req.body.videodislike) || 0,
            videodescribe: req.body.videodescribe || '',
            status: parseInt(req.body.status) || 1,
            userid: userid,
        };

        // Kiểm tra các trường bắt buộc
        if (!videoData.title) {
            return res.status(400).json({ error: 'Tiêu đề video là bắt buộc.' });
        }

        const video = await VideoService.uploadVideo(videoFile, thumbnailFile, videoData);
        res.status(201).json(video);
    } catch (error) {
        console.error('❌ Controller: Error uploading video:', error.message);
        res.status(500).json({ error: 'Không thể tải video lên.' });
    }
};

const getAllVideos = async (req, res) => {
    console.log('getAllVideos called with:', { req: !!req, res: !!res }); // Debug

    // Kiểm tra req và res
    if (!req || !req.query || !res || typeof res.status !== 'function') {
        console.error('❌ Controller: Invalid req or res object:', { req, res });
        return res && typeof res.status === 'function'
            ? res.status(500).json({ error: 'Lỗi server: Yêu cầu không hợp lệ.' })
            : { status: 'ERROR', message: 'Yêu cầu không hợp lệ.' };
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const videotype = req.query.type ? parseInt(req.query.type) : null;
        const excludeId = req.query.exclude ? parseInt(req.query.exclude) : null;
        const orderByView = req.query.orderByView === 'true';
        const search = req.query.search ? req.query.search.trim() : null;

        // Kiểm tra tham số
        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return res.status(400).json({ error: 'Trang hoặc giới hạn không hợp lệ.' });
        }
        if (videotype !== null && isNaN(videotype)) {
            return res.status(400).json({ error: 'Loại video không hợp lệ.' });
        }
        if (excludeId !== null && (isNaN(excludeId) || excludeId <= 0)) {
            return res.status(400).json({ error: 'ID loại trừ không hợp lệ.' });
        }
        if (search && typeof search !== 'string') {
            return res.status(400).json({ error: 'Từ khóa tìm kiếm không hợp lệ.' });
        }

        console.log('getAllVideos params:', { page, limit, videotype, excludeId, orderByView, search }); // Debug
        const videos = await VideoService.getAllVideos(videotype, page, limit, excludeId, orderByView, search);
        res.status(200).json(videos);
    } catch (error) {
        console.error('❌ Controller: Error fetching videos:', error.message, error.stack);
        res.status(500).json({ error: `Không thể lấy danh sách video: ${error.message}` });
    }
};

const getVideoById = async (req, res) => {
    try {
        const videoid = req.params.videoid;
        const userid = req.user?.userid; // Có thể null nếu không đăng nhập

        console.log(`🚀 Controller: Fetching video with videoid=${videoid}, userid=${userid}`);

        // Kiểm tra videoid trước khi gọi service
        const parsedVideoid = parseInt(videoid);
        if (isNaN(parsedVideoid) || parsedVideoid <= 0) {
            return res.status(400).json({ error: 'ID video không hợp lệ.' });
        }

        const video = await VideoService.getVideoById(parsedVideoid, userid);

        if (!video) {
            return res.status(404).json({ error: 'Không tìm thấy video.' });
        }

        res.status(200).json(video);
    } catch (error) {
        console.error('❌ Controller: Error fetching video by ID:', error.message);
        if (error.message === 'Invalid video ID') {
            return res.status(400).json({ error: 'ID video không hợp lệ.' });
        }
        if (error.message === 'Video not found') {
            return res.status(404).json({ error: 'Không tìm thấy video.' });
        }
        res.status(500).json({ error: 'Không thể lấy thông tin video.' });
    }
};

const updateVideo = async (req, res) => {
    try {
        const videoid = req.params.videoid;
        const userid = req.user?.userid;
        if (!userid) {
            return res.status(401).json({ error: 'Yêu cầu xác thực.' });
        }

        // Kiểm tra videoid
        const parsedVideoid = parseInt(videoid);
        if (isNaN(parsedVideoid) || parsedVideoid <= 0) {
            return res.status(400).json({ error: 'ID video không hợp lệ.' });
        }

        const updatedVideo = await VideoService.updateVideo(parsedVideoid, req.body);
        res.status(200).json(updatedVideo);
    } catch (error) {
        console.error('❌ Controller: Error updating video:', error.message);
        if (error.message === 'Invalid video ID') {
            return res.status(400).json({ error: 'ID video không hợp lệ.' });
        }
        if (error.message === 'Video not found') {
            return res.status(404).json({ error: 'Không tìm thấy video.' });
        }
        res.status(500).json({ error: 'Không thể cập nhật video.' });
    }
};

const deleteVideo = async (req, res) => {
    try {
        const videoid = req.params.videoid;
        const userid = req.user?.userid;
        if (!userid) {
            return res.status(401).json({ error: 'Yêu cầu xác thực.' });
        }

        // Kiểm tra videoid
        const parsedVideoid = parseInt(videoid);
        if (isNaN(parsedVideoid) || parsedVideoid <= 0) {
            return res.status(400).json({ error: 'ID video không hợp lệ.' });
        }

        const video = await VideoService.getVideoById(parsedVideoid, userid);
        if (!video) {
            return res.status(404).json({ error: 'Không tìm thấy video.' });
        }

        if (video.userid !== userid) {
            return res.status(403).json({ error: 'Bạn không có quyền xóa video này.' });
        }

        await VideoService.deleteVideo(parsedVideoid);
        res.status(204).send();
    } catch (error) {
        console.error('❌ Controller: Error deleting video:', error.message);
        if (error.message === 'Invalid video ID') {
            return res.status(400).json({ error: 'ID video không hợp lệ.' });
        }
        if (error.message === 'Video not found') {
            return res.status(404).json({ error: 'Không tìm thấy video.' });
        }
        res.status(500).json({ error: 'Không thể xóa video.' });
    }
};

const searchVideos = async (req, res) => {
    try {
        const { query, sortBy = 'created_at', viewed, page = 1, limit = 20 } = req.query;
        const currentUserId = req.user?.userid;

        console.log(
            `🚀 Controller: Search videos with query=${query}, sortBy=${sortBy}, viewed=${viewed}, page=${page}, limit=${limit}, userid=${currentUserId}`
        );

        if (!query) {
            return res.status(400).json({ error: 'Thiếu tham số query.' });
        }

        if (!['created_at', 'videoview'].includes(sortBy)) {
            return res.status(400).json({ error: 'Giá trị sortBy không hợp lệ.' });
        }

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        if (isNaN(parsedPage) || parsedPage < 1 || isNaN(parsedLimit) || parsedLimit < 1) {
            return res.status(400).json({ error: 'Trang hoặc giới hạn không hợp lệ.' });
        }

        const result = await VideoService.searchVideos(
            query,
            sortBy,
            viewed === 'true' ? true : viewed === 'false' ? false : null,
            currentUserId,
            parsedPage,
            parsedLimit
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Controller: Error in searchVideos:', error.message);
        if (error.message === 'Thiếu tham số query.' ||
            error.message === 'Giá trị sortBy không hợp lệ.' ||
            error.message === 'Trang hoặc giới hạn không hợp lệ.' ||
            error.message === 'ID người dùng không hợp lệ khi lọc video đã xem.') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Không thể tìm kiếm video.' });
    }
};

const incrementView = async (req, res) => {
    try {
        const videoid = req.params.videoid;

        // Kiểm tra videoid
        const parsedVideoid = parseInt(videoid);
        if (isNaN(parsedVideoid) || parsedVideoid <= 0) {
            return res.status(400).json({ error: 'ID video không hợp lệ.' });
        }

        await VideoService.incrementView(parsedVideoid);
        res.status(200).json({ message: 'Lượt xem đã được cập nhật.' });
    } catch (error) {
        console.error('❌ Controller: Error incrementing view:', error.message);
        if (error.message === 'Invalid video ID') {
            return res.status(400).json({ error: 'ID video không hợp lệ.' });
        }
        res.status(500).json({ error: 'Không thể cập nhật lượt xem.' });
    }
};

const getVideosByType = async (req, res) => {
    try {
        const videotype = parseInt(req.params.videotype);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const excludeId = req.query.exclude ? parseInt(req.query.exclude) : null;

        // Kiểm tra tham số
        if (isNaN(videotype)) {
            return res.status(400).json({ error: 'Loại video không hợp lệ.' });
        }
        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return res.status(400).json({ error: 'Trang hoặc giới hạn không hợp lệ.' });
        }
        if (excludeId !== null && (isNaN(excludeId) || excludeId <= 0)) {
            return res.status(400).json({ error: 'ID loại trừ không hợp lệ.' });
        }

        const videos = await VideoService.getVideosByType(videotype, page, limit, excludeId);
        res.status(200).json(videos);
    } catch (error) {
        console.error('❌ Controller: Error fetching videos by type:', error.message);
        res.status(500).json({ error: 'Không thể lấy video theo loại.' });
    }
};

const getVideosByUserId = async (req, res) => {
    try {
        const userid = parseInt(req.params.userid);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Kiểm tra userid
        if (isNaN(userid) || userid <= 0) {
            return res.status(400).json({ error: 'ID người dùng không hợp lệ.' });
        }
        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return res.status(400).json({ error: 'Trang hoặc giới hạn không hợp lệ.' });
        }

        const videos = await VideoService.getVideosByUserId(userid, page, limit);
        res.status(200).json({
            status: 'OK',
            message: 'Lấy video thành công',
            data: videos,
        });
    } catch (error) {
        console.error('❌ Controller: Error fetching videos by user ID:', error.message);
        res.status(500).json({ error: 'Không thể lấy video của người dùng.' });
    }
};

const getMyVideos = async (req, res) => {
    try {
        const userid = parseInt(req.params.userid);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status !== undefined ? parseInt(req.query.status) : undefined;

        // Kiểm tra userid
        if (isNaN(userid) || userid <= 0) {
            return res.status(400).json({ error: 'ID người dùng không hợp lệ.' });
        }
        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return res.status(400).json({ error: 'Trang hoặc giới hạn không hợp lệ.' });
        }
        if (status !== undefined && ![0, 1].includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
        }

        const videos = await VideoService.getMyVideos(userid, page, limit, status);
        res.status(200).json({
            status: 'OK',
            message: 'Lấy video thành công',
            data: videos,
        });
    } catch (error) {
        console.error('❌ Controller: Error fetching videos by user ID:', error.message);
        res.status(500).json({ error: 'Không thể lấy video của người dùng.' });
    }
};

module.exports = {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    searchVideos,
    incrementView,
    getVideosByType,
    getVideosByUserId,
    getMyVideos
};