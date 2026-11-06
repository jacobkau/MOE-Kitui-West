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

    // Add dynamic fields from the form
    collection.fields.forEach(field => {
      columns.push({ header: field.label, key: field.key, width: 15 });
    });

    // Add columns for the auto-calculated totals
    const groupedFields = collection.fields.reduce((acc, field) => {
      const group = field.group || 'General';
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    }, {});

    Object.keys(groupedFields).forEach(groupName => {
      // Check if this group has number fields
      const hasNumbers = groupedFields[groupName].some(f => f.type === 'number');
      if (hasNumbers) {
        const totalKey = `total_for_${groupName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        columns.push({ header: `${groupName} Total`, key: totalKey, width: 15 });
      }
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
      
      // Add form answers
      collection.fields.forEach(field => {
        rowData[field.key] = sub.answers[field.key] || "";
      });

      // Add the totals that were saved by the frontend
      Object.keys(groupedFields).forEach(groupName => {
        const totalKey = `total_for_${groupName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        if (sub.answers[totalKey] !== undefined) {
          rowData[totalKey] = sub.answers[totalKey];
        }
      });

      worksheet.addRow(rowData);
    });

    // Formatting
    worksheet.getRow(1).font = { bold: true };

    // Send file
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${collection.name}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
