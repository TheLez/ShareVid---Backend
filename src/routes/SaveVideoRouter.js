const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware'); // Middleware xác thực
const saveVideoController = require('../controllers/SaveVideoController');

const router = express.Router();

// Route lấy tất cả video đã lưu của người dùng
router.get('/get-all', authMiddleware, saveVideoController.getAll);

// Route thêm video đã lưu: cần xác thực
router.post('/save', authMiddleware, saveVideoController.create);

// Route xóa video đã lưu: cần xác thực
router.delete('/remove/:videoid', authMiddleware, saveVideoController.remove);

router.get('/saved/:videoid', authMiddleware, saveVideoController.check);

module.exports = router;