import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },      // e.g. pp1_boys
    label: { type: String, required: true },    // e.g. PP1 Boys
    type: {
      type: String,
      enum: ["number", "text", "textarea", "select", "date"],
      default: "number",
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }],                // for select
    group: { type: String, default: "General" },// grouping on form
  },
  { _id: false }
);

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },     // "Term 1 2025 Enrollment"
    term: { type: String, required: true },     // "2025-T1"
    description: { type: String },
    fields: { type: [fieldSchema], default: [] },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    publicSlug: { type: String, required: true, unique: true }, // token in URL
  },
  { timestamps: true }
);

export default mongoose.model("Collection", collectionSchema);