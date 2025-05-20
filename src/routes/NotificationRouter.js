const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware'); // Middleware xác thực
const notificationController = require('../controllers/NotificationController');

const router = express.Router();

// Route tạo thông báo mới: cần xác thực
router.post('/create', authMiddleware, notificationController.create);

router.get('/count', authMiddleware, notificationController.countUnreadNotificationsHandler)

router.post('/report', authMiddleware, notificationController.createReportHandler);

router.get('/count', authMiddleware, notificationController.countUnreadNotificationsHandler);
router.get('/get-all', authMiddleware, notificationController.getNotificationsHandler);
router.patch('/:id/read', authMiddleware, notificationController.markNotificationAsReadHandler);

module.exports = router;