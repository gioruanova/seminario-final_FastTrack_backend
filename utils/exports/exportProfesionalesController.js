const { exportToExcel } = require("./exportConfig");
const {
  fetchProfesionalesDetail,
} = require("../../src/controllers/userController");
const companyConfigController = require("../../src/controllers/companyConfigController");

async function exportProfesionalesToExcel(req, res) {
  const companyId = req.user.company_id;
  const configCompany =
  await companyConfigController.fetchCompanySettingsByCompanyId(companyId);
  const data = await fetchProfesionalesDetail(companyId);

  if (!data.length) {
    res.status(404).json({ error: "No hay profesionales para exportar" });
    return;
  }

  const columns = [
    {
      header: `Nombre ${configCompany.sing_heading_profesional}`,
      key: `Nombre - ${configCompany.sing_heading_profesional}`,
      width: 30,
    },
    { header: "DNI", key: "DNI", width: 20 },
    { header: "Telefono", key: "Telefono", width: 20 },
    { header: "Email", key: "Email", width: 30 },
    {
      header: `${configCompany.sing_heading_especialidad}(s)`,
      key: `${configCompany.sing_heading_especialidad}(s)`,
      width: 40,
    },
  ];

  const fileName = `${configCompany.company.company_nombre} - Reporte Profesionales`;
  const sheetName = `Reporte de ${configCompany.plu_heading_profesional}`;

  await exportToExcel(
    res,
    fileName,
    sheetName,
    columns,
    data,
    configCompany.company,
    req.user
  );
}

module.exports = { exportProfesionalesToExcel };
