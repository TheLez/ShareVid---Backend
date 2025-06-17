const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware'); // Đường dẫn tới middleware
const watchedController = require('../controllers/WatchedController');

const router = express.Router();

// Route lấy tất cả bản ghi đã xem: cần xác thực
router.get('/get-all', authMiddleware, watchedController.getAllWatched);

// Route thêm bản ghi đã xem: cần xác thực
router.post('/add', authMiddleware, watchedController.addWatched);

// Route xóa bản ghi đã xem: cần xác thực
router.delete('/delete/:videoid', authMiddleware, watchedController.deleteWatched);

router.put('/update/:watchedid', authMiddleware, watchedController.updateWatched);

module.exports = router;