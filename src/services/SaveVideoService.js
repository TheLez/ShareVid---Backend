const SavevideoModel = require('../models/SavevideoModel'); // Đường dẫn tới model Savevideo
const VideoModel = require('../models/VideoModel'); // Đường dẫn tới model Video
const AccountModel = require('../models/AccountModel'); // Đường dẫn tới model Account
const { Op } = require('sequelize');

const getAllSavedVideosByUser = async (userid, limit, offset) => {
    const { count, rows } = await SavevideoModel.findAndCountAll({
        where: { userid },
        include: [{
            model: VideoModel,
            required: true,
            attributes: [
                'videoid',
                'title',
                'thumbnail',
                'videoview',
                'created_at',
                'videotype',
                'videolike',
                'videodislike',
                'videodescribe',
                'status',
                'userid'
            ],
            where: { status: 1 }, // Chỉ lấy video công khai
            include: [{
                model: AccountModel,
                attributes: ['userid', 'name'],
            }],
        }],
        limit,
        offset,
        raw: true,
        nest: true,
    });

    console.log(`🔍 Service: Found ${rows.length} saved videos, total: ${count}, video IDs: ${rows.map(v => v.videoid).join(',')}`);
    return { rows, count };
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