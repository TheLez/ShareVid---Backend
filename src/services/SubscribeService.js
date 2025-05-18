const SubscribeModel = require('../models/SubscribeModel');
const VideoModel = require('../models/VideoModel');
const AccountModel = require('../models/AccountModel');
const { Sequelize, Op } = require('sequelize');

// Thêm subscription
const addSubscription = async (userid, useridsub) => {
    const existingSubscription = await SubscribeModel.findOne({
        where: { userid, useridsub }
    });

    if (existingSubscription) {
        throw new Error('Subscription already exists');
    }

    const newSubscription = await SubscribeModel.create({
        userid,
        useridsub,
    });

    return newSubscription;
};

// Lấy tất cả subscriptions của người dùng
const getAllSubscriptions = async (userid) => {
    try {
        const subscriptions = await SubscribeModel.findAll({
            where: { userid },
            include: [{
                model: AccountModel,
                as: 'SubscribedAccount',
                attributes: ['userid', 'name', 'avatar'],
            }],
        });

        const subscriptionsWithCounts = await Promise.all(subscriptions.map(async (subscription) => {
            const subscriberCount = await SubscribeModel.count({
                where: { useridsub: subscription.useridsub },
            });

            return {
                userid: subscription.SubscribedAccount.userid,
                name: subscription.SubscribedAccount.name,
                avatar: subscription.SubscribedAccount.avatar,
                subscriberCount,
            };
        }));

        return {
            status: 'OK',
            message: 'Lấy thông tin đăng ký thành công',
            data: subscriptionsWithCounts,
        };
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return {
            status: 'ERROR',
            message: 'Lấy thông tin đăng ký thất bại',
        };
    }
};

// Lấy tất cả video từ những người mà user đã subscribe
const getSubscriptionByUserId = async (userid) => {
    try {
        return await SubscribeModel.findAll({
            where: { userid },
            include: [
                {
                    model: VideoModel,
                    required: true,
                    where: {
                        userid: Sequelize.col('Subscribe.useridsub'),
                    },
                },
            ],
        });
    } catch (error) {
        console.error('Error fetching subscription videos:', error);
        throw error;
    }
};

// ✅ Lấy top 3 người mà user đã đăng ký có nhiều subscriber nhất
const getTopSubscriptions = async (userid) => {
    try {
        // Lấy tất cả useridsub mà người dùng đã đăng ký
        const subscriptions = await SubscribeModel.findAll({
            where: { userid },
            attributes: ['useridsub'],
            raw: true,
        });

        const subscribedIds = subscriptions.map(sub => sub.useridsub);

        if (subscribedIds.length === 0) {
            return {
                status: 'OK',
                message: 'Người dùng chưa đăng ký ai.',
                data: [],
            };
        }

        const topSubscriptions = await AccountModel.findAll({
            where: {
                userid: { [Op.in]: subscribedIds },
            },
            attributes: ['userid', 'name', 'subscription', 'avatar'],
            order: [['subscription', 'DESC']],
            limit: 3,
            raw: true,
        });

        return {
            status: 'OK',
            message: 'Lấy top 3 người được đăng ký nhiều nhất thành công',
            data: topSubscriptions,
        };
    } catch (error) {
        console.error('Error fetching top subscriptions:', error);
        return {
            status: 'ERROR',
            message: 'Lấy top 3 người được đăng ký nhiều nhất thất bại',
        };
    }
};

// Xoá subscription
const deleteSubscription = async (userid, useridsub) => {
    const deletedCount = await SubscribeModel.destroy({
        where: { userid, useridsub },
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

const checkSubscribe = async (userid, useridsub) => {
    try {
        console.log(`🔍 Service: Checking subscription for user ${userid} to channel ${useridsub}`);
        const subscription = await SubscribeModel.findOne({ userid, useridsub });
        return {
            isSubscribed: !!subscription // Trả về true nếu có bản ghi, false nếu không
        };
    } catch (error) {
        console.error('❌ Service: Error checking subscription:', error);
        throw new Error('Không thể kiểm tra trạng thái đăng ký.');
    }
};

module.exports = {
    addSubscription,
    getAllSubscriptions,
    getSubscriptionByUserId,
    getTopSubscriptions,
    deleteSubscription,
    checkSubscribe
};
