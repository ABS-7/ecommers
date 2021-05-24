const bcrypt = require("bcrypt");
const path = require('path');
const jwtToken = require("../Helpers/tokenGen");
const userModel = require("../Models/userModel");
const mailSender = require("../Helpers/mailSender");
const productModel = require("../Models/productModel");
const { cwd } = require("process");


const soltRounds = +process.env.SOLT_ROUNDS || 10;


// sign in, up, logout
async function register(req, res) {
    const data = req.body;
    try {
        const userNameUniqueness = await userModel.find({ userName: data.userName }).countDocuments();
        const emailUniqueness = await userModel.find({ email: data.email }).countDocuments();
        if (userNameUniqueness === 0 && emailUniqueness === 0) {
            const token = jwtToken.generateToken(data.email, data.userType, data.name);
            const validData = {
                name: data.name,
                email: data.email,
                password: await bcrypt.hash(data.password, soltRounds),
                userType: data.userType,
                userName: data.userName,
                tokens: [token],
            };
            const result = await userModel.create(validData);

            await mailSender.sendVerificationMail(data.email, result._id);

            return res.status(200).send({
                user: {
                    name: result.name,
                    email: result.email,
                    //password: result.password,
                    userType: result.userType,
                    userName: result.userName,
                    verified: result.verified,
                    isSocialLogin: result.socialLogin.isSocialLogin,
                },
                token: token
            });
        } else if (userNameUniqueness != 0) { return res.status(422).send({ message: "User name already taken" }); }
        else { return res.status(422).send({ message: "email already taken" }); }
    } catch (error) { return res.status(500).send({ message: error }); }
}
async function login(req, res) {
    const data = req.body;
    let validateField;
    if (data.email === '') { validateField = { userName: data.userName }; }
    else { validateField = { email: data.email }; }
    try {
        const registerdUser = await userModel.findOne(validateField);
        if (registerdUser != null) {
            const passwordMatch = bcrypt.compareSync(data.password, registerdUser.password);
            if (passwordMatch) {
                const token = jwtToken.generateToken(registerdUser.email, registerdUser.userType, registerdUser.name);

                const updateResult = await userModel.updateOne(validateField, { $addToSet: { tokens: token } });

                if (updateResult.nModified === 1 && updateResult.ok === 1) {
                    return res.status(200).send({
                        user: {
                            name: registerdUser.name,
                            email: registerdUser.email,
                            userName: registerdUser.userName,
                            userType: registerdUser.userType,
                            verified: registerdUser.verified,
                            isSocialLogin: registerdUser.socialLogin.isSocialLogin,
                        },
                        token: token
                    });
                } else { return res.status(500).send({ message: 'database error' }); }
            } else { return res.status(401).send({ message: 'incorrect password' }); }
        } else { return res.status(422).send({ message: 'user not registerd' }); }
    } catch (error) { return res.status(500).send({ message: error }); }
}
async function logout(req, res) {
    try {
        const registerdUser = await userModel.updateOne(
            { email: req.user.email },
            { $pull: { tokens: req.token } });
        if (registerdUser.nModified === 1 && registerdUser.ok === 1) {
            return res.status(200).send({ message: 'success' });
        } else { return res.status(500).send({ message: 'database error' }); }
    } catch (error) { return res.status(500).send({ message: error }); }
}


// forgot password
async function forgotPassword(req, res) {
    const data = req.body;
    let validateField;
    if (data.email === '') validateField = { userName: data.userName }
    else validateField = { email: data.email }
    try {
        const registerdUser = await userModel.findOne(validateField);
        if (registerdUser != null) {
            const emailData = await mailSender.sendOTPMail(registerdUser.email);

            const addOTPResult = await userModel.updateOne({ email: registerdUser.email }, { otp: emailData.otp })

            if (addOTPResult.nModified === 1 && addOTPResult.ok === 1) {

                setTimeout(async (email, model) => {
                    await model.updateOne({ email: email }, { $unset: { otp: 1 } });
                    console.log("task is done");
                }, 60 * 2 * 1000, registerdUser.email, userModel);

                return res.status(200).send({
                    email: registerdUser.email,
                    userName: registerdUser.userName,
                    userType: registerdUser.userType,
                    name: registerdUser.name,
                    verified: registerdUser.verified,
                });
            } else { return res.status(500).send({ message: 'database error' }); }
        } else { return res.status(422).send({ message: 'user not registerd' }); }
    } catch (error) { return res.status(500).send({ message: error }); }
}
async function verifyOTP(req, res) {
    const data = req.body;
    try {
        const registerdUser = await userModel.findOne({ email: data.email });
        if (registerdUser != null) {
            if (registerdUser.otp === null || registerdUser.otp === undefined)
                return res.status(422).send({ message: 'otp expire' });
            if (registerdUser.otp == data.otp) {
                const removeOTPResult = await userModel.updateOne({ email: registerdUser.email }, { $unset: { otp: 1 } });
                if (removeOTPResult.nModified === 1 && removeOTPResult.ok === 1) {
                    res.status(200).send({
                        email: registerdUser.email,
                        userName: registerdUser.userName,
                        userType: registerdUser.userType,
                        name: registerdUser.name,
                        verified: registerdUser.verified,
                    });
                } else { return res.status(500).send({ message: 'database error' }); }
            } else { return res.status(422).send({ message: 'invalid otp' }); }
        } else { return res.status(422).send({ message: 'user not registerd' }); }
    } catch (error) { return res.status(500).send({ message: error }); }
}
async function resetPassword(req, res) {
    const data = req.body;
    console.log("hello");
    try {
        const registerdUser = await userModel.findOne({ email: data.email });
        if (registerdUser != null) {
            const hashPassword = await bcrypt.hash(data.newPassword, soltRounds);
            const passwordUpdateResult = await userModel.updateOne({ email: data.email }, { password: hashPassword });
            if (passwordUpdateResult.nModified === 1 && passwordUpdateResult.ok === 1) {
                return res.status(200).send({
                    email: registerdUser.email,
                    userName: registerdUser.userName,
                    userType: registerdUser.userType,
                    name: registerdUser.name,
                    verified: registerdUser.verified,
                });
            } else { return res.status(500).json({ message: 'database error' }); }
        } else { return res.status(422).json({ message: 'user not registerd' }); }
    } catch (error) { return res.status(500).json({ message: '=>' + error }); }
}


