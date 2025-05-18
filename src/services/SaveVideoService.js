const SavevideoModel = require('../models/SavevideoModel'); // Đường dẫn tới model Savevideo
const VideoModel = require('../models/VideoModel'); // Đường dẫn tới model Video
const AccountModel = require('../models/AccountModel'); // Đường dẫn tới model Account
const { Op } = require('sequelize');

const getAllSavedVideosByUser = async (userid) => {
    return await SavevideoModel.findAll({
        where: { userid },
        include: [{
            model: VideoModel,
            attributes: ['videoid', 'title', 'description'], // Các thuộc tính cần lấy
            include: [{
                model: AccountModel,
                attributes: ['userid', 'name'], // Lấy thông tin người đăng video
            }],
        }],
    });
};

const addSavedVideo = async (userid, videoid) => {
    return await SavevideoModel.create({ userid, videoid });
};

const removeSavedVideo = async (userid, videoid) => {
    return await SavevideoModel.destroy({
        where: { userid, videoid },
    });
};

const checkSaved = async (userid, videoid) => {
    try {
        console.log(`🔍 Service: Checking saved status for user ${userid} and video ${videoid}`);
        const savedVideo = await SavevideoModel.findOne({ userid, videoid });
        return {
            isSaved: !!savedVideo // Trả về true nếu có bản ghi, false nếu không
        };
    } catch (error) {
        console.error('❌ Service: Error checking saved status:', error);
        throw new Error('Không thể kiểm tra trạng thái lưu video.');
    }
};

module.exports = {
    getAllSavedVideosByUser,
    addSavedVideo,
    removeSavedVideo,
    checkSaved
};