const express = require('express');
const router = express.Router();
const LikeVideoController = require('../controllers/LikeVideoController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Lấy danh sách video đã like
router.get('/liked', authMiddleware, LikeVideoController.getLikedVideos);

// Thêm like video
router.post('/like/:videoid', authMiddleware, LikeVideoController.addLike);

// Xóa like video
router.delete('/unlike/:videoid', authMiddleware, LikeVideoController.removeLike);

// Lấy thông tin like cho một video
router.get('/video/:videoid', authMiddleware, LikeVideoController.getLikeInfoByVideoId);

module.exports = router;