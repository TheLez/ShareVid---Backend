const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware'); // Middleware xác thực
const notificationController = require('../controllers/NotificationController');

const router = express.Router();

// Route lấy tất cả thông báo của người dùng: cần xác thực
router.get('/get-all', authMiddleware, notificationController.getAllNotifications);

// Route tạo thông báo mới: cần xác thực
router.post('/create', authMiddleware, notificationController.create);

module.exports = router;