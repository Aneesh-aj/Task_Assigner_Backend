const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateOTP = require('../survice/otpGenerator');
const sendOTPEmail = require('../survice/nodeMailer');
const OTP = require("../Model/otpModel")
const User = require("../Model/userModel")
const Task = require("../Model/taskModel");
const mongoose = require('mongoose');

const secretKey = "your-secret-key" 

const signup = async (req, res) => {
    try {
        const { name, password, email } = req.body.data;

        if (!name || !password || !email) {
            return res.status(400).json({ error: 'Username, password, and email are required' });
        }



        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        console.log(" the otp", otp)

        await OTP.create({ email, otp });
        const token = jwt.sign(
            { name, email, hashedPassword, otp },
            secretKey,
            { expiresIn: '10h' }
        );

        res.cookie('signupToken', token, { httpOnly: true, secure: true });
        await sendOTPEmail(email, otp);

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

        console.log(" tokenss", req.cookies.signupToken, otp, req.cookies)

        if (!req.cookies.signupToken) {
            return res.status(400).json({ error: 'Token not found, Signup again' });
        }


        const decoded = jwt.verify(token, secretKey);

        const otpData = await OTP.findOne({ email: decoded.email }).exec();

        if (!otpData) {
            return res.status(400).json({ error: 'OTP Expired' });
        }
        console.log(" otp____", otpData, otp)
        if (otpData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        const newUser = await User.create({
            name: decoded.name,
            email: decoded.email,
            password: decoded.hashedPassword,
        });


        res.clearCookie();


        res.status(200).json({ message: 'OTP verified, signup complete', success: true });
    } catch (error) {
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



const login = async (req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'User not Exist!!' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid Password!!' });
        }

        const authToken = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

        res.cookie('authToken', authToken, { httpOnly: true, secure: true });

        res.status(200).json({ message: 'Login successful', success: true, authToken, user });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};


const logout = async (req, res) => {
    try {

        res.clearCookie()

        res.status(200).json({ message: "Logout successful", success: true })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}


const getTasks = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const userId = new mongoose.Types.ObjectId(id);
        const tasks = await Task.find({ assignedUser: userId });
        console.log("Tasks:", tasks);

        res.status(200).json({ tasks, success: true });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const startTask = async (req, res) => {
    const { id, startTime } = req.body;
    const taskId = id
    
    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.startTime = new Date(startTime);
        task.status = "ongoing"
        await task.save();


        res.status(200).json({ message: 'Task start time updated successfully', task,success:true });
    } catch (error) {
        console.error('Error updating task start time:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const endTask = async (req, res) => {
    const { id, endTime } = req.body;

    console.log(" hdhdhd",req.body)
    const taskId = id

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.endTime = new Date(endTime);
        task.status = 'complete';
        await task.save();

        res.status(200).json({ message: 'Task end time updated successfully', task ,success:true});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const fetchTask = async(req,res)=>{
    try{ 
        const {id} = req.params

        const task = await Task.findById(id)
        console.log(" the task",task)
        res.status(200).json({ task, success: true });

    }catch(error){
        res.status(500).json({ message: 'Server error' });
    }
}




module.exports = { signup, verifyOtp, resendOtp, login, logout ,getTasks,startTask,endTask,fetchTask}