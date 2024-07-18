const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateOTP = require('../survice/otpGenerator');
const sendOTPEmail = require('../survice/nodeMailer');
const OTP = require("../Model/otpModel")
const User = require("../Model/userModel")

const secretKey="flksfdlkjsfljsl"

const signup = async (req, res) => {
    try {
        const { name, password, email } = req.body.data;

        if (!name || !password || !email) {
            return res.status(400).json({ error: 'Username, password, and email are required' });
        }
        
        

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        console.log(" the otp",otp)

        await OTP.create({ email, otp });

        const token = jwt.sign(
            { name, email, hashedPassword, otp },
            secretKey,
            { expiresIn: '10h' } 
        );

        res.cookie('signupToken', token, { httpOnly: true, secure: true });
        await sendOTPEmail(email,otp);
       
        res.status(200).json({ message: 'Signup successful, please verify your OTP', success: true, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};


const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body
        const token = req.cookies.signupToken;

        console.log(" tokenss",req.cookies,otp)

        if (!token) {
            return res.status(400).json({ error: 'Token not found,Signup again' });
        }

        const decoded = jwt.verify(token, secretKey);

        const otpData = await OTP.findOne({ email: decoded.email }).exec();

        if (!otpData ) {
            return res.status(400).json({ error: 'OTP Expired' });
        }
         console.log(" otp____",otpData,otp)
        if (otpData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        const newUser = await  User.create({
             name: decoded.name,
            email: decoded.email,
            password: decoded.hashedPassword,
        });
       

        res.clearCookie('signupToken');

        // const authToken = jwt.sign({ userId: newUser._id }, secretKey, { expiresIn: '1h' });

        // res.cookie('authToken',authToken, { httpOnly: true, secure: true });


        res.status(200).json({ message: 'OTP verified, signup complete', authToken ,success:true});
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const resendOtp = async (req, res) => {
    try {
        const token = req.cookies.signupToken;

        if (!token) {
            return res.status(400).json({ error: 'Token not found' });
        }

        const decoded = jwt.verify(token, secretKey);
        const otp = generateOTP();

        await OTP.findOneAndUpdate({ email: decoded.email }, { otp });

        await sendOTPEmail(decoded.email, otp);

        res.status(200).json({ message: 'New OTP sent successfully', success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {signup,verifyOtp,resendOtp}