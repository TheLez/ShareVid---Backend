const express = require('express');
const router = express.Router();
const accountController = require('../controllers/AccountController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/get-all', accountController.getAllAccount)
router.get('/get-account/:id', accountController.getAccountById)
router.post('/sign-up', accountController.createAccount)
router.post('/sign-in', accountController.loginAccount)
router.put('/update-account/:id', accountController.updateAccount)
router.delete('/delete-account/:id', authMiddleware, accountController.deleteAccount)

module.exports = router;