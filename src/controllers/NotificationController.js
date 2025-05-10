const {
    getNotificationsByUserId,
    createNotification,
} = require('../services/NotificationService');

const getAllNotifications = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực

    try {
        const notifications = await getNotificationsByUserId(userid);
        return res.status(200).json({
            status: 'OK',
            message: 'Lấy tất cả thông báo thành công',
            data: notifications,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

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

module.exports = {
    getAllNotifications,
    create,
};