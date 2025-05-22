const NotificationModel = require('../models/NotificationModel'); // Đường dẫn tới model Notification
const AccountModel = require('../models/AccountModel');

const createNotification = async (userid, content) => {
    return await NotificationModel.create({ userid, content, status: 0 });
};

const countUnreadNotifications = async (userid) => {
    try {
        if (!userid) {
            throw new Error('User ID is required');
        }

        console.log(`Counting unread notifications for userid: ${userid}`);

        const count = await NotificationModel.count({
            where: {
                userid,
                status: 0
            }
        });

        console.log(`Unread notifications count: ${count}`);

        return count;
    } catch (error) {
        console.error('Error counting unread notifications:', error);
        throw new Error(`Failed to count notifications: ${error.message}`);
    }
};

const createReport = async (content, reporterUserId) => {
    try {
        if (!content) {
            throw new Error('Content is required');
        }
        if (!reporterUserId) {
            throw new Error('Reporter user ID is required');
        }

        console.log(`Creating report from userid: ${reporterUserId}, content: ${content}`);

        // Lấy danh sách admin
        const admins = await AccountModel.findAll({
            where: { role: 'admin' },
            attributes: ['userid']
        });

        if (!admins.length) {
            console.warn('No admins found');
            throw new Error('No admins available to receive report');
        }

        console.log('Admins found:', admins.map(a => a.userid));

        // Lấy tên người báo cáo (tùy chọn, để thông báo rõ ràng hơn)
        const reporter = await AccountModel.findByPk(reporterUserId, {
            attributes: ['userid', 'name']
        });
        const reporterName = reporter ? reporter.name : 'Người dùng';

        // Tạo thông báo cho mỗi admin
        const notifications = admins.map(admin => ({
            content: `${reporterName} báo cáo: ${content}`,
            created_at: new Date(),
            status: 0,
            userid: admin.userid
        }));

        await NotificationModel.bulkCreate(notifications);
        console.log('Notifications created for admins:', notifications.length);

        return { message: 'Report submitted successfully', notificationCount: notifications.length };
    } catch (error) {
        console.error('Error creating report:', error);
        throw new Error(`Failed to create report: ${error.message}`);
    }
};

const getNotifications = async (userid, page = 1, limit = 10) => {
    try {
        if (!userid) {
            throw new Error('User ID is required');
        }

        console.log(`Fetching notifications for userid: ${userid}, page: ${page}, limit: ${limit}`);

        const offset = (page - 1) * limit;
        const notifications = await NotificationModel.findAll({
            where: { userid },
            order: [
                ['created_at', 'DESC'],
                ['notificationid', 'DESC']
            ],
            limit,
            offset
        });

        console.log(`Fetched ${notifications.length} notifications`);

        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
};

const markNotificationAsRead = async (notificationId, userid) => {
    try {
        console.log(`Marking notification ${notificationId} as read for userid: ${userid}`);

        const notification = await NotificationModel.findOne({
            where: { notificationid: notificationId, userid }
        });

        if (!notification) {
            throw new Error('Notification not found or not authorized');
        }

        await notification.update({ status: 1 });

        console.log(`Notification ${notificationId} marked as read`);

        return { message: 'Notification marked as read' };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
};

module.exports = {
    createNotification,
    countUnreadNotifications,
    createReport,
    getNotifications,
    markNotificationAsRead
};