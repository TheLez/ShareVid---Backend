const { Op } = require('sequelize');
const WatchedModel = require('../models/WatchedModel');
const VideoModel = require('../models/VideoModel');
const AccountModel = require('../models/AccountModel');
const { sequelize } = require('../models');

const getWatchedRecordsByUser = async (userid, limit, offset) => {
    const { count, rows } = await WatchedModel.findAndCountAll({
        where: {
            userid,
            watch_time: { [Op.gt]: '00:00:00' }, // Sử dụng Op.gt thay vì WatchedModel.Sequelize.Op.gt
        },
        attributes: ['watchedid', 'videoid', 'userid', 'created_at', 'watch_time'],
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
            where: { status: 1 },
        }, {
            model: AccountModel,
            attributes: ['userid', 'name'],
            as: 'Account',
        }],
        limit,
        offset,
        order: [['created_at', 'DESC']],
        raw: true,
        nest: true,
    });

    console.log(`🔍 Service: Found ${rows.length} watched records, total: ${count}, video IDs: ${rows.map(v => v.videoid).join(',')}`);
    return { rows, count };
};

const createWatchedRecord = async (userid, videoid) => {
    try {
        if (!userid || !videoid) {
            throw new Error('Thiếu userid hoặc videoid');
        }
        const parsedVideoid = parseInt(videoid);
        if (isNaN(parsedVideoid) || parsedVideoid <= 0) {
            throw new Error('videoid không hợp lệ');
        }

        const record = await WatchedModel.create({
            userid,
            videoid: parsedVideoid,
            watch_time: '00:00:00',
            created_at: new Date(),
        });

        console.log(`🔍 Service: Created watched record, watchedid: ${record.watchedid}`);
        return record.watchedid;
    } catch (error) {
        console.error(`❌ Service: Error creating watched record: ${error.message}`);
        throw error;
    }
};

const removeWatchedRecord = async (userid, videoid) => {
    return await WatchedModel.destroy({
        where: {
            userid,
            videoid,
        },
    });
};

const updateWatchedRecord = async (watchedid, watch_time, created_at, userid) => {
    const transaction = await sequelize.transaction();
    try {
        // Validate input
        if (!watchedid) {
            throw new Error('Thiếu watchedid');
        }
        if (!watch_time || !/^\d{2}:\d{2}:\d{2}$/.test(watch_time)) {
            throw new Error('watch_time không hợp lệ, phải có định dạng HH:MM:SS');
        }

        console.log(`🔍 Service: Attempting to update watched record, watchedid: ${watchedid}`);

        // Tìm bản ghi watched bằng watchedid với khóa
        const record = await WatchedModel.findByPk(watchedid, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!record) {
            throw new Error('Không tìm thấy bản ghi watched');
        }

        // Kiểm tra quyền
        if (record.userid !== userid) {
            throw new Error('Không có quyền cập nhật bản ghi này');
        }

        // Cập nhật bản ghi
        const updatedRecord = await record.update(
            {
                watch_time,
                created_at: created_at || new Date(),
            },
            { transaction }
        );

        console.log(`🔍 Service: Cập nhật bản ghi watched thành công, watchedid: ${updatedRecord.watchedid}`);
        await transaction.commit();
        return updatedRecord;
    } catch (error) {
        await transaction.rollback();
        console.error(`❌ Service: Lỗi khi cập nhật bản ghi watched: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getWatchedRecordsByUser,
    createWatchedRecord,
    removeWatchedRecord,
    updateWatchedRecord
};