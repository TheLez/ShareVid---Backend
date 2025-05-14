const NotificationModel = require('../models/NotificationModel'); // Đường dẫn tới model Notification

const getNotificationsByUserId = async (userid) => {
    return await NotificationModel.findAll({
        where: { userid },
    });
};

const createNotification = async (userid, content) => {
    return await NotificationModel.create({ userid, content, status: 1 });
};

module.exports = {
    getNotificationsByUserId,
    createNotification,
};