const express = require('express');
const router = express.Router();
const accountController = require('../controllers/AccountController');

router.post('/', accountController.createAccount)

module.exports = router;