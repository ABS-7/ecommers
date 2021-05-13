const bcrypt = require("bcrypt");
//require("dotenv").config({ path: '../.env' });
const jwtToken = require("../Helpers/tokenGen");

const userModel = require("../Models/userModel");
const mailSender = require("../Helpers/mailSender");

const soltRounds = +process.env.SOLT_ROUNDS || 10;

async function register(req, res) {
    const data = req.body;
    try {
        const userNameUniqueness = await userModel.find({ userName: data.userName }).countDocuments();
        const emailUniqueness = await userModel.find({ email: data.email }).countDocuments();
        if (userNameUniqueness === 0 && emailUniqueness === 0) {
            const validData = {
                name: data.name,
                email: data.email,
                password: await bcrypt.hash(data.password, soltRounds),
                userType: data.userType,
                userName: data.userName
            };
            const result = await userModel.create(validData);
            return res.status(200).send({
                name: result.name,
                email: result.email,
                password: result.password,
                userType: result.userType,
                userName: result.userName
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
                        name: registerdUser.name,
                        email: registerdUser.email,
                        userName: registerdUser.userName,
                        userType: registerdUser.userType,
                        token: token
                    });
                } else { return res.status(500).send({ message: 'dataase error' }); }
            } else { return res.status(401).send({ message: 'incorrect password' }); }
        } else { return res.status(422).send({ message: 'user not registerd' }); }
    } catch (error) { return res.status(500).send({ message: error }); }
}

async function logout(req, res) {
    const data = req.body;
    try {
        const registerdUser = await userModel.updateOne(
            { email: data.email },
            { $pull: { tokens: data.token } });
        if (registerdUser.nModified === 1 && registerdUser.ok === 1) {
            return res.status(200).send({ message: 'success' });
        } else { return res.status(500).send({ message: 'database error' }); }
    } catch (error) { return res.status(500).send({ message: error }); }
}

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
                    name: registerdUser.name
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
                        name: registerdUser.name
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
                    name: registerdUser.name
                });
            } else { return res.status(500).send({ message: 'database error' }); }
        } else { return res.status(422).send({ message: 'user not registerd' }); }
    } catch (error) { return res.status(500).send({ message: '=>' + error }); }
}

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    verifyOTP,
    resetPassword,
}