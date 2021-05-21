const express = require("express");
const userController = require("../Controllers/userController");
const userValidator = require("../middleware/userValidator");
const { userAuth, vendorOnly } = require("../middleware/userAuth");
const router = express.Router();
const authRouter = require('./socialMediaAuthRoutes');
//const urlencoder = express.urlencoded({ extended: true });

router.use('/auth', authRouter);

router.post('/register', userValidator.registrationValidation, userController.register);

router.post('/login', userValidator.loginValidation, userController.login);

router.get('/logout', userAuth, userController.logout);

router.post('/forgotpassword', userController.forgotPassword);

router.post('/otpverify', userController.verifyOTP);

router.post('/resetpassword', userController.resetPassword);

router.post('/verifyuser', userController.userVerifier);

router.get('/getvendor', userAuth, vendorOnly, userController.getvendor);

router.post('/editprofile', userAuth, userController.editProfile);

module.exports = router;