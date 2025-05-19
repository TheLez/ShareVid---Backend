const LikeVideoService = require('../services/LikeVideoService');

const getLikedVideos = async (req, res) => {
    try {
        const userid = req.user?.userid;
        const { page = 1, limit = 20 } = req.query;

        console.log(`🚀 Controller: Get liked videos for userid=${userid}, page=${page}, limit=${limit}`);

        // Kiểm tra userid
        if (!userid || isNaN(parseInt(userid)) || parseInt(userid) <= 0) {
            return res.status(400).json({ error: 'ID người dùng không hợp lệ.' });
        }

        // Kiểm tra page và limit
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        if (isNaN(parsedPage) || parsedPage < 1 || isNaN(parsedLimit) || parsedLimit < 1) {
            return res.status(400).json({ error: 'Trang hoặc giới hạn không hợp lệ.' });
        }

        const result = await LikeVideoService.getLikedVideos(userid, parsedPage, parsedLimit);

        console.log(`🚀 Controller: Returned ${result.data.length} liked videos, total: ${result.total}`);

        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Controller: Error in getLikedVideos:', error.message);
        if (error.message === 'ID người dùng không hợp lệ.' ||
            error.message === 'Trang hoặc giới hạn không hợp lệ.') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Không thể lấy danh sách video đã thích.' });
    }
};

const addLike = async (req, res) => {
    const userid = req.user.userid;
    const { videoid } = req.params;
    const { type } = req.body; // ✅ Lấy type từ body

    try {
        const newLike = await LikeVideoService.addLike(userid, videoid, type); // ✅ Truyền type
        return res.status(201).json(newLike);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const removeLike = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực
    const { videoid } = req.params; // Lấy videoid từ params

    try {
        const response = await LikeVideoService.removeLike(userid, videoid);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy thông tin like cho một video
const getLikeInfoByVideoId = async (req, res) => {
    const { videoid } = req.params; // Lấy videoid từ params
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực

    try {
        const likeInfo = await LikeVideoService.getLikeInfoByVideoId(userid, videoid);
        return res.status(200).json(likeInfo);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLikedVideos,
    addLike,
    removeLike,
    getLikeInfoByVideoId,
};