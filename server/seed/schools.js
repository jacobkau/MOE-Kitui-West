import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Fixed path (removed ../src/)
import School from "../models/School.js"; 

const sample = [
  { code: "KW-001", name: "Kitui Primary",        category: "public_primary",  zone: "Central" },
  { code: "KW-002", name: "Mutonguni Primary",    category: "public_primary",  zone: "North"   },
  { code: "KW-003", name: "St. Mary's Boys",      category: "private_primary", zone: "South"   },
  { code: "KW-004", name: "Kitui High School",    category: "secondary",       zone: "East"    },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await School.deleteMany({});
  await School.insertMany(sample);
  console.log(`Seeded ${sample.length} schools`);
  await mongoose.disconnect();
};
run();