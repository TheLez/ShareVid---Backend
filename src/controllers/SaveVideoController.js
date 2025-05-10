const {
    getAllSavedVideosByUser,
    addSavedVideo,
    removeSavedVideo,
} = require('../services/SaveVideoService');

const getAll = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực

    try {
        const savedVideos = await getAllSavedVideosByUser(userid);
        return res.status(200).json({
            status: 'OK',
            message: 'Lấy tất cả video đã lưu thành công',
            data: savedVideos,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const create = async (req, res) => {
    const { videoid } = req.body; // Lấy videoid từ body
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực

    try {
        const newSavedVideo = await addSavedVideo(userid, videoid);
        return res.status(201).json({
            status: 'OK',
            message: 'Thêm video đã lưu thành công',
            data: newSavedVideo,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const remove = async (req, res) => {
    const { videoid } = req.params; // Lấy videoid từ params
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực

    try {
        await removeSavedVideo(userid, videoid);
        return res.status(200).json({
            status: 'OK',
            message: 'Xóa video đã lưu thành công',
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAll,
    create,
    remove,
};