import mongoose from "mongoose";
const Schema =mongoose.Schema;

const MessageSchema=new Schema({
    content:{
        type:String,
    required:true
    },
    role:{
        type:String,
       enum: ["user","assistant"],
    required:true
    },
    timeStamp:{
        type:Date,
        default:Date.now,
    }
})

const ThreadSchema=new Schema({
    threadId:{
        type:String,
        required:true,
        unique:true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    title:{
        type:String,
    default:"New Chat"
    },
    messages:[MessageSchema],
    createdAt:{
        type:Date,
        default:Date.now
    },
    
    updatedAt:{
        type:Date,
        default:Date.now
    }
});

export default mongoose.model("Thread",ThreadSchema);