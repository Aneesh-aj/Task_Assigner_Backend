const express = require("express")
const mongoose = require('mongoose')
const cookieParser = require("cookie-parser")
const app = express()
const dotenv = require("dotenv")
const cors = require("cors")
dotenv.config()


const corsOptions = {
  origin: 'http://localhost:5173', // Update with your frontend URL
  credentials: true,
};
app.use(cors(corsOptions));

mongoose.connect(process.env.mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const userRoute = require("./Routes/userRoutes")
const adminRoute = require("./Routes/adminRoutes")


app.use("/user",userRoute)
app.use("/admin",adminRoute)


app.listen(3000,()=>{
    console.log(" running on 3000")
})