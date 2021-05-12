const nodemailer = require('nodemailer');

const otpGenerator = function (length) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += '' + Math.floor(Math.random() * 10);
    }
    return otp;
}

const sendOTPMail = async function (email) {

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'ellis24@ethereal.email',
            pass: '7JUxdT2DnYpzT18Y6N'
        }
    });

    const otp = otpGenerator(4);

    let message = {
        from: 'Sender Name <sender@example.com>',
        to: email,
        subject: 'OTP for forgot password',
        text: 'The OTP is : ' + otp,
        html: `<p>The OTP is : <b>` + otp + `</b></p>`
    };

    const emailData = await transporter.sendMail(message);

    return {
        url: nodemailer.getTestMessageUrl(emailData),
        otp: otp
    };
}

module.exports = {
    sendOTPMail
}