import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

// Fixed path (removed ../src/)
import User from "../models/User.js"; 

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username, passwordHash, role: "admin" });
  console.log(`Admin created: ${username}`);
  await mongoose.disconnect();
};
run();