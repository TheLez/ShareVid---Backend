const {
    createNotification,
    countUnreadNotifications,
    createReport,
    getNotifications,
    markNotificationAsRead
} = require('../services/NotificationService');

const create = async (req, res) => {
    const { content } = req.body; // Lấy nội dung từ body
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực

    try {
        const newNotification = await createNotification(userid, content);
        return res.status(201).json({
            status: 'OK',
            message: 'Tạo thông báo thành công',
            data: newNotification,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const countUnreadNotificationsHandler = async (req, res) => {
    try {
        const userid = req.user.userid; // Lấy từ middleware auth
        console.log('Controller: Counting unread notifications for userid:', userid);

        const count = await countUnreadNotifications(userid);

        res.status(200).json({
            message: 'Unread notifications counted successfully',
            data: { count }
        });
    } catch (err) {
        console.error('Controller: Error counting unread notifications:', err);
        res.status(500).json({ error: err.message });
    }
};

const createReportHandler = async (req, res) => {
    try {
        const { content } = req.body;
        const reporterUserId = req.user.userid; // Từ middleware auth

        console.log('Controller: Creating report for userid:', reporterUserId);

        const result = await createReport(content, reporterUserId);

        res.status(201).json({
            message: result.message,
            data: { notificationCount: result.notificationCount }
        });
    } catch (err) {
        console.error('Controller: Error creating report:', err);
        res.status(500).json({ error: err.message });
    }
};

const getNotificationsHandler = async (req, res) => {
    try {
        const userid = req.user.userid;
        const { page = 1, limit = 10 } = req.query;
        console.log('Controller: Fetching notifications for userid:', userid, 'page:', page);

        const notifications = await getNotifications(userid, parseInt(page), parseInt(limit));

        res.status(200).json({
            message: 'Notifications fetched successfully',
            data: notifications
        });
    } catch (err) {
        console.error('Controller: Error fetching notifications:', err);
        res.status(500).json({ error: err.message });
    }
};

const markNotificationAsReadHandler = async (req, res) => {
    try {
        const userid = req.user.userid;
        const { id } = req.params;
        console.log('Controller: Marking notification as read, id:', id, 'userid:', userid);

        const result = await markNotificationAsRead(id, userid);

        res.status(200).json({
            message: result.message
        });
    } catch (err) {
        console.error('Controller: Error marking notification as read:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    create,
    countUnreadNotificationsHandler,
    createReportHandler,
    getNotificationsHandler,
    markNotificationAsReadHandler
};