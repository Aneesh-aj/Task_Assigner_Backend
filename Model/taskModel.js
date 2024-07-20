const mongoose = require("mongoose")


const taskSchema = new mongoose.Schema({
    title:{type:String,require:true},
    summary:{type:String,require:true},
    details:{type:String,require:true},
    assignedUser:{type:mongoose.Types.ObjectId,ref:"user"},
    startTime:{type:Date},
    endTime:{type:Date},
    status:{type:String,default:"pending"},
    createdAt:{type:Date,default:Date.now}
})


const taskModel = mongoose.model("task",taskSchema)

module.exports = taskModel