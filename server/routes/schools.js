import { Router } from "express";
import multer from "multer";
import xlsx from "xlsx";
import School, { ZONES, CATEGORIES } from "../models/School.js";
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

// 5. Meta data (Zones/Categories)
router.get("/meta", (req, res) => {
  res.json({ zones: ZONES, categories: CATEGORIES });
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
      
      // Helper to safely extract strings
      const getVal = (keys) => {
        for (let k of keys) {
          if (row[k] !== undefined && row[k] !== null) return String(row[k]).trim();
        }
        return "";
      };

      const code = getVal(["code", "Code", "CODE"]);
      const name = getVal(["name", "Name", "NAME"]);
      const category = getVal(["category", "Category", "CATEGORY"]).toLowerCase();
      const zone = getVal(["zone", "Zone", "ZONE"]);
      
      // New Fields
      const upnCode = getVal(["upnCode", "UPN Code", "UPN", "upn"]);
      const county = getVal(["county", "County", "COUNTY"]) || "Kitui";
      const subCounty = getVal(["subCounty", "Sub County", "SubCounty"]) || "Kitui West";
      const principalName = getVal(["principalName", "Principal", "HOI", "Headteacher"]);
      const principalPhone = getVal(["principalPhone", "Phone", "Phone Number", "Contact"]);

      if (!code || !name || !category || !zone) {
        errors.push(`Row ${rowNum}: Missing required fields (code, name, category, zone).`);
      } else if (!CATEGORIES.includes(category)) {
        errors.push(`Row ${rowNum}: Invalid category '${category}'. Use: public_primary, private_primary, secondary.`);
      } else if (!ZONES.includes(zone)) {
        errors.push(`Row ${rowNum}: Invalid zone '${zone}'. Use: Central, North, South, East.`);
      } else {
        parsed.push({ 
          code, name, category, zone, 
          upnCode, county, subCounty, principalName, principalPhone 
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

    const result = await School.bulkWrite(operations);
    res.json({ message: "Import successful", result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
