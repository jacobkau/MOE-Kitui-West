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
      { header: "School Name", key: "name", width: 35 },
      { header: "Category", key: "category", width: 15 },
      { header: "Zone", key: "zone", width: 15 },
    ];

    // Add dynamic fields from the form, appending the Group Name to the Header
    collection.fields.forEach(field => {
      const headerName = field.group && field.group !== 'General' 
        ? `${field.group} - ${field.label}` 
        : field.label;

      columns.push({ 
        header: headerName, 
        key: field.key, 
        width: 20 
      });
    });

    // Add columns for the auto-calculated totals
    const groupedFields = collection.fields.reduce((acc, field) => {
      const group = field.group || 'General';
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    }, {});

    Object.keys(groupedFields).forEach(groupName => {
      const hasNumbers = groupedFields[groupName].some(f => f.type === 'number');
      if (hasNumbers) {
        const totalKey = `total_for_${groupName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const headerName = groupName !== 'General' ? `${groupName} - Auto Total` : `Total`;
        columns.push({ header: headerName, key: totalKey, width: 20 });
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

    // Formatting Header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }; // Light gray header

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
