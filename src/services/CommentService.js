const CommentModel = require('../models/CommentModel'); // Đường dẫn tới model Comment
const AccountModel = require('../models/AccountModel'); // Đường dẫn tới model Account

const getAllComments = async () => {
    return await CommentModel.findAll({
        include: [{
            model: AccountModel,
            attributes: ['userid', 'name', 'avatar'] // Chọn các thuộc tính cần thiết của tài khoản
        }]
    });
};

const getCommentsByVideoId = async (videoid, limit, offset) => {
    return await CommentModel.findAll({
        where: {
            videoid,
            status: 1
        },
        include: [{
            model: AccountModel,
            attributes: ['userid', 'name', 'avatar'],
        }],
        order: [
            ['created_at', 'DESC'],
            ['commentid', 'DESC']
        ], // Sắp xếp mới nhất
        limit,
        offset,
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