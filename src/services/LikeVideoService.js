const LikeVideoModel = require('../models/LikevideoModel'); // Import model LikeVideo
const VideoModel = require('../models/VideoModel'); // Import model Video
const AccountModel = require('../models/AccountModel'); // Import model Account

const getLikedVideos = async (userid) => {
    const likedVideos = await LikeVideoModel.findAll({
        where: { userid },
        include: [
            {
                model: VideoModel,
                required: true,
                include: [
                    {
                        model: AccountModel, // Thêm model User để lấy thông tin người dùng
                        attributes: ['userid', 'name', 'avatar'], // Chỉ lấy trường username
                    },
                ],
            },
        ],
    });

    return likedVideos;
};

const addLike = async (userid, videoid, type) => { // ✅ Nhận type
    const existingLike = await LikeVideoModel.findOne({
        where: { userid, videoid }
    });

    if (existingLike) {
        throw new Error('Like already exists');
    }

    const newLike = await LikeVideoModel.create({
        userid,
        videoid,
        type,
        created_at: new Date(),
    });

    return newLike;
};

const removeLike = async (userid, videoid) => {
    // Xóa bản ghi like
    const result = await LikeVideoModel.destroy({
        where: { userid, videoid }
    });

    if (result === 0) {
        throw new Error('Like not found');
    }

    return { message: 'Like removed successfully' };
};

// Lấy thông tin like cho một video
const getLikeInfoByVideoId = async (userid, videoid) => {
    const likeInfo = await LikeVideoModel.findOne({
        where: { userid, videoid }
    });

    if (likeInfo) {
        return { liked: true, type: likeInfo.type }; // Trả về thông tin like
    } else {
        return { liked: false }; // Không có like cho video này
    }
};

module.exports = {
    getLikedVideos,
    addLike,
    removeLike,
    getLikeInfoByVideoId, // Thêm chức năng mới
};