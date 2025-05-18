const LikecommentModel = require('../models/LikecommentModel'); // Đường dẫn tới model Likecomment

const addLikeComment = async (userid, commentid, type) => {
    return await LikecommentModel.create({ userid, commentid, type });
};

const removeLikeComment = async (userid, commentid) => {
    return await LikecommentModel.destroy({
        where: { userid, commentid },
    });
};

const checkUserCommentLike = async (userid, commentid) => {
    const like = await LikecommentModel.findOne({ where: { userid, commentid } });
    return like ? like.type : null; // Trả về type hoặc null nếu chưa like
};

module.exports = {
    addLikeComment,
    removeLikeComment,
    checkUserCommentLike
};