const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware'); // Middleware xác thực
const commentController = require('../controllers/CommentController');

const router = express.Router();

// Route lấy tất cả bình luận
router.get('/get-all', commentController.getAll);

// Route lấy bình luận theo videoid
router.get('/video/:videoid', commentController.getByVideoId);

// Route thêm bình luận: cần xác thực
router.post('/comment/:videoid', authMiddleware, commentController.create);

// Route cập nhật bình luận: cần xác thực
router.put('/update/:commentid', authMiddleware, commentController.update);

// Route xóa bình luận: cần xác thực
router.delete('/delete/:commentid', authMiddleware, commentController.remove);

module.exports = router;