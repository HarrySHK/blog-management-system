import express from "express"
import cors from 'cors';
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import colors from "colors"
import cookieParser from "cookie-parser"
import { ResHandler } from "./lib/ResponseHandler/resHandler.js"
import morgan from "morgan"
import authRouter from "./routes/auth.js"
import postRouter from "./routes/post.js"
import commentRouter from "./routes/comment.js"
import userRouter from "./routes/user.js"

dotenv.config()

const version = process.env.API_VERSION || 'v1'
const app = express()

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

connectDB()

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(morgan('tiny'));

app.use(`/api/${version}/auth`, authRouter);
app.use(`/api/${version}/posts`, postRouter);
app.use(`/api/${version}/comments`, commentRouter);
app.use(`/api/${version}/users`, userRouter);
app.use(ResHandler);

app.get("/",(req,res)=>{
    res.send("Blog Management System API is running successfully...")
})

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(colors.magenta.italic(`SERVER RUNNING ON PORT ${PORT}`));
})
