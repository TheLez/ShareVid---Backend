const SubscribeModel = require('../models/SubscribeModel');
const { Sequelize } = require('sequelize');

const getAllSubscriptions = async (userid) => {
    return await SubscribeModel.findAll({
        where: { userid: userid },
    });
};

const getSubscriptionByUserId = async (userid) => {
    return await SubscribeModel.findAll({
        where: { userid: userid },
    });
};

const getTopSubscriptions = async (userid) => {
    return await SubscribeModel.findAll({
        attributes: ['useridsub', [Sequelize.fn('COUNT', Sequelize.col('useridsub')), 'count']],
        where: { userid: userid },
        group: ['useridsub'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('useridsub')), 'DESC']],
        limit: 3,
    });
};

const deleteSubscription = async (userid, useridsub) => {
    const deletedCount = await SubscribeModel.destroy({
        where: {
            userid: userid,
            useridsub: useridsub,
        },
    });

    if (deletedCount === 0) {
        return {
            status: 'ERROR',
            message: 'Không tìm thấy subscription để xóa',
        };
    }

    return {
        status: 'OK',
        message: 'Xóa subscription thành công',
    };
};

module.exports = {
    getAllSubscriptions,
    getSubscriptionByUserId,
    getTopSubscriptions,
    deleteSubscription,
};