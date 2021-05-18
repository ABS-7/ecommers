const userModel = require('../Models/userModel');
const jwtToken = require('../Helpers/tokenGen');

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

module.exports = {
    isRegistered,
}