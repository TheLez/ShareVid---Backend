const SubscribeModel = require('../models/SubscribeModel');
const VideoModel = require('../models/VideoModel');
const AccountModel = require('../models/AccountModel');
const { Sequelize, Op } = require('sequelize');
const NotificationModel = require('../models/NotificationModel');
const { sequelize } = require('../models'); // Import sequelize instance

// Thêm subscription
const addSubscription = async (userid, useridsub) => {
    const transaction = await sequelize.transaction();
    try {
        // Kiểm tra xem đã đăng ký chưa
        const existingSubscription = await SubscribeModel.findOne({
            where: { userid, useridsub },
            transaction,
        });

        if (existingSubscription) {
            throw new Error('Subscription already exists');
        }

        // Tạo bản ghi đăng ký mới
        const newSubscription = await SubscribeModel.create({
            userid,
            useridsub,
        }, { transaction });

        // Lấy tên người dùng từ AccountModel
        const user = await AccountModel.findByPk(userid, {
            attributes: ['name'],
            transaction,
        });

        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        // Tạo thông báo cho chủ kênh
        const content = `Người dùng ${user.name} đã đăng ký kênh của bạn`;

        await NotificationModel.create({
            content,
            created_at: new Date(),
            status: 0, // Chưa đọc
            userid: useridsub,
        }, { transaction });

        console.log(`🔍 Service: Đã tạo đăng ký và thông báo cho kênh ${useridsub}, người đăng ký: ${user.name}`);
        await transaction.commit();
        return newSubscription;
    } catch (error) {
        await transaction.rollback();
        console.error(`❌ Service: Lỗi khi thêm đăng ký: ${error.message}`);
        throw error;
    }
};

// Lấy tất cả subscriptions của người dùng
const getAllSubscriptions = async (userid, page, limit) => {
    try {
        // Kiểm tra tham số
        if (!userid || isNaN(parseInt(userid)) || parseInt(userid) <= 0) {
            throw new Error('ID người dùng không hợp lệ.');
        }
        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            throw new Error('Trang hoặc giới hạn không hợp lệ.');
        }

        const offset = (page - 1) * limit;

        // Tìm kiếm subscriptions với phân trang
        const { count, rows } = await SubscribeModel.findAndCountAll({
            where: { userid },
            include: [{
                model: AccountModel,
                attributes: ['userid', 'name', 'avatar', 'subscription'],
            }],
            offset,
            limit,
            raw: true,
            nest: true,
        });

        // Map dữ liệu thành định dạng response
        const subscriptions = rows.map(subscription => ({
            userid: subscription.Account.userid,
            name: subscription.Account.name,
            avatar: subscription.Account.avatar,
            subscriberCount: subscription.Account.subscription,
        }));

        return {
            status: 'OK',
            message: 'Lấy thông tin đăng ký thành công',
            data: subscriptions,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        throw new Error(error.message || 'Lấy thông tin đăng ký thất bại');
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
        // Kiểm tra tham số đầu vào
        if (!userid || !useridsub) {
            console.warn(`⚠️ Service: Missing userid or useridsub`, { userid, useridsub });
            return { isSubscribed: false };
        }

        console.log(`🔍 Service: Checking subscription for user ${userid} to channel ${useridsub}`);

        // Tìm bản ghi với Sequelize
        const subscription = await SubscribeModel.findOne({
            where: {
                userid,
                useridsub,
            }
        });

        console.log(`🔍 Service: Query result:`, subscription ? subscription.toJSON() : null);

        return {
            isSubscribed: !!subscription // true nếu có bản ghi, false nếu không
        };
    } catch (error) {
        console.error('❌ Service: Error checking subscription:', {
            error: error.message,
            userid,
            useridsub,
        });
        return { isSubscribed: false };
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
