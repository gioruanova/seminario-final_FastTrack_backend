const ExcelJS = require("exceljs");


async function exportToExcel(
  res,
  fileName,
  sheetName,
  columns,
  data,
  comp,
  user
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  if (sheetName != "Reporte de Reclamos") {
    worksheet.properties.showGridLines = false;
    worksheet.views = [{ showGridLines: false }];
  }

  workbook.creator = user.user_name;
  workbook.lastModifiedBy = user.user_name;
  workbook.company = `${comp.company_nombre} - (${comp.company_unique_id})`;
  workbook.title = sheetName;

  worksheet.columns = columns;

  const headerRow = worksheet.getRow(1);

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0F243E" },
    };
    cell.font = {
      color: { argb: "FFFFFFFF" },
      bold: true,
    };
    cell.alignment = { horizontal: "center" };
  });

  const now = new Date();
  const formatted = now.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  worksheet.insertRow(1, [`${sheetName} actualizado al ${formatted}`]);

  worksheet.mergeCells(1, 1, 1, columns.length);

  const cell = worksheet.getCell("A1");
  cell.font = { bold: true };

  // worksheet.insertRow(2, []);

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow(["Powered by Fast Track"]);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileName}_${Date.now()}.xlsx"`
  );

  try {
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ error: "Error al generar el archivo Excel" });
  }
}

module.exports = { exportToExcel };
