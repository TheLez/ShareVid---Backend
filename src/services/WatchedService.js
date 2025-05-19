const WatchedModel = require('../models/WatchedModel'); // Model Watched
const VideoModel = require('../models/VideoModel'); // Model Video
const AccountModel = require('../models/AccountModel'); // Model Account

const getWatchedRecordsByUser = async (userid, limit, offset) => {
    const { count, rows } = await WatchedModel.findAndCountAll({
        where: { userid },
        attributes: ['videoid', 'userid', 'created_at'], // Thêm created_at
        include: [{
            model: VideoModel,
            required: true,
            attributes: [
                'videoid',
                'title',
                'thumbnail',
                'videoview',
                'created_at',
            ],
            where: { status: 1 }, // Chỉ lấy video công khai
        }, {
            model: AccountModel,
            attributes: ['userid', 'name'],
            as: 'Account',
        }],
        limit,
        offset,
        order: [['created_at', 'DESC']], // Sắp xếp theo thời gian xem mới nhất
        raw: true,
        nest: true,
    });

    console.log(`🔍 Service: Found ${rows.length} watched records, total: ${count}, video IDs: ${rows.map(v => v.videoid).join(',')}`);
    return { rows, count };
};

const createWatchedRecord = async (userid, videoid) => {
    return await WatchedModel.create({ userid, videoid });
};

const removeWatchedRecord = async (userid, videoid) => {
    return await WatchedModel.destroy({
        where: {
            userid,
            videoid,
        },
    });
};

module.exports = {
    getWatchedRecordsByUser,
    createWatchedRecord,
    removeWatchedRecord,
};