const LikecommentModel = require('../models/LikecommentModel'); // Đường dẫn tới model Likecomment

const addLikeComment = async (userid, commentid, type) => {
    return await LikecommentModel.create({ userid, commentid, type });
};

const removeLikeComment = async (userid, commentid) => {
    return await LikecommentModel.destroy({
        where: { userid, commentid },
    });
};

module.exports = {
    addLikeComment,
    removeLikeComment,
};