const express = require('express');
const router = express.Router();
const LikeVideoController = require('../controllers/LikeVideoController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Lấy danh sách video đã like
router.get('/liked', authMiddleware, LikeVideoController.getLikedVideos);

// Thêm like video
router.post('/like', authMiddleware, LikeVideoController.addLike);

// Xóa like video
router.delete('/unlike/:videoid', authMiddleware, LikeVideoController.removeLike);

module.exports = router;