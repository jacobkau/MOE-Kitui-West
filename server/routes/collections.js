import { Router } from "express";
import crypto from "crypto";
import Collection from "../models/Collection.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const generateSlug = () => crypto.randomBytes(4).toString("hex");

// 1. Create a new Collection
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, term, description, fields, targetCategory } = req.body;
    const collection = await Collection.create({
      name, term, description, fields, targetCategory, publicSlug: generateSlug(),
    });
    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get all Collections (Includes submission count for live updates)
router.get("/", requireAuth, async (req, res) => {
  try {
    const collections = await Collection.find().sort({ createdAt: -1 });
    
    // Attach submission counts to each collection dynamically
    const Submission = (await import("../models/Submission.js")).default;
    const collectionsWithCounts = await Promise.all(collections.map(async (col) => {
      const count = await Submission.countDocuments({ collection: col._id });
      return { ...col.toObject(), submissionCount: count };
    }));

    res.json(collectionsWithCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Get a single Collection by Public Slug
router.get("/public/:slug", async (req, res) => {
  try {
    const collection = await Collection.findOne({ publicSlug: req.params.slug });
    if (!collection) return res.status(404).json({ message: "Form not found" });
    if (collection.status === "closed") return res.status(403).json({ message: "This collection is closed" });
    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Toggle Open/Close status
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: "Not found" });
    collection.status = collection.status === "open" ? "closed" : "open";
    await collection.save();
    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Update an existing Collection (Form)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { name, term, description, fields, targetCategory } = req.body;
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      { name, term, description, fields, targetCategory },
      { new: true }
    );
    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Delete a Collection
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
