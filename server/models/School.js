import mongoose from "mongoose";

const Zones = ["Central", "North", "South", "East"];
const Categories = ["public_primary", "private_primary", "secondary"];

const schoolSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: Categories, required: true },
    zone: { type: String, enum: Zones, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ZONES = Zones;
export const CATEGORIES = Categories;
export default mongoose.model("School", schoolSchema);