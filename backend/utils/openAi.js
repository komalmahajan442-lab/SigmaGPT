import "dotenv/config.js";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import "dotenv/config";


const getOpenAPIResponse=async(message)=>{

const option={
    method:"POST",
    headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${process.env.API_KEY}`
    },
    body:JSON.stringify({
        model: "openrouter/auto",
  messages: [
    {
      "role": "user",
      content: message
    }
]
    })
}

try{
const response=await fetch("https://openrouter.ai/api/v1/chat/completions",option);
const data=await response.json();
//console.log(data.choices[0].message.content);
return data.choices[0].message.content || "No response from SigmaGPT";
}catch(err){
    console.log(err);
    res.status(401).json({message:err.message});
}
}

export const auth=async(req,res,next)=>{
const token=req.cookies.token;

if(!token){
 return   res.status(401).json({message:"token not found. Please Login or Signup"});
}

try{
const decode=jwt.verify(token,process.env.SECRET_KEY);
req.userId=decode.userId;
next();
}catch(err){
    console.log(err);
    return res.status(401).json({message:err.message||"Please Create an account to chat"});
}
}

export default getOpenAPIResponse;