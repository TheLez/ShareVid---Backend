const SubscribeModel = require('../models/SubscribeModel');
const VideoModel = require('../models/VideoModel');
const AccountModel = require('../models/AccountModel');
const { Sequelize } = require('sequelize');

const addSubscription = async (userid, useridsub) => {
    // Kiểm tra xem subscription đã tồn tại chưa
    const existingSubscription = await SubscriptionModel.findOne({
        where: { userid, useridsub }
    });

    if (existingSubscription) {
        throw new Error('Subscription already exists');
    }

    // Tạo bản ghi mới
    const newSubscription = await SubscriptionModel.create({
        userid,
        useridsub,
    });

    return newSubscription;
};

const getAllSubscriptions = async (userid) => {
    try {
        const subscriptions = await SubscribeModel.findAll({
            where: { userid: userid },
            include: [{
                model: AccountModel,
                as: 'SubscribedAccount', // Đặt alias để truy cập dễ dàng
                attributes: ['userid', 'name', 'avatar'], // Chỉ lấy các thuộc tính cần thiết
            }],
            group: ['SubscribedAccount.userid'], // Nhóm kết quả theo userid của tài khoản được đăng ký
        });

        // Tính toán số lượng người đăng ký cho mỗi tài khoản
        const subscriptionsWithCounts = await Promise.all(subscriptions.map(async (subscription) => {
            const subscriberCount = await SubscribeModel.count({
                where: { useridsub: subscription.SubscribedAccount.userid },
            });
            return { ...subscription.SubscribedAccount.dataValues, subscriberCount }; // Trả về thông tin tài khoản và số người đăng ký
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

const getSubscriptionByUserId = async (userid) => {
    return await SubscribeModel.findAll({
        where: { userid: userid },
        include: [
            {
                model: VideoModel, // Kết hợp với model Video
                required: true,
                where: { userid: Sequelize.col('Subscribe.useridsub') }, // Lọc video theo useridsub
            },
        ],
    });
};

const getTopSubscriptions = async (userid) => {
    try {
        const topSubscriptions = await SubscribeModel.findAll({
            attributes: [], // Không cần attributes ở đây nữa
            where: { userid: userid },
            include: [{
                model: AccountModel,
                as: 'SubscribedAccount',
                attributes: ['userid', 'name'], // Chỉ cần userid và name
            }],
            group: ['SubscribedAccount.userid'],
            order: [[Sequelize.fn('COUNT', Sequelize.col('SubscribedAccount.userid')), 'DESC']],
            limit: 3,
            raw: true, //  Cần raw: true để Sequelize không trả về các đối tượng model
        });

        //  Chuyển đổi kết quả để dễ sử dụng hơn
        const formattedTopSubscriptions = topSubscriptions.map(subscription => ({
            userid: subscription['SubscribedAccount.userid'],
            name: subscription['SubscribedAccount.name'],
            count: subscription['count'],
        }));

        return {
            status: 'OK',
            message: 'Lấy top 3 người được đăng ký nhiều nhất thành công',
            data: formattedTopSubscriptions,
        };
    } catch (error) {
        console.error('Error fetching top subscriptions:', error);
        return {
            status: 'ERROR',
            message: 'Lấy top 3 người được đăng ký nhiều nhất thất bại',
        };
    }
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
    addSubscription,
    getAllSubscriptions,
    getSubscriptionByUserId,
    getTopSubscriptions,
    deleteSubscription,
};