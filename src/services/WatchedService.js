const WatchedModel = require('../models/WatchedModel'); // Model Watched
const VideoModel = require('../models/VideoModel'); // Model Video
const AccountModel = require('../models/AccountModel'); // Model Account

const getWatchedRecordsByUser = async (userid) => {
    return await WatchedModel.findAll({
        where: { userid },
        include: [{
            model: VideoModel, // Không sử dụng alias
            attributes: ['videoid', 'title'],
        }, {
            model: AccountModel, // Không sử dụng alias
            attributes: ['userid', 'name'],
        }],
    });
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