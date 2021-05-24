const express = require("express");
const userController = require("../Controllers/userController");
const userValidator = require("../middleware/userValidator");
const { userAuth, vendorOnly } = require("../middleware/userAuth");
const router = express.Router();
const authRouter = require('./socialMediaAuthRoutes');
const store = require("../Config/multer");
//const urlencoder = express.urlencoded({ extended: true });

router.use('/auth', authRouter);


// register, login, logout
router.post('/register', userValidator.registrationValidation, userController.register);
router.post('/login', userValidator.loginValidation, userController.login);
router.get('/logout', userAuth, userController.logout);


//forgot password
router.post('/forgotpassword', userController.forgotPassword);
router.post('/otpverify', userController.verifyOTP);
router.post('/resetpassword', userController.resetPassword);


//profile edition
router.post('/editprofile', userAuth, userController.editProfile);
router.post('/editpassword', userAuth, userController.editPassword);
router.post('/setuserimg',
    userAuth,
    store.UserImgStore.single("userImg"),
    userController.setUserImg);


//verification of email
router.post('/verifyuser', userController.userVerifier);
router.get('/resendverificationemail', userAuth, userController.resendUserVerificationEmail);


router.get('/getvendor', userAuth, vendorOnly, userController.getvendor);

module.exports = router;