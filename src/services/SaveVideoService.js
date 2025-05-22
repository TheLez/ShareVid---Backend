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
        // Kiểm tra tham số đầu vào
        if (!userid || !videoid) {
            console.warn(`⚠️ Service: Missing userid or videoid`, { userid, videoid });
            return { isSaved: false };
        }

        // Chuẩn hóa kiểu dữ liệu
        const queryUserId = userid;
        const queryVideoId = videoid;

        console.log(`🔍 Service: Checking saved status for user ${queryUserId} and video ${queryVideoId}`);

        // Tìm bản ghi với Sequelize
        const savedVideo = await SavevideoModel.findOne({
            where: {
                userid: queryUserId,
                videoid: queryVideoId,
            }
        });

        console.log(`🔍 Service: Found saved video:`, savedVideo ? savedVideo.toJSON() : null);

        return {
            isSaved: !!savedVideo // true nếu tìm thấy, false nếu không
        };
    } catch (error) {
        console.error('❌ Service: Error checking saved status:', {
            error: error.message,
            userid,
            videoid,
        });
        return { isSaved: false };
    }
};

module.exports = {
    getAllSavedVideosByUser,
    addSavedVideo,
    removeSavedVideo,
    checkSaved
};