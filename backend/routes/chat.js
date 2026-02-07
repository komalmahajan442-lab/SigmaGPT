import express, { json } from "express";
import Thread from "../models/Thread.js";

import getOpenAPIResponse from "../utils/openAi.js";
import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import { auth } from "../utils/openAi.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const router=express.Router();

router.get("/thread",auth,async(req,res)=>{
    try{
    const threads=await Thread.find({user:req.userId}).sort({updatedAt:-1})
    res.json(threads);
    }catch(err){
        console.log(err);
        res.status(500).json({message:"failed to fatch thread"});
    }
});

router.get("/thread/:threadId",auth,async(req,res)=>{
try{
const {threadId}=req.params;
const thread=await Thread.findOne({threadId,user:req.userId});

if(!thread){
 return   res.status(404).json({message:"Thread not found"});
}

return res.status(200).json(thread.messages);
}catch(err){
    console.log(err);
  return  res.status(500).json({message:"failed to fetch chat "});
}
})

router.delete("/thread/:threadId",auth,async(req,res)=>{
const {threadId}=req.params;

try{
const thread=await Thread.findOneAndDelete({threadId});

if(!thread){
    res.status(404).json({message:"thread not found"});
}

res.status(200).json({message:"thread deleted sucessfully"});
}catch(err){
    console.log(err);
    res.status(500).json({message:"Falied to fetch thread"});
}
});

router.post("/chat",auth,async(req,res)=>{
    const {threadId,message}=req.body;

    if(!threadId||!message){
        res.status(400).json({message:"Some fields are missing"});
    }

    try{

        let thread=await Thread.findOne({threadId});
        if(!thread){
             thread=new Thread({
                threadId,
                user:req.userId,
                title:message,
                messages:[{role:"user",content:message}]
            })
        }else{
            thread.messages.push({role:"user",content:message})
        }

const assistantReply=await getOpenAPIResponse(message);


thread.messages.push({role:"assistant",content:assistantReply});
thread.updatedAt=new Date();

await thread.save();
res.json({reply:assistantReply,isNewThread: !thread._id, // optional
  thread: {
    threadId: thread.threadId,
    title: thread.title
  }});
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Something went wrong"});
    }
});

router.post("/signup",async (req,res)=>{
    try{
    const {name,email,password}=req.body;
    const hashedPassword=await bcrypt.hash(password,10);

const user=new User({
    name:name,
    email:email,
    password:hashedPassword,
});

await user.save();

res.status(201).json({message:"User registered successfully"});
}catch(err){
    console.log(err);
    res.status(500).json({message:err.message});
}
});

router.post("/login",async(req,res)=>{
    const {email,password}=req.body;
const user=await User.findOne({email});



if(!user){
    return res.status(400).json("User not found");
}

const isMatch=await bcrypt.compare(password,user.password);

if(!isMatch){
  return  res.status(401).json("Invalid Credentials");
}

const token=jwt.sign(
   {userId:user._id},
   process.env.SECRET_KEY,
    {expiresIn:"1d"},
)

res.cookie("token", token, {
    httpOnly: true,     
    secure: false,      
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
  });

res.json({
  message: "Login successful",
  user: {
    id: user._id,
    email: user.email,
    name: user.name
  }
});
})

router.get("/me", auth, async (req, res) => {
    try{
  const user = await User.findById(req.userId).select("-password");
  res.json({ user });
    }catch(err){
res.status(500).message("Invalid Token")
    }
});

router.post("/logout",(req,res)=>{
    res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
  });

  res.json({ message: "Logged out successfully" });
})
export default router;