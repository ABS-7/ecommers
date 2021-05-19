const express = require('express');
const authController = require('../Controllers/mediaAuthController');


const router = express.Router();

router.post('/isRegisterd', authController.isRegistered);

router.post('/google', authController.googleAuth);

module.exports = router;