const CommentModel = require('../models/CommentModel'); // Đường dẫn tới model Comment

const getAllComments = async () => {
    return await CommentModel.findAll();
};

const getCommentsByVideoId = async (videoid) => {
    return await CommentModel.findAll({
        where: { videoid },
    });
};

const addComment = async (content, userid, videoid) => {
    return await CommentModel.create({ content, userid, videoid, status: 1 });
};

const updateComment = async (commentid, content) => {
    return await CommentModel.update({ content }, { where: { commentid } });
};

const deleteComment = async (commentid) => {
    return await CommentModel.destroy({ where: { commentid } });
};

module.exports = {
    getAllComments,
    getCommentsByVideoId,
    addComment,
    updateComment,
    deleteComment,
};