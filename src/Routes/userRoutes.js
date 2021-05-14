const express = require("express");
const userController = require("../Controllers/userController");
const userValidator = require("../middleware/userValidator");
const { userAuth } = require('../middleware/userAuth');
const router = express.Router();
//const urlencoder = express.urlencoded({ extended: true });

router.post('/register', userValidator.registrationValidation, userController.register);

router.post('/login', userValidator.loginValidation, userController.login);

router.post('/logout', userAuth, userController.logout);

router.post('/forgotpassword', userController.forgotPassword);

router.post('/otpverify', userController.verifyOTP);

router.post('/resetpassword', userController.resetPassword);

module.exports = router;