const {
    getAllComments,
    getCommentsByVideoId,
    addComment,
    updateComment,
    deleteComment,
} = require('../services/CommentService');

const getAll = async (req, res) => {
    try {
        const comments = await getAllComments();
        return res.status(200).json({
            status: 'OK',
            message: 'Lấy tất cả bình luận thành công',
            data: comments,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getByVideoId = async (req, res) => {
    const { videoid } = req.params;
    const { page = 1, limit = 5 } = req.query;

    try {
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const offset = (pageNumber - 1) * limitNumber;

        const comments = await getCommentsByVideoId(videoid, limitNumber, offset);

        return res.status(200).json({
            status: 'OK',
            message: 'Lấy bình luận theo video thành công',
            data: comments,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const create = async (req, res) => {
    const { content } = req.body; // Lấy nội dung từ body
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực
    const { videoid } = req.params; // Lấy videoid từ params

    try {
        const newComment = await addComment(content, userid, videoid);
        return res.status(201).json({
            status: 'OK',
            message: 'Thêm bình luận thành công',
            data: newComment,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const update = async (req, res) => {
    const { commentid } = req.params; // Lấy commentid từ params
    const { content } = req.body; // Lấy nội dung mới từ body

    try {
        await updateComment(commentid, content);
        return res.status(200).json({
            status: 'OK',
            message: 'Cập nhật bình luận thành công',
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const remove = async (req, res) => {
    const { commentid } = req.params; // Lấy commentid từ params

    try {
        await deleteComment(commentid);
        return res.status(200).json({
            status: 'OK',
            message: 'Xóa bình luận thành công',
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAll,
    getByVideoId,
    create,
    update,
    remove,
};