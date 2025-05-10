const express = require('express');
const router = express.Router();
const accountController = require('../controllers/AccountController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const multer = require('multer');

// Sử dụng memoryStorage để lưu file trong bộ nhớ
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/get-all', authMiddleware, accountController.getAllAccount);
router.get('/get-account/:id', authMiddleware, accountController.getAccountById);
router.post('/sign-up', upload.single('avatar'), accountController.createAccount); // Thêm multer vào đây
router.post('/sign-in', accountController.loginAccount);
router.put('/update-account/:id', authMiddleware, accountController.updateAccount);
router.delete('/delete-account/:id', authMiddleware, accountController.deleteAccount);
router.get('/search', accountController.searchAccountByName);

module.exports = router;