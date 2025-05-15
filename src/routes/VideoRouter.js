const express = require('express');
const multer = require('multer');
const path = require('path'); // Thêm import cho module path
const { authMiddleware } = require('../middleware/authMiddleware'); // Đường dẫn tới middleware
const videoController = require('../controllers/VideoController');
const router = express.Router();

// Sử dụng memoryStorage để lưu file trong bộ nhớ
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route upload video: cần xác thực
router.post('/upload', authMiddleware, upload.single('video'), videoController.uploadVideo);

// Route lấy tất cả video: không cần xác thực
router.get('/get-all', videoController.getAllVideos);

// Route lấy video theo ID: không cần xác thực
router.get('/:videoid', authMiddleware, videoController.getVideoById);

// Route cập nhật video: cần xác thực
router.put('update/:videoid', authMiddleware, videoController.updateVideo);

// Route xóa video: cần xác thực
router.delete('delete/:videoid', authMiddleware, videoController.deleteVideo);

router.get('/search', videoController.searchVideo);

router.post('/:videoid/increment-view', authMiddleware, videoController.incrementView);

module.exports = router;