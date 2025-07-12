const ExcelJS = require("exceljs");
const User = require("../models/User");

async function exportUsersByCompany(req, res) {
  try {
    const { company_id } = req.user;

    if (!company_id) {
      return res.status(400).json({ error: "Falta company_id" });
    }

    const users = await User.query().where({
      company_id,
      user_status: true,
    });

    if (users.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron usuarios para esta empresa" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Usuarios");

    worksheet.columns = [
      { header: "ID", key: "user_id", width: 10 },
      { header: "Nombre Completo", key: "user_complete_name", width: 30 },
      { header: "DNI", key: "user_dni", width: 20 },
      { header: "Teléfono", key: "user_phone", width: 15 },
      { header: "Email", key: "user_email", width: 30 },
      { header: "Rol", key: "user_role", width: 15 },
      { header: "Estado", key: "user_status", width: 10 },
    ];

    users.forEach((user) => {
      worksheet.addRow({
        user_id: user.user_id,
        user_complete_name: user.user_complete_name,
        user_dni: user.user_dni,
        user_phone: user.user_phone,
        user_email: user.user_email,
        user_role: user.user_role,
        user_status: user.user_status ? "Activo" : "Inactivo",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=usuarios_empresa_${company_id}.xlsx`
    );

    await workbook.xlsx.write(res);
    return res.end();

  } catch (error) {
    console.error("Error exportando usuarios:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  exportUsersByCompany,
};
