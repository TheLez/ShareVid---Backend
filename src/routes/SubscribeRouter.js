const express = require('express');
const router = express.Router();
const SubscribeController = require('../controllers/SubscribeController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

router.post('/subscribe', authMiddleware, SubscribeController.addSubscription);
// Lấy toàn bộ subscriptions
router.get('/get-all', authMiddleware, SubscribeController.getAllSubscriptions);

// Lấy subscription theo userid
router.get('/get-subscriber/:userid', authMiddleware, SubscribeController.getSubscriptionByUserId);

// Lấy top 3 useridsub có count cao nhất
router.get('/top', authMiddleware, SubscribeController.getTopSubscriptions);

// Xóa subscription
router.delete('/delete-subscribe/:useridsub', authMiddleware, SubscribeController.deleteSubscription);

router.get('/subscribed/:userid', authMiddleware, SubscribeController.checkSubscribe);

module.exports = router;