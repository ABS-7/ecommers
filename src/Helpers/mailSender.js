const nodemailer = require('nodemailer');

const hostEmail = process.env.EMAIL;
const password = process.env.PASSWORD;

const otpGenerator = function (length) {
    let otp = '';
    for (let i = 0; i < length; i++)
        otp += '' + Math.floor(Math.random() * 10);
    return otp;
}

const createTransporter = () => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: hostEmail,
            pass: password
        }
    });
    return transporter;
}

const sendOTPMail = async function (email) {
    const transporter = createTransporter();
    const otp = otpGenerator(4);
    const message = {
        from: hostEmail,
        to: email,
        subject: 'OTP for forgot password',
        text: 'The OTP is : ' + otp,
        html: `<p>The OTP is : <b>` + otp + `</b></p>`
    };
    const emailData = await transporter.sendMail(message);
    return { otp: otp };
}

const sendVerificationMail = async function (email, id) {
    const transporter = createTransporter();
    const message = {
        from: hostEmail,
        to: email,
        subject: 'Verification for registartion',
        html: `Click on link to <a href='http://localhost:3001/user/verify/${id}'>verify the email:</a>`
    }
    const emailData = await transporter.sendMail(message);
}

module.exports = {
    sendOTPMail,
    sendVerificationMail
}