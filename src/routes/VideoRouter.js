const express = require('express');
const multer = require('multer');
const { authMiddleware } = require('./middleware/authMiddleware'); // Đường dẫn tới middleware
const videoController = require('./videoController');

const router = express.Router();
const upload = multer(); // Sử dụng multer để xử lý file upload

// Route upload video: cần xác thực
router.post('/upload', authMiddleware, upload.single('video'), videoController.uploadVideo);

// Route lấy tất cả video: không cần xác thực (tuỳ chọn)
router.get('/', videoController.getAllVideos);

// Route lấy video theo ID: không cần xác thực (tuỳ chọn)
router.get('/:videoid', videoController.getVideoById);

// Route cập nhật video: cần xác thực
router.put('/:videoid', authMiddleware, videoController.updateVideo);

// Route xóa video: cần xác thực
router.delete('/:videoid', authMiddleware, videoController.deleteVideo);

module.exports = router;