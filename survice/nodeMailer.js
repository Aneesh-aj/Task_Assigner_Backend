// emailSender.js

const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: 'tuser2287@gmail.com', 
            pass: 'nbocstrrriufybdk' 
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Could not send OTP email');
    }
};

module.exports = sendOTPEmail;
