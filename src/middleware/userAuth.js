const userModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");

async function userAuth(req, res, next) {
    const jwtKey = process.env.JWT_KEY;
    const token = req.header("Authorization").replace("Bearer ", "");
    const payload = jwt.verify(token, jwtKey);
    const registerdUser = await userModel.findOne({ email: payload.email });
    if (registerdUser != null) {
        if (registerdUser.userType === payload.userType && registerdUser.tokens.length != 0) {
            req.user = registerdUser;
            req.token = token;
            next();
        } else { return res.status(401).json({ message: "unauthorized user" }); }
    } else { return res.status(422).json({ message: 'User not registered' }); }
}

async function vendorOnly(req, res, next) {
    if (req.user.userType === 'vendor') { next(); }
    else { return res.status(401).json({ message: "in mid unauthorized user" }); }
}

async function customerOnly(req, res, next) {
    if (req.user.userType === 'customer') { next(); }
    else { return res.status(401).json({ message: "unauthorized user" }); }
}
module.exports = {
    userAuth,
    vendorOnly,
    customerOnly,
}