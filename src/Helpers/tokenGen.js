const jwt = require('jsonwebtoken');

function randomKey() {
    const key = [...Array(30)]
        .map((n) => (Math.random() * 36 | 0).toString(36))
        .join('');
    return key;
}

function generateToken(email, userType, name) {
    const jwtKey = randomKey();
    let payload = {
        email: email,
        userType: userType,
        name: name
    };
    const token = jwt.sign(payload, jwtKey);
    return token;
}

module.exports = {
    generateToken: generateToken
}