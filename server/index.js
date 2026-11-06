import express from "express";
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

// Fixed paths (removed src/)
import authRoutes from "./routes/auth.js";
import schoolRoutes from "./routes/schools.js";
import collectionRoutes from "./routes/collections.js";
import submissionRoutes from "./routes/submissions.js";
import exportRoutes from "./routes/exports.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ 
    message: "MOE Kitui West API is running successfully.",
    health: "/api/health"
  });
});






// TEMPORARY SETUP ROUTE
app.get("/api/setup-admin", async (req, res) => {
  try {
    const bcrypt = (await import("bcryptjs")).default;
    const User = (await import("./models/User.js")).default;

    // Check if admin already exists
    const existing = await User.findOne({ username: process.env.ADMIN_USERNAME });
    if (existing) {
      return res.send("Admin already exists! You can delete this route now.");
    }

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "SCDEMOE1331", 10);
    await User.create({
      username: process.env.ADMIN_USERNAME || "SCDE13331",
      passwordHash,
      role: "admin"
    });

    res.send("Admin created successfully! Go log in, then delete this route from your code.");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});





app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/exports", exportRoutes);

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Mongo connected");
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Server on :${process.env.PORT || 5000}`)
  );
};
start().catch((e) => { console.error(e); process.exit(1); });
