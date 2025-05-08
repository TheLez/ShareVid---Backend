const express = require('express');
const router = express.Router();
const accountController = require('../controllers/AccountController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

router.get('/get-all', authMiddleware, accountController.getAllAccount)
router.get('/get-account/:id', authMiddleware, accountController.getAccountById)
router.post('/sign-up', authMiddleware, accountController.createAccount)
router.post('/sign-in', authMiddleware, accountController.loginAccount)
router.put('/update-account/:id', authMiddleware, accountController.updateAccount)
router.delete('/delete-account/:id', authMiddleware, accountController.deleteAccount)

module.exports = router;