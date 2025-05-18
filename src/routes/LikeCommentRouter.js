const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware'); // Middleware xác thực
const likeCommentController = require('../controllers/LikeCommentController');

const router = express.Router();

// Route thêm like bình luận: cần xác thực
router.post('/like-comment', authMiddleware, likeCommentController.create);

// Route xóa like bình luận: cần xác thực
router.delete('/unlike-comment/:commentid', authMiddleware, likeCommentController.remove);

router.get('/like-comment/:commentid', authMiddleware, likeCommentController.check);

module.exports = router;