// user verification
async function userVerifier(req, res) {
    try {
        const verifiedUser = await userModel.updateOne({ _id: req.body.id }, { verified: true });
        if (verifiedUser.nModified === 1 && verifiedUser.ok === 1) {
            res.status(200).json({ message: "success" });
        } else if (verifiedUser.nModified === 0 && verifiedUser.n === 1 && verifiedUser.ok === 1) { return res.status(409).json({ message: 'user already verified' }); }
        else { return res.status(422).send({ message: 'user not registerd' }); }
    } catch (error) { return res.status(500).send({ message: error }); }
}
async function resendUserVerificationEmail(req, res) {
    try {
        await mailSender.sendVerificationMail(req.user.email, req.user._id);
        console.log(req.user.email, req.user._id);
        res.status(200).json({ message: 'success' });
    } catch (error) { return res.status(500).send({ message: error }); }
}


// update profile
async function editProfile(req, res) {
    const data = req.body;
    try {
        const userNameUniqueness = await userModel.find({
            $and: [{ userName: data.userName }, { _id: { $ne: req.user._id } }]
        }).countDocuments();
        const emailUniqueness = await userModel.find({
            $and: [{ email: data.email }, { _id: { $ne: req.user._id } }]
        }).countDocuments();

        if (userNameUniqueness === 0 && emailUniqueness === 0) {
            const newToken = jwtToken.generateToken(data.email, req.user.userType, data.name);

            let newData;
            if (req.user.email !== data.email) {
                newData = {
                    email: data.email,
                    name: data.name,
                    userName: data.userName,
                    tokens: [newToken],
                    verified: false
                };
            } else {
                newData = {
                    name: data.name,
                    userName: data.userName,
                    tokens: [newToken],
                };
            }

            const updatedUserResult = await userModel.updateOne({ _id: req.user._id }, newData);

            if (req.user.email !== data.email)
                await mailSender.sendVerificationMail(data.email, req.user._id);

            return res.status(200).json({
                user: {
                    name: data.name,
                    email: data.email,
                    userType: req.user.userType,
                    userName: data.userName,
                    verified: req.user.verified,
                    isSocialLogin: req.user.socialLogin.isSocialLogin,
                },
                token: newToken
            });
        } else if (userNameUniqueness != 0) { return res.status(422).json({ message: "User name already taken" }); } else { return res.status(422).json({ message: "email already taken" }); }
    } catch (error) { return res.status(500).json({ message: error }); }
}
async function editPassword(req, res) {
    const data = req.body;
    try {
        const passwordMatch = bcrypt.compareSync(data.currentPassword, req.user.password);
        if (passwordMatch) {
            const updatedUserResult = await userModel.updateOne({ _id: req.user._id },
                { password: await bcrypt.hash(data.newPassword, soltRounds) });
            console.log(updatedUserResult);
            if (updatedUserResult.ok === 1) { return res.status(200).json({ message: 'success' }); }
            else { return res.status(500).json({ message: 'database error' }); }
        } else { return res.status(401).json({ message: "current password is incorrect" }); }
    } catch (error) { return res.status(500).json({ message: error }); }
}
async function setUserImg(req, res) {
    try {
        const fullPath = path.join(process.cwd(), req.file.path);
        const updatedUserResult = await userModel.updateOne({ _id: req.user._id }, { profileImg: fullPath });
        if (updatedUserResult.ok === 1 && updatedUserResult.nModified === 1) {
            return res.status(200).json({ message: 'success' });
        } else { return res.status(500).json({ message: 'database error' }); }
    } catch (error) { return res.status(500).json({ message: error }); }
}


// fetch user
async function getvendor(req, res) {
    try {
        const userProducts = await productModel.find({ addedBy: req.user._id });
        return res.status(200).json({
            user: {
                name: req.user.name,
                userType: req.user.userType,
                userName: req.user.userName,
                verified: req.user.verified,
                email: req.user.email,
                products: userProducts,
                isSocialLogin: req.user.socialLogin.isSocialLogin,
            },
        });
    } catch (error) { return res.status(500).json({ message: error }); }
}

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    verifyOTP,
    resetPassword,
    userVerifier,
    getvendor,
    editProfile,
    editPassword,
    resendUserVerificationEmail,
    setUserImg,
}