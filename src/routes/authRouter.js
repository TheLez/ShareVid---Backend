const express = require('express');
const router = express.Router();
const { refreshTokenHandler } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Import middleware nếu cần

router.post('/refresh-token', refreshTokenHandler); // Route cho refresh token

module.exports = router;