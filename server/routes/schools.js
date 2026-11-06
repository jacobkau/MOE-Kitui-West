import { Router } from "express";
import multer from "multer";
import xlsx from "xlsx";
import School from "../models/School.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1. Update a single school (Handles all new fields)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { 
      name, code, category, zone, 
      upnCode, county, subCounty, principalName, principalPhone 
    } = req.body;
    
    const school = await School.findByIdAndUpdate(
      req.params.id,
      { name, code, category, zone, upnCode, county, subCounty, principalName, principalPhone },
      { new: true }
    );
    res.json(school);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Delete a school
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await School.findByIdAndDelete(req.params.id);
    res.json({ message: "School deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Public list for dropdowns
router.get("/public-list", async (req, res) => {
  try {
    const schools = await School.find({ isActive: true })
      .select("_id name code zone")
      .sort({ name: 1 });
    res.json(schools);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Get all schools
router.get("/", requireAuth, async (req, res) => {
  const { category, zone, search } = req.query;
  let query = {};
  
  if (category && category !== "all") query.category = category;
  if (zone && zone !== "all") query.zone = zone;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  try {
    const schools = await School.find(query).sort({ code: 1 });
    res.json(schools);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Meta data (fallback just in case)
router.get("/meta", (req, res) => {
  res.json({ 
    zones: ["Tulia", "Kauwi", "Musengo", "Katutu"], 
    categories: ["public_primary", "private_primary", "secondary"] 
  });
});

// 6. Upload Excel/CSV and Preview
router.post("/upload-preview", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const parsed = [];
    const errors = [];

    data.forEach((row, index) => {
      const rowNum = index + 2;
      
      const getVal = (keys) => {
        for (let k of keys) {
          if (row[k] !== undefined && row[k] !== null) return String(row[k]).trim();
        }
        return "";
      };

      const rowValues = Object.values(row).map(v => String(v || "").trim());
      if (rowValues.every(val => val === "")) return;

      let code = getVal(["code", "Code", "CODE"]);
      const name = getVal(["name", "Name", "NAME", "School Name", "SCHOOL NAME"]);
      const category = getVal(["category", "Category", "CATEGORY"]).toLowerCase().replace(" ", "_"); 
      const zone = getVal(["zone", "Zone", "ZONE"]);
      
      const upnCode = getVal(["upnCode", "UPN Code", "UPN", "upn"]);
      const county = getVal(["county", "County", "COUNTY"]) || "Kitui";
      const subCounty = getVal(["subCounty", "Sub County", "SubCounty"]) || "Kitui West";
      const principalName = getVal(["principalName", "Principal", "HOI", "Headteacher"]);
      const principalPhone = getVal(["principalPhone", "Phone", "Phone Number", "Contact"]);

      // FIX: If code is missing or N/A, generate a unique one
      if (!code || code.toUpperCase() === "N/A") {
        const zonePrefix = (zone || "SCH").substring(0, 3).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        code = `${zonePrefix}-${randomNum}`;
      }

      if (!name || !zone) {
        errors.push(`Row ${rowNum}: Missing required fields (name, zone).`);
      } else {
        parsed.push({ 
          code, 
          name, 
          category: category || "private_primary", 
          zone, 
          upnCode, 
          county, 
          subCounty, 
          principalName, 
          principalPhone 
        });
      }
    });

    res.json({ parsed, errors, totalRows: data.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to parse file. Ensure it is a valid Excel/CSV." });
  }
});

// 7. Confirm Import
router.post("/import", requireAuth, async (req, res) => {
  const { schools } = req.body;
  if (!Array.isArray(schools) || schools.length === 0) {
    return res.status(400).json({ message: "No valid schools to import." });
  }

  try {
    const operations = schools.map((s) => ({
      updateOne: {
        filter: { code: s.code },
        update: { $set: s },
        upsert: true,
      },
    }));

    // FIX: ordered: false allows MongoDB to skip duplicates and keep going
    const result = await School.bulkWrite(operations, { ordered: false });
    res.json({ message: "Import successful", result });
  } catch (err) {
    // If there are duplicate errors, we still want to tell the user it succeeded mostly
    if (err.code === 11000) {
      return res.json({ message: "Import completed with some skipped duplicates.", result: err.result });
    }
    res.status(500).json({ message: err.message });
  }
});
// 8. Get School Statistics for Dashboard
router.get("/stats/dashboard", requireAuth, async (req, res) => {
  try {
    const totalSchools = await School.countDocuments();
    
    // Aggregate counts by category
    const categories = await School.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Format categories into an easy object
    const stats = {
      totalSchools,
      public_primary: 0,
      private_primary: 0,
      secondary: 0,
      special: 0,
      other: 0
    };

    categories.forEach(cat => {
      const catName = cat._id.toLowerCase();
      if (catName.includes("public")) stats.public_primary += cat.count;
      else if (catName.includes("private")) stats.private_primary += cat.count;
      else if (catName.includes("secondary") || catName.includes("junior")) stats.secondary += cat.count;
      else if (catName.includes("special")) stats.special += cat.count;
      else stats.other += cat.count;
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
