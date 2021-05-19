const userModel = require('../Models/userModel');
const jwtToken = require('../Helpers/tokenGen');
const { OAuth2Client } = require('google-auth-library')

async function isRegistered(req, res) {
    try {
        const registerdUser = await userModel.findOne({ email: req.body.email });
        if (registerdUser) {
            const token = jwtToken.generateToken(registerdUser.email, registerdUser.userType, registerdUser.name);
            const updateResult = await userModel.updateOne({ email: registerdUser.email }, { $addToSet: { tokens: token } });
            if (updateResult.nModified === 1 && updateResult.ok === 1) {
                return res.status(200).send({
                    user: {
                        name: registerdUser.name,
                        email: registerdUser.email,
                        userName: registerdUser.userName,
                        userType: registerdUser.userType,
                        verified: registerdUser.verified,
                    },
                    token: token
                });
            } else return res.status(500).send({ message: 'database error' });
        } else return res.status(200).send({ message: false });
    } catch (error) { return res.status(500).json({ message: error }); }
}

async function googleAuth(req, res) {
    const data = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const { token } = data
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const { email, name } = ticket.getPayload();
    try {
        const token = jwtToken.generateToken(email, data.userType, name);
        const validData = {
            name: name,
            email: email,
            userType: data.userType,
            tokens: [token],
            verified: true,
            socialLogin: {
                isSocialLogin: true,
                dataAndID: [{
                    platform: data.platform,
                    ID: data.id
                }]
            },
        };

        const result = await userModel.create(validData);

        return res.status(200).send({
            user: {
                name: result.name,
                email: result.email,
                userType: result.userType,
            },
            token: token
        });
    } catch (error) { return res.status(500).send({ message: error }); }
}
module.exports = {
    isRegistered,
    googleAuth,
}