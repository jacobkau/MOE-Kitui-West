import { Router } from "express";
import Submission from "../models/Submission.js";
import Collection from "../models/Collection.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// 1. Public Submit (School fills the form via link)
router.post("/public/:slug", async (req, res) => {
  const { schoolId, answers } = req.body;
  
  try {
    const collection = await Collection.findOne({ publicSlug: req.params.slug });
    if (!collection) return res.status(404).json({ message: "Form not found" });
    if (collection.status === "closed") {
      return res.status(403).json({ message: "This collection is closed" });
    }

    // Upsert: Update if exists, Insert if new
    const submission = await Submission.findOneAndUpdate(
      { collection: collection._id, school: schoolId },
      { 
        answers, 
        source: "school_link", 
        ip: req.ip 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Submission saved successfully", submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 5. Check if a school already submitted for a collection
router.get("/check/:collectionId/:schoolId", async (req, res) => {
  try {
    const submission = await Submission.findOne({
      collection: req.params.collectionId,
      school: req.params.schoolId
    });
    // Return just the answers so the frontend can pre-fill them
    res.json({ exists: !!submission, answers: submission ? submission.answers : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 2. Admin: Get all submissions for a collection (for Reports)
router.get("/collection/:collectionId", requireAuth, async (req, res) => {
  try {
    const submissions = await Submission.find({ collection: req.params.collectionId })
      .populate("school", "name code category zone")
      .sort({ updatedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Admin: Office Entry (Submit on behalf of a school)
router.post("/office", requireAuth, async (req, res) => {
  const { collectionId, schoolId, answers } = req.body;
  
  try {
    const submission = await Submission.findOneAndUpdate(
      { collection: collectionId, school: schoolId },
      { 
        answers, 
        source: "office", 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 4. Admin: Delete a submission
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ message: "Submission deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
