const {
    addLikeComment,
    removeLikeComment,
    checkUserCommentLike,
} = require('../services/LikeCommentService');

const create = async (req, res) => {
    const { commentid, type } = req.body; // Lấy commentid và type từ body
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực

    try {
        const newLike = await addLikeComment(userid, commentid, type);
        return res.status(201).json({
            status: 'OK',
            message: 'Thêm like bình luận thành công',
            data: newLike,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const remove = async (req, res) => {
    const { commentid } = req.params; // Lấy commentid từ params
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực

    try {
        await removeLikeComment(userid, commentid);
        return res.status(200).json({
            status: 'OK',
            message: 'Xóa like bình luận thành công',
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Kiểm tra trạng thái like của bình luận
const check = async (req, res) => {
    const { commentid } = req.params; // Lấy commentid từ params
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực

    try {
        const likeStatus = await checkUserCommentLike(userid, commentid);
        return res.status(200).json({
            status: 'OK',
            type: likeStatus, // 1: like, 0: dislike, null: chưa like
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    create,
    remove,
    check, // Xuất hàm kiểm tra trạng thái like
};