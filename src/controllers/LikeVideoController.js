const LikeVideoService = require('../services/LikeVideoService');

const getLikedVideos = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực

    try {
        const likedVideos = await LikeVideoService.getLikedVideos(userid);
        return res.status(200).json(likedVideos);
    } catch (error) {
        return res.status(500).json({ message: error.message });
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