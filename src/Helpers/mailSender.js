const nodemailer = require('nodemailer');

const hostEmail = process.env.EMAIL;
const password = process.env.PASSWORD;
console.log(password);

const otpGenerator = function (length) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += '' + Math.floor(Math.random() * 10);
    }
    return otp;
}

const sendOTPMail = async function (email) {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: hostEmail,
            pass: password
        }
    });

    const otp = otpGenerator(4);

    let message = {
        from: hostEmail,
        to: email,
        subject: 'OTP for forgot password',
        text: 'The OTP is : ' + otp,
        html: `<p>The OTP is : <b>` + otp + `</b></p>`
    };

    const emailData = await transporter.sendMail(message);

    return {
        otp: otp
    };
}

module.exports = {
    sendOTPMail
}