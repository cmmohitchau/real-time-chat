
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";
import messageRoutes  from "./routes/messageRoutes.js";

const app = express();

dotenv.config();
app.use(express.json());
app.use(cookieParser());
const PORT = 3000;

app.use("/api/auth" , authRoutes);

app.use("/api/message" , messageRoutes);
app.listen(PORT , () => {
    console.log("app is listening on port" , PORT);
    connectDB();
});