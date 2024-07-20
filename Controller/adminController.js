const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../Model/adminModel'); 
const User = require("../Model/userModel")
const Task = require("../Model/taskModel")
const secretKey = 'your-secret-key'; 


const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body.data

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ error: 'Admin not Exist!!' });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid Password!!' });
        }

        const authToken = jwt.sign({ adminId: admin._id }, secretKey, { expiresIn: '1h' });

        res.cookie('authToken', authToken, { httpOnly: true, secure: true });

        res.status(200).json({ message: 'Login successful', success: true, authToken, admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const createTask= async(req,res)=>{
    try{
         const {title,summary,details,assignedUser} = req.body.data
        const task = await Task.create({title:title,summary:summary,details:details,assignedUser:assignedUser._id})

        if(task){
            res.status(200).json({message:"Task successfully  Created ",success:true})
        }

    }catch(error){
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}


const getUser = async(req,res) => {
    try {
        const users = await User.find({})
        res.status(200).json({success:true,users:users})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getTasks = async(req,res) => {
    try {
        const task = await Task.find({})
        .populate('assignedUser', 'email name _id')  
        .exec();  
        res.status(200).json({success:true,task:task})
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}

const updateTask = async (req, res) => {
    try {
        const { id, formData } = req.body;
        console.log("req", req.body);

        const task = await Task.findByIdAndUpdate(
            id,
            {
                title: formData.title,
                summary: formData.summary,
                details: formData.details
            },
            { new: true } 
        );


        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }
        res.status(200).json({ success: true, task });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};


module.exports = { adminLogin ,createTask,getUser,getTasks,updateTask};
