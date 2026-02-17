import express, { application } from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js"
import cookieParser from "cookie-parser";

const app=express();
const PORT=8080;
app.use(cookieParser());

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://sigmagptproject.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

/*app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://sigmagptproject.netlify.app"
  ],
  credentials:true,
}));*/

app.use("/api",chatRoutes);

const connectDB=async()=>{
  try{
  await mongoose.connect(process.env.MONGODB_URL);
console.log("DataBase Connected");
  }catch(err){
    console.log(err);
  }}


app.listen(PORT,()=>{
    console.log(`app is listening on ${PORT}`);
    connectDB();
})

