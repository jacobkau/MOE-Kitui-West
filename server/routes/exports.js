import { Router } from "express";
import ExcelJS from "exceljs";
import Submission from "../models/Submission.js";
import Collection from "../models/Collection.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/excel/:collectionId", requireAuth, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.collectionId);
    if (!collection) return res.status(404).json({ message: "Collection not found" });

    const submissions = await Submission.find({ collection: collection._id })
      .populate("school", "name code category zone");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(collection.name);

    // Define Base Columns
    const columns = [
      { header: "School Code", key: "code", width: 15 },
      { header: "School Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 20 },
      { header: "Zone", key: "zone", width: 15 },
    ];

    // Add dynamic fields and identify groups for totals
    const groups = new Set();
    collection.fields.forEach(field => {
      columns.push({ header: field.label, key: field.key, width: 15 });
      if (field.group) groups.add(field.group);
    });

    worksheet.columns = columns;

    // Populate Rows
    submissions.forEach(sub => {
      const rowData = {
        code: sub.school?.code || "Unknown",
        name: sub.school?.name || "Unknown",
        category: sub.school?.category || "Unknown",
        zone: sub.school?.zone || "Unknown",
      };
      
      collection.fields.forEach(field => {
        rowData[field.key] = sub.answers[field.key] || "";
      });

      worksheet.addRow(rowData);
    });

    // Add Totals at the bottom (e.g., Sum of all Grade 1 Boys and Grade 1 Girls)
    if (submissions.length > 0) {
      const totalRow = { name: "TOTAL SUM", code: "", category: "", zone: "" };
      
      // Initialize total row with 0s
      collection.fields.forEach(field => {
        totalRow[field.key] = 0;
      });

      submissions.forEach(sub => {
        collection.fields.forEach(field => {
          if (field.type === 'number') {
            const val = parseFloat(sub.answers[field.key]) || 0;
            totalRow[field.key] += val;
          }
        });
      });

      const addedRow = worksheet.addRow(totalRow);
      addedRow.font = { bold: true };
      addedRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }; 
    }

    // Formatting Header
    worksheet.getRow(1).font = { bold: true };

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${collection.name}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
