const userModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");

async function vendorAuth(req, res, next) {
    const jwtKey = process.env.JWT_KEY;
    const token = req.headers.token;
    const payload = jwt.verify(token, jwtKey);
    console.log(payload.email);
    const registerdUser = await userModel.findOne({ email: payload.email });
    console.log(registerdUser);
    if (registerdUser != null) {
        console.log(registerdUser.userType, payload.userType);
        if (registerdUser.userType === payload.userType) {
            req.user = registerdUser;
            next();
        } else { return res.status(401).json({ message: "user must be vendor" }); }
    } else { return res.status(422).json({ message: 'User not registered' }); }
}

async function customerAuth(req, res, next) {
    const token = req.headers.token;
    console.log(token);
    next();
}

module.exports = {
    vendorAuth,
    customerAuth,
}