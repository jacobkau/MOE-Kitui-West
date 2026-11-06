import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["number", "text", "textarea", "select", "date"],
      default: "number",
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    group: { type: String, default: "General" },
  },
  { _id: false }
);

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    term: { type: String, required: true },
    description: { type: String },
    
    targetCategory: { 
      type: String, 
      enum: ["all", "primary", "private", "secondary", "primary_private", "primary_secondary"],
      default: "all" 
    },
    
    fields: { type: [fieldSchema], default: [] },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    publicSlug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Collection", collectionSchema);
