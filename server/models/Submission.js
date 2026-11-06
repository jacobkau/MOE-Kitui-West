import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    collection: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    source: { type: String, enum: ["office", "school_link"], default: "school_link" },
    ip: { type: String },
  },
  { timestamps: true }
);

submissionSchema.index({ collection: 1, school: 1 }, { unique: true });
export default mongoose.model("Submission", submissionSchema);