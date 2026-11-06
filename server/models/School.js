import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true }, 
    zone: { type: String, required: true },    
    isActive: { type: Boolean, default: true },

    upnCode: { type: String, trim: true },
    county: { type: String, trim: true, default: "Kitui" },
    subCounty: { type: String, trim: true, default: "Kitui West" },
    principalName: { type: String, trim: true },
    principalPhone: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("School", schoolSchema);
