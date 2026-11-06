import mongoose from "mongoose";

const Zones = ["Tulia", "Kauwi", "Musengo", "Katutu"]; 
const Categories = ["public_primary", "private_primary", "secondary"];

const schoolSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: Categories, required: true },
    zone: { type: String, enum: Zones, required: true },
    isActive: { type: Boolean, default: true },

    upnCode: { type: String, trim: true },
    county: { type: String, trim: true, default: "Kitui" },
    subCounty: { type: String, trim: true, default: "Kitui West" },
    principalName: { type: String, trim: true },
    principalPhone: { type: String, trim: true },
  },
  { timestamps: true }
);

export const ZONES = Zones;
export const CATEGORIES = Categories;
export default mongoose.model("School", schoolSchema);
