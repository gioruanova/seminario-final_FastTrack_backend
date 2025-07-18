const ExcelJS = require("exceljs");

async function exportToExcel(res, fileName, sheetName, columns, data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns;

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}".xlsx`);

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { exportToExcel };