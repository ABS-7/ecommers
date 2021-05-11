const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: '../../.env' });
const jwtToken = require("../Helpers/tokenGen");

const soltRounds = process.env.SOLT_ROUNDS || 10;
console.log(soltRounds);

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
            res.status(200).send({
                name: result.name,
                email: result.email,
                password: result.password,
                userType: result.userType,
                userName: result.userName
            });
        } else if (userNameUniqueness != 0) { res.status(422).send({ message: "User name already taken" }); }
        else { res.status(422).send({ message: "email already taken" }); }
    } catch (error) { res.status(500).send({ message: error }); }
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
                    res.status(200).send({
                        name: registerdUser.name,
                        email: registerdUser.email,
                        userName: registerdUser.userName,
                        userType: registerdUser.userType,
                        token: token
                    });
                } else { res.status(500).send({ message: 'dataase error' }); }
            } else { res.status(401).send({ message: 'incorrect password' }); }
        } else { res.status(422).send({ message: 'user not registerd' }); }
    } catch (error) { res.status(500).send({ message: error }); }
}

async function logout(req, res) {
    const data = req.body;
    try {
        const registerdUser = await userModel.updateOne(
            { email: data.email },
            { $pull: { tokens: data.token } });
        console.log(registerdUser);
        if (registerdUser.nModified === 1 && registerdUser.ok === 1) {
            res.status(200).send({ message: 'success' });
        } else { res.status(500).send({ message: 'database error' }); }
    } catch (error) { res.status(500).send({ message: error }); }
}

module.exports = {
    register,
    login,
    logout,
}