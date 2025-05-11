const SubscribeModel = require('../models/SubscribeModel');
const VideoModel = require('../models/VideoModel');
const AccountModel = require('../models/AccountModel');
const { Sequelize } = require('sequelize');

const addSubscription = async (userid, useridsub) => {
    // Kiểm tra xem subscription đã tồn tại chưa
    const existingSubscription = await SubscribeModel.findOne({
        where: { userid, useridsub }
    });

    if (existingSubscription) {
        throw new Error('Subscription already exists');
    }

    // Tạo bản ghi mới
    const newSubscription = await SubscribeModel.create({
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
                attributes: ['userid', 'name', 'avatar'], // Chỉ lấy các thuộc tính cần thiết
            }],
            raw: true, // Thêm raw nếu bạn không cần đối tượng model
        });

        // Tính toán số lượng người đăng ký cho mỗi tài khoản
        const subscriptionsWithCounts = await Promise.all(subscriptions.map(async (subscription) => {
            const subscriberCount = await SubscribeModel.count({
                where: { useridsub: subscription.userid }, // Thay đổi để sử dụng userid từ subscription
            });
            return { ...subscription, subscriberCount }; // Trả về thông tin tài khoản và số người đăng ký
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
        const topSubscriptions = await AccountModel.findAll({
            where: { userid: userid }, // Chỉ lấy tài khoản đang đăng nhập
            attributes: ['userid', 'name', 'subscription'], // Lấy userid, name và subscription
            order: [['subscription', 'DESC']], // Sắp xếp theo subscription cao nhất
            limit: 3,
            raw: true, // Cần raw: true để Sequelize không trả về các đối tượng model
